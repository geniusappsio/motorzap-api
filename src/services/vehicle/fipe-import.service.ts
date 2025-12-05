import chalk from 'chalk'
import { sql } from 'drizzle-orm'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'

import { db } from '@/database/connection'
import { vehicleBrand } from '@/database/schema/vehicles/vehicleBrands'
import { vehicleDetail } from '@/database/schema/vehicles/vehicleDetails'
import { vehicleModel } from '@/database/schema/vehicles/vehicleModels'
import { vehicleYears } from '@/database/schema/vehicles/vehicleYears'
import { fail, ok, type Result } from '@/shared/result'
import { type CsvRow, parseFipeCSV } from '@/utils/csv-parser'
import { parsePrice, toTitleCase, validateVehicleType } from '@/utils/vehicle-mappers'

import type { ImportSummary, ReferenceData } from './fipe-import.types'
import { ImportFailedError, ReferenceDataError, VehicleDetailsInsertError } from './fipe-import-errors'

/**
 * Tamanho do lote para inserções
 */
const BATCH_SIZE = 1000

/**
 * Serviço de importação de dados FIPE
 */
export class FipeImportService {
  constructor (private readonly database: PostgresJsDatabase<any> = db) {}

  /**
   * Importa dados do CSV FIPE para o banco de dados
   * @param filePath Caminho para o arquivo CSV
   * @returns Result com sumário da importação ou erro
   */
  async importFromCSV (filePath: string): Promise<Result<ImportSummary>> {
    const startTime = Date.now()
    const errors: Array<{ line: number; error: string }> = []

    try {
      console.log(chalk.cyan('📂 Lendo arquivo CSV...'))

      // 1. Parse do CSV
      const parseResult = await parseFipeCSV(filePath)
      if (parseResult.isFailure) {
        return fail(parseResult.error)
      }

      const rows = parseResult.value
      console.log(chalk.blue(`📊 Encontrados ${rows.length} registros no CSV`))

      // 2. Extrair dados de referência
      console.log(chalk.cyan('🔍 Extraindo dados de referência...'))
      const referenceDataResult = this.extractReferenceData(rows)
      if (referenceDataResult.isFailure) {
        return fail(referenceDataResult.error)
      }

      const referenceData = referenceDataResult.value
      console.log(chalk.blue(`   Marcas únicas: ${referenceData.brands.length}`))
      console.log(chalk.blue(`   Modelos únicos: ${referenceData.models.length}`))
      console.log(chalk.blue(`   Anos únicos: ${referenceData.years.length}`))

      // 3. Inserir dados em transação
      console.log(chalk.cyan('💾 Iniciando importação...'))

      const result = await this.database.transaction(async (tx) => {
        // Inserir marcas
        console.log(chalk.cyan('   Inserindo marcas...'))
        await tx
          .insert(vehicleBrand)
          .values(referenceData.brands)
          .onConflictDoUpdate({
            target: vehicleBrand.code,
            set: {
              name: sql`EXCLUDED.name`,
              updatedAt: new Date()
            }
          })

        // Inserir modelos
        console.log(chalk.cyan('   Inserindo modelos...'))
        await tx
          .insert(vehicleModel)
          .values(referenceData.models)
          .onConflictDoUpdate({
            target: vehicleModel.code,
            set: {
              name: sql`EXCLUDED.name`,
              updatedAt: new Date()
            }
          })

        // Inserir anos
        console.log(chalk.cyan('   Inserindo anos...'))
        await tx
          .insert(vehicleYears)
          .values(referenceData.years)
          .onConflictDoUpdate({
            target: vehicleYears.code,
            set: {
              name: sql`EXCLUDED.name`,
              updatedAt: new Date()
            }
          })

        // Inserir detalhes de veículos em lotes
        console.log(chalk.cyan('   Inserindo detalhes de veículos...'))
        const detailsResult = await this.insertVehicleDetailsInBatches(tx, rows, errors)

        return detailsResult
      })

      if (result.isFailure) {
        return fail(result.error)
      }

      const { vehiclesImported, vehiclesUpdated } = result.value
      const duration = Date.now() - startTime

      const summary: ImportSummary = {
        success: true,
        duration,
        csvFile: filePath,
        totalRows: rows.length,
        skippedRows: errors.length,
        brandsImported: referenceData.brands.length,
        modelsImported: referenceData.models.length,
        yearsImported: referenceData.years.length,
        vehiclesImported,
        vehiclesUpdated,
        errors
      }

      return ok(summary)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido'
      return fail(new ImportFailedError('execução', message))
    }
  }

