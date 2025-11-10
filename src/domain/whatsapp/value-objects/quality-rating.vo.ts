import { fail, ok, Result } from '../../shared'
import { InvalidQualityRatingError } from '../errors/whatsapp-errors'

export enum QualityRatingEnum {
  GREEN = 'GREEN',
  YELLOW = 'YELLOW',
  RED = 'RED',
  NA = 'NA',
}

export class QualityRating {
  private readonly value: QualityRatingEnum

  private constructor (value: QualityRatingEnum) {
    this.value = value
  }

  static create (rating: string): Result<QualityRating> {
    const normalizedRating = rating.toUpperCase()

    if (!Object.values(QualityRatingEnum).includes(normalizedRating as QualityRatingEnum)) {
      return fail(new InvalidQualityRatingError(rating))
    }

    return ok(new QualityRating(normalizedRating as QualityRatingEnum))
  }

  static createUnsafe (rating: QualityRatingEnum): QualityRating {
    return new QualityRating(rating)
  }

  getValue (): QualityRatingEnum {
    return this.value
  }

  isGreen (): boolean {
    return this.value === QualityRatingEnum.GREEN
  }

  isYellow (): boolean {
    return this.value === QualityRatingEnum.YELLOW
  }

  isRed (): boolean {
    return this.value === QualityRatingEnum.RED
  }

  isNA (): boolean {
    return this.value === QualityRatingEnum.NA
  }

  equals (other: QualityRating): boolean {
    return this.value === other.value
  }

  toString (): string {
    return this.value
  }
}
