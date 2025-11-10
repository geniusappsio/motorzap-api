import { fail, ok, Result } from '../../shared'
import { InvalidTemplateStatusError } from '../errors/whatsapp-errors'

export enum TemplateStatusEnum {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PAUSED = 'PAUSED',
  DISABLED = 'DISABLED',
  ARCHIVED = 'ARCHIVED',
}

export class TemplateStatus {
  private readonly value: TemplateStatusEnum

  private constructor (value: TemplateStatusEnum) {
    this.value = value
  }

  static create (status: string): Result<TemplateStatus> {
    const normalizedStatus = status.toUpperCase()

    if (!Object.values(TemplateStatusEnum).includes(normalizedStatus as TemplateStatusEnum)) {
      return fail(new InvalidTemplateStatusError(status))
    }

    return ok(new TemplateStatus(normalizedStatus as TemplateStatusEnum))
  }

  static createUnsafe (status: TemplateStatusEnum): TemplateStatus {
    return new TemplateStatus(status)
  }

  getValue (): TemplateStatusEnum {
    return this.value
  }

  isPending (): boolean {
    return this.value === TemplateStatusEnum.PENDING
  }

  isApproved (): boolean {
    return this.value === TemplateStatusEnum.APPROVED
  }

  isRejected (): boolean {
    return this.value === TemplateStatusEnum.REJECTED
  }

  canSendMessages (): boolean {
    return this.value === TemplateStatusEnum.APPROVED
  }

  equals (other: TemplateStatus): boolean {
    return this.value === other.value
  }

  toString (): string {
    return this.value
  }
}
