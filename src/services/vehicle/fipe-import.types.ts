/**
 * Sumário do resultado da importação
 */
export interface ImportSummary {
  success: boolean
  duration: number
  csvFile: string
  totalRows: number
  skippedRows: number
  brandsImported: number
  modelsImported: number
  yearsImported: number
  vehiclesImported: number
  vehiclesUpdated: number
  errors: Array<{ line: number; error: string }>
}

/**
 * Dados de referência extraídos do CSV
 */
export interface ReferenceData {
  brands: Array<{ code: string; name: string }>
  models: Array<{ code: string; name: string }>
  years: Array<{ code: string; name: string }>
}
