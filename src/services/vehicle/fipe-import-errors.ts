import { DomainError } from '@/shared/domain-error'

/**
 * Erro quando a importação falha
 */
export class ImportFailedError extends DomainError {
  constructor (phase: string, details: string) {
    super('IMPORT_FAILED', `Importação falhou durante ${phase}: ${details}`, 500)
  }
}

/**
 * Erro quando há problemas com dados de referência
 */
export class ReferenceDataError extends DomainError {
  constructor (table: string, details: string) {
    super('REFERENCE_DATA_ERROR', `Erro ao processar dados de referência da tabela ${table}: ${details}`, 500)
  }
}

/**
 * Erro quando há problemas com inserção de detalhes de veículos
 */
export class VehicleDetailsInsertError extends DomainError {
  constructor (details: string) {
    super('VEHICLE_DETAILS_INSERT_ERROR', `Erro ao inserir detalhes de veículos: ${details}`, 500)
  }
}
