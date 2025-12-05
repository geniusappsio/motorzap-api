#!/usr/bin/env bun

import chalk from 'chalk'

import { FipeImportService } from '@/services/vehicle/fipe-import.service'

/**
 * Script CLI para importação de dados FIPE
 *
 * Uso:
 *   bun run import:fipe
 *   bun src/scripts/import-fipe.ts /caminho/custom.csv
 */

const csvPath = process.argv[2] || './fipe/tabela-fipe-328.csv'
const service = new FipeImportService()

console.log(chalk.magenta.bold('\n🚗 IMPORTAÇÃO CSV FIPE\n'))
console.log(chalk.cyan(`📂 Arquivo: ${csvPath}\n`))

const result = await service.importFromCSV(csvPath)

if (result.isFailure) {
  console.log(chalk.red.bold('\n❌ Importação falhou!\n'))
  console.log(chalk.red(`Erro: ${result.error.message}\n`))
  process.exit(1)
}

const summary = result.value
const durationSeconds = (summary.duration / 1000).toFixed(2)

console.log(chalk.green.bold('\n✅ Importação concluída com sucesso!\n'))
console.log(chalk.cyan(`⏱️  Tempo: ${durationSeconds}s (${summary.duration}ms)`))
console.log(chalk.cyan(`📁 Arquivo: ${summary.csvFile}`))
console.log(chalk.cyan(`📊 Total de linhas: ${summary.totalRows}`))

if (summary.skippedRows > 0) {
  console.log(chalk.yellow(`⚠️  Linhas ignoradas: ${summary.skippedRows}`))
}

console.log(chalk.blue('\n📈 Resultados:'))
console.log(chalk.blue(`   Marcas: ${summary.brandsImported}`))
console.log(chalk.blue(`   Modelos: ${summary.modelsImported}`))
console.log(chalk.blue(`   Anos: ${summary.yearsImported}`))
console.log(chalk.blue(`   Veículos importados: ${summary.vehiclesImported}`))

if (summary.vehiclesUpdated > 0) {
  console.log(chalk.blue(`   Veículos atualizados: ${summary.vehiclesUpdated}`))
}

if (summary.errors.length > 0) {
  console.log(chalk.yellow(`\n⚠️  ${summary.errors.length} erros ocorreram durante a importação`))

  if (summary.errors.length <= 10) {
    console.log(chalk.gray('\nPrimeiros erros:'))
    summary.errors.forEach(error => {
      console.log(chalk.gray(`   Linha ${error.line}: ${error.error}`))
    })
  } else {
    console.log(chalk.gray('\nPrimeiros 10 erros:'))
    summary.errors.slice(0, 10).forEach(error => {
      console.log(chalk.gray(`   Linha ${error.line}: ${error.error}`))
    })
    console.log(chalk.gray(`   ... e mais ${summary.errors.length - 10} erros`))
  }
}

console.log(chalk.green.bold('\n🎉 Importação finalizada!\n'))
process.exit(0)