  /**
   * Extrai dados de referência únicos do CSV
   * @param rows Linhas do CSV
   * @returns Result com dados de referência ou erro
   */
  private extractReferenceData (rows: CsvRow[]): Result<ReferenceData> {
    try {
      // Usar Maps para deduplicação automática
      const brandsMap = new Map<string, string>()
      const modelsMap = new Map<string, string>()
      const yearsMap = new Map<string, string>()

      for (const row of rows) {
        // Adiciona marca se não existir
        if (!brandsMap.has(row.brandCode)) {
          brandsMap.set(row.brandCode, row.brandValue)
        }

        // Adiciona modelo se não existir
        if (!modelsMap.has(row.modelCode)) {
          modelsMap.set(row.modelCode, row.modelValue)
        }

        // Adiciona ano se não existir
        if (!yearsMap.has(row.yearCode)) {
          yearsMap.set(row.yearCode, row.yearValue)
        }
      }

      // Converte Maps para arrays com Title Case
      const brands = Array.from(brandsMap.entries()).map(([code, name]) => ({
        code,
        name: toTitleCase(name),
        createdAt: new Date(),
        updatedAt: new Date()
      }))

      const models = Array.from(modelsMap.entries()).map(([code, name]) => ({
        code,
        name: toTitleCase(name),
        createdAt: new Date(),
        updatedAt: new Date()
      }))

      const years = Array.from(yearsMap.entries()).map(([code, name]) => ({
        code,
        name: toTitleCase(name),
        createdAt: new Date(),
        updatedAt: new Date()
      }))

      return ok({ brands, models, years })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido'
      return fail(new ReferenceDataError('geral', message))
    }
  }

  /**
   * Insere detalhes de veículos em lotes
   * @param tx Transação do banco
   * @param rows Linhas do CSV
   * @param errors Array de erros para coletar problemas
   * @returns Result com contadores de inserção/atualização
   */
  private async insertVehicleDetailsInBatches (
    tx: PostgresJsDatabase<any>,
    rows: CsvRow[],
    errors: Array<{ line: number; error: string }>
  ): Promise<Result<{ vehiclesImported: number; vehiclesUpdated: number }>> {
    try {
      const totalBatches = Math.ceil(rows.length / BATCH_SIZE)
      let processedCount = 0

      for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        const batch = rows.slice(i, i + BATCH_SIZE)
        const batchIndex = Math.floor(i / BATCH_SIZE) + 1

        console.log(chalk.blue(`   📦 Processando lote ${batchIndex}/${totalBatches} (${batch.length} registros)`))

        // Transforma dados do lote - cada linha é única, sem deduplicação
        const transformedBatch: any[] = []

        for (const row of batch) {
          // Valida tipo de veículo
          const typeResult = validateVehicleType(row.type)
          if (typeResult.isFailure) {
            errors.push({ line: 0, error: `Tipo inválido: ${row.type}` })
            continue
          }

          // Parse de preço
          const priceResult = parsePrice(row.price)
          if (priceResult.isFailure) {
            errors.push({ line: 0, error: `Preço inválido: ${row.price}` })
            continue
          }

          // Adiciona registro ao lote - cada linha é única
          transformedBatch.push({
            id: Bun.randomUUIDv7(),
            brand: row.brandCode,
            model: row.modelCode,
            modelYear: row.yearCode,
            vehicleType: typeResult.value,
            fuel: toTitleCase(row.fuelType),
            fuelAcronym: row.fuelLetter,
            codeFipe: row.codeFipe,
            price: priceResult.value,
            referenceMonth: toTitleCase(row.month),
            createdAt: new Date(),
            updatedAt: new Date()
          })
        }

        if (transformedBatch.length > 0) {
          // Inserir diretamente - cada linha do CSV é única
          await tx.insert(vehicleDetail).values(transformedBatch)
        }

        processedCount += transformedBatch.length
      }

      // Por simplicidade, retornamos o total processado como imported
      // Em uma implementação mais robusta, poderíamos rastrear quais foram updates vs inserts
      return ok({
        vehiclesImported: processedCount,
        vehiclesUpdated: 0
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido'
      return fail(new VehicleDetailsInsertError(message))
    }
  }
}
