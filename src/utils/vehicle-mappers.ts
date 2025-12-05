import { DomainError } from '@/shared/domain-error'
import { fail, ok, type Result } from '@/shared/result'

/**
 * Converte texto para Title Case (primeira letra maiúscula, restante minúscula)
 * Exemplo: "HONDA" → "Honda", "VOLKSWAGEN" → "Volkswagen"
 * @param text Texto a ser convertido
 * @returns Texto em Title Case
 */
export function toTitleCase (text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Erros específicos de mapeamento de veículos
 */
class InvalidVehicleTypeError extends DomainError {
  constructor (type: string) {
    super('INVALID_VEHICLE_TYPE', `Tipo de veículo inválido: ${type}. Valores aceitos: CAR, MOTORCYCLE, TRUCK`, 400)
  }
}

class InvalidPriceFormatError extends DomainError {
  constructor (price: string) {
    super('INVALID_PRICE_FORMAT', `Formato de preço inválido: ${price}`, 400)
  }
}

/**
 * Tipos de veículo aceitos
 */
const VALID_VEHICLE_TYPES = ['CAR', 'MOTORCYCLE', 'TRUCK'] as const
export type VehicleType = typeof VALID_VEHICLE_TYPES[number]

/**
 * Valida se o tipo de veículo é válido
 * @param csvType Tipo do CSV (CAR, MOTORCYCLE, TRUCK)
 * @returns Result com o tipo em Title Case (ex: "Car", "Motorcycle", "Truck")
 */
export function validateVehicleType (csvType: string): Result<string> {
  const upperType = csvType.trim().toUpperCase()

  if (!VALID_VEHICLE_TYPES.includes(upperType as VehicleType)) {
    return fail(new InvalidVehicleTypeError(csvType))
  }

  // Retorna em Title Case
  return ok(toTitleCase(upperType))
}

/**
 * Converte preço do formato brasileiro para decimal
 * Exemplo: "R$ 18.857,00" → "18857.00"
 * @param priceStr Preço em formato brasileiro
 * @returns Preço em formato decimal
 */
export function parsePrice (priceStr: string): Result<string> {
  try {
    // Remove o símbolo de Real e espaços
    let cleaned = priceStr.replace(/R\$\s*/g, '').trim()

    // Remove pontos (separadores de milhar)
    cleaned = cleaned.replace(/\./g, '')

    // Substitui vírgula por ponto (separador decimal)
    cleaned = cleaned.replace(',', '.')

    // Valida se é um número válido
    const numValue = Number.parseFloat(cleaned)
    if (Number.isNaN(numValue)) {
      return fail(new InvalidPriceFormatError(priceStr))
    }

    // Retorna com 2 casas decimais
    return ok(numValue.toFixed(2))
  } catch {
    return fail(new InvalidPriceFormatError(priceStr))
  }
}
