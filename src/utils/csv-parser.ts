import { DomainError } from '@/shared/domain-error'
import { fail, ok, type Result } from '@/shared/result'

/**
 * Erros de parsing CSV
 */
export class CsvFileNotFoundError extends DomainError {
  constructor (path: string) {
    super('CSV_FILE_NOT_FOUND', `Arquivo CSV não encontrado: ${path}`, 404)
  }
}

export class CsvParsingError extends DomainError {
  constructor (message: string, lineNumber?: number) {
    const msg = lineNumber
      ? `Erro ao fazer parse do CSV na linha ${lineNumber}: ${message}`
      : `Erro ao fazer parse do CSV: ${message}`
    super('CSV_PARSING_ERROR', msg, 400)
  }
}

export class InvalidCsvFormatError extends DomainError {
  constructor (lineNumber: number, reason: string) {
    super('INVALID_CSV_FORMAT', `Formato CSV inválido na linha ${lineNumber}: ${reason}`, 400)
  }
}

/**
 * Estrutura de uma linha do CSV FIPE
 */
export interface CsvRow {
  type: string
  brandCode: string
  brandValue: string
  modelCode: string
  modelValue: string
  yearCode: string
  yearValue: string
  codeFipe: string
  fuelLetter: string
  fuelType: string
  price: string
  month: string
}

/**
 * Número esperado de colunas no CSV
 */
const EXPECTED_COLUMNS = 12

/**
 * Parse de uma linha do CSV
 * @param line Linha do CSV
 * @param lineNumber Número da linha (para relatório de erros)
 * @returns Result com CsvRow ou erro
 */
function parseCsvLine (line: string, lineNumber: number): Result<CsvRow> {
  try {
    // Split por vírgula, mas respeitando campos entre aspas
    const columns: string[] = []
    let current = ''
    let insideQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]

      if (char === '"') {
        insideQuotes = !insideQuotes
      } else if (char === ',' && !insideQuotes) {
        columns.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    // Adiciona o último campo
    columns.push(current.trim())

    // Valida número de colunas
    if (columns.length !== EXPECTED_COLUMNS) {
      return fail(
        new InvalidCsvFormatError(
          lineNumber,
          `Esperado ${EXPECTED_COLUMNS} colunas, encontrado ${columns.length}`
        )
      )
    }

    // Remove aspas dos campos se existirem
    const cleanedColumns = columns.map(col => col.replace(/^"|"$/g, ''))

    // Mapeia para CsvRow
    const row: CsvRow = {
      type: cleanedColumns[0],
      brandCode: cleanedColumns[1],
      brandValue: cleanedColumns[2],
      modelCode: cleanedColumns[3],
      modelValue: cleanedColumns[4],
      yearCode: cleanedColumns[5],
      yearValue: cleanedColumns[6],
      codeFipe: cleanedColumns[7],
      fuelLetter: cleanedColumns[8],
      fuelType: cleanedColumns[9],
      price: cleanedColumns[10],
      month: cleanedColumns[11]
    }

    // Validações básicas
    if (!row.codeFipe || row.codeFipe.length === 0) {
      return fail(new InvalidCsvFormatError(lineNumber, 'Código FIPE vazio'))
    }

    if (!row.brandCode || row.brandCode.length === 0) {
      return fail(new InvalidCsvFormatError(lineNumber, 'Código da marca vazio'))
    }

    return ok(row)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    return fail(new CsvParsingError(message, lineNumber))
  }
}

/**
 * Faz parse do arquivo CSV FIPE completo
 * @param filePath Caminho para o arquivo CSV
 * @returns Result com array de CsvRow ou erro
 */
export async function parseFipeCSV (filePath: string): Promise<Result<CsvRow[]>> {
  try {
    // Verifica se o arquivo existe
    const file = Bun.file(filePath)
    const exists = await file.exists()

    if (!exists) {
      return fail(new CsvFileNotFoundError(filePath))
    }

    // Lê o arquivo completo
    const text = await file.text()

    if (!text || text.length === 0) {
      return fail(new CsvParsingError('Arquivo CSV está vazio'))
    }

    // Divide em linhas
    const lines = text.split('\n')

    if (lines.length < 2) {
      return fail(new CsvParsingError('Arquivo CSV deve ter pelo menos cabeçalho e uma linha de dados'))
    }

    // Remove linhas vazias
    const nonEmptyLines = lines.filter(line => line.trim().length > 0)

    // Pula o cabeçalho (primeira linha)
    const dataLines = nonEmptyLines.slice(1)

    const rows: CsvRow[] = []
    const errors: Array<{ line: number; error: string }> = []

    // Parse cada linha
    for (let i = 0; i < dataLines.length; i++) {
      const lineNumber = i + 2 // +2 porque pulamos o cabeçalho e arrays começam em 0
      const result = parseCsvLine(dataLines[i], lineNumber)

      if (result.isSuccess) {
        rows.push(result.value)
      } else {
        errors.push({
          line: lineNumber,
          error: result.error.message
        })
      }
    }

    // Se houver muitos erros (>5%), retorna falha
    const errorRate = errors.length / dataLines.length
    if (errorRate > 0.05) {
      return fail(
        new CsvParsingError(
          `Taxa de erro muito alta: ${(errorRate * 100).toFixed(2)}% das linhas falharam. Primeiros erros: ${errors.slice(0, 5).map(e => `Linha ${e.line}: ${e.error}`).join('; ')}`
        )
      )
    }

    // Se tiver alguns erros mas não muitos, loga mas continua
    if (errors.length > 0) {
      console.warn(`⚠️  ${errors.length} linhas ignoradas devido a erros de parsing`)
    }

    return ok(rows)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    return fail(new CsvParsingError(message))
  }
}
