import { fail, ok, Result } from '../../shared'
import { InvalidTemplateCategoryError } from '../errors/whatsapp-errors'

export enum TemplateCategoryEnum {
  MARKETING = 'MARKETING',
  UTILITY = 'UTILITY',
  AUTHENTICATION = 'AUTHENTICATION',
}

export class TemplateCategory {
  private readonly value: TemplateCategoryEnum

  private constructor (value: TemplateCategoryEnum) {
    this.value = value
  }

  static create (category: string): Result<TemplateCategory> {
    const normalizedCategory = category.toUpperCase()

    if (!Object.values(TemplateCategoryEnum).includes(normalizedCategory as TemplateCategoryEnum)) {
      return fail(new InvalidTemplateCategoryError(category))
    }

    return ok(new TemplateCategory(normalizedCategory as TemplateCategoryEnum))
  }

  static createUnsafe (category: TemplateCategoryEnum): TemplateCategory {
    return new TemplateCategory(category)
  }

  getValue (): TemplateCategoryEnum {
    return this.value
  }

  isMarketing (): boolean {
    return this.value === TemplateCategoryEnum.MARKETING
  }

  isUtility (): boolean {
    return this.value === TemplateCategoryEnum.UTILITY
  }

  isAuthentication (): boolean {
    return this.value === TemplateCategoryEnum.AUTHENTICATION
  }

  equals (other: TemplateCategory): boolean {
    return this.value === other.value
  }

  toString (): string {
    return this.value
  }
}
