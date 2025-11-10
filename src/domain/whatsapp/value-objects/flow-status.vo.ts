import { fail, ok, Result } from '../../shared'
import { InvalidFlowStatusError } from '../errors/whatsapp-errors'

export enum FlowStatusEnum {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  DEPRECATED = 'DEPRECATED',
  BLOCKED = 'BLOCKED',
  THROTTLED = 'THROTTLED',
}

export class FlowStatus {
  private readonly value: FlowStatusEnum

  private constructor (value: FlowStatusEnum) {
    this.value = value
  }

  static create (status: string): Result<FlowStatus> {
    const normalizedStatus = status.toUpperCase()

    if (!Object.values(FlowStatusEnum).includes(normalizedStatus as FlowStatusEnum)) {
      return fail(new InvalidFlowStatusError(status))
    }

    return ok(new FlowStatus(normalizedStatus as FlowStatusEnum))
  }

  static createUnsafe (status: FlowStatusEnum): FlowStatus {
    return new FlowStatus(status)
  }

  getValue (): FlowStatusEnum {
    return this.value
  }

  isDraft (): boolean {
    return this.value === FlowStatusEnum.DRAFT
  }

  isPublished (): boolean {
    return this.value === FlowStatusEnum.PUBLISHED
  }

  isDeprecated (): boolean {
    return this.value === FlowStatusEnum.DEPRECATED
  }

  isBlocked (): boolean {
    return this.value === FlowStatusEnum.BLOCKED
  }

  canSendMessages (): boolean {
    return this.value === FlowStatusEnum.PUBLISHED
  }

  equals (other: FlowStatus): boolean {
    return this.value === other.value
  }

  toString (): string {
    return this.value
  }
}
