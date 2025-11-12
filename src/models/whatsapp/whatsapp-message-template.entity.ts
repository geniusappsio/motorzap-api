import { randomUUID } from 'crypto'

import { BaseEntity, fail, ok, Result } from '@/shared'
import { InvalidWhatsAppMessageTemplateDataError } from './whatsapp-errors'
import { QualityRating, TemplateCategory, TemplateStatus, TemplateStatusEnum } from '../value-objects'

export interface WhatsAppMessageTemplateProps {
  wabaId: string;
  metaTemplateId: string;
  name: string;
  language: string;
  status: TemplateStatus;
  category: TemplateCategory;
  previousCategory?: string;
  components: any[];
  rejectedReason?: string;
  rejectedAt?: Date;
  qualityScore?: QualityRating;
  qualityScoreDate?: Date;
  totalSent: number;
  totalDelivered: number;
  totalRead: number;
  lastUsedAt?: Date;
  isActive: boolean;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class WhatsAppMessageTemplate extends BaseEntity<WhatsAppMessageTemplateProps> {
  constructor (props: WhatsAppMessageTemplateProps, id: string) {
    super(props, id)
  }

  static create (data: {
    wabaId: string;
    metaTemplateId: string;
    name: string;
    language: string;
    status?: TemplateStatus;
    category: TemplateCategory;
    components: any[];
    previousCategory?: string;
  }): Result<WhatsAppMessageTemplate> {
    const validation = WhatsAppMessageTemplate.validateCreateData(data)
    if (validation.isFailure) {
      return validation
    }

    const template = new WhatsAppMessageTemplate(
      {
        wabaId: data.wabaId,
        metaTemplateId: data.metaTemplateId,
        name: data.name,
        language: data.language,
        status: data.status ?? TemplateStatus.createUnsafe(TemplateStatusEnum.PENDING),
        category: data.category,
        previousCategory: data.previousCategory,
        components: data.components,
        totalSent: 0,
        totalDelivered: 0,
        totalRead: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      randomUUID()
    )

    return ok(template)
  }

  static reconstitute (data: {
    id: string;
    wabaId: string;
    metaTemplateId: string;
    name: string;
    language: string;
    status: TemplateStatus;
    category: TemplateCategory;
    previousCategory?: string;
    components: any[];
    rejectedReason?: string;
    rejectedAt?: Date;
    qualityScore?: QualityRating;
    qualityScoreDate?: Date;
    totalSent: number;
    totalDelivered: number;
    totalRead: number;
    lastUsedAt?: Date;
    isActive: boolean;
    approvedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
  }): WhatsAppMessageTemplate {
    return new WhatsAppMessageTemplate(
      {
        wabaId: data.wabaId,
        metaTemplateId: data.metaTemplateId,
        name: data.name,
        language: data.language,
        status: data.status,
        category: data.category,
        previousCategory: data.previousCategory,
        components: data.components,
        rejectedReason: data.rejectedReason,
        rejectedAt: data.rejectedAt,
        qualityScore: data.qualityScore,
        qualityScoreDate: data.qualityScoreDate,
        totalSent: data.totalSent,
        totalDelivered: data.totalDelivered,
        totalRead: data.totalRead,
        lastUsedAt: data.lastUsedAt,
        isActive: data.isActive,
        approvedAt: data.approvedAt,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      },
      data.id
    )
  }

  private static validateCreateData (data: {
    wabaId: string;
    metaTemplateId: string;
    name: string;
    language: string;
    category: TemplateCategory;
    components: any[];
  }): Result<void> {
    if (!data.wabaId || data.wabaId.trim().length === 0) {
      return fail(new InvalidWhatsAppMessageTemplateDataError('WABA ID is required'))
    }

    if (!data.metaTemplateId || data.metaTemplateId.trim().length === 0) {
      return fail(new InvalidWhatsAppMessageTemplateDataError('Meta Template ID is required'))
    }

    if (!data.name || data.name.trim().length === 0) {
      return fail(new InvalidWhatsAppMessageTemplateDataError('Name is required'))
    }

    if (data.name.length > 512) {
      return fail(new InvalidWhatsAppMessageTemplateDataError('Name cannot be longer than 512 characters'))
    }

    if (!data.language || data.language.trim().length === 0) {
      return fail(new InvalidWhatsAppMessageTemplateDataError('Language is required'))
    }

    // Validate language format (e.g., en_US, pt_BR)
    const languageRegex = /^[a-z]{2}_[A-Z]{2}$/
    if (!languageRegex.test(data.language)) {
      return fail(new InvalidWhatsAppMessageTemplateDataError('Language must be in format: xx_XX (e.g., en_US, pt_BR)'))
    }

    if (!data.components || data.components.length === 0) {
      return fail(new InvalidWhatsAppMessageTemplateDataError('At least one component is required'))
    }

    return ok(undefined as void)
  }

  // Getters
  getWabaId (): string {
    return this.props.wabaId
  }

  getMetaTemplateId (): string {
    return this.props.metaTemplateId
  }

  getName (): string {
    return this.props.name
  }

  getLanguage (): string {
    return this.props.language
  }

  getStatus (): TemplateStatus {
    return this.props.status
  }

  getCategory (): TemplateCategory {
    return this.props.category
  }

  getPreviousCategory (): string | undefined {
    return this.props.previousCategory
  }

  getComponents (): any[] {
    return this.props.components
  }

  getRejectedReason (): string | undefined {
    return this.props.rejectedReason
  }

  getRejectedAt (): Date | undefined {
    return this.props.rejectedAt
  }

  getQualityScore (): QualityRating | undefined {
    return this.props.qualityScore
  }

  getTotalSent (): number {
    return this.props.totalSent
  }

  getTotalDelivered (): number {
    return this.props.totalDelivered
  }

  getTotalRead (): number {
    return this.props.totalRead
  }

  getLastUsedAt (): Date | undefined {
    return this.props.lastUsedAt
  }

  isActiveStatus (): boolean {
    return this.props.isActive
  }

  getApprovedAt (): Date | undefined {
    return this.props.approvedAt
  }

  getCreatedAt (): Date {
    return this.props.createdAt
  }

  getUpdatedAt (): Date {
    return this.props.updatedAt
  }

  // Business methods
  updateStatus (newStatus: TemplateStatus): void {
    this.props.status = newStatus

    if (newStatus.isApproved()) {
      this.props.approvedAt = new Date()
    }

    this.props.updatedAt = new Date()
  }

  reject (reason: string): void {
    this.props.status = TemplateStatus.createUnsafe(TemplateStatusEnum.REJECTED)
    this.props.rejectedReason = reason
    this.props.rejectedAt = new Date()
    this.props.updatedAt = new Date()
  }

  approve (): void {
    this.props.status = TemplateStatus.createUnsafe(TemplateStatusEnum.APPROVED)
    this.props.approvedAt = new Date()
    this.props.rejectedReason = undefined
    this.props.rejectedAt = undefined
    this.props.updatedAt = new Date()
  }

  updateCategory (newCategory: TemplateCategory): void {
    this.props.previousCategory = this.props.category.toString()
    this.props.category = newCategory
    this.props.updatedAt = new Date()
  }

  updateComponents (components: any[]): Result<void> {
    if (!components || components.length === 0) {
      return fail(new InvalidWhatsAppMessageTemplateDataError('At least one component is required'))
    }

    this.props.components = components
    this.props.updatedAt = new Date()
    return ok(undefined as void)
  }

  updateQualityScore (score: QualityRating): void {
    this.props.qualityScore = score
    this.props.qualityScoreDate = new Date()
    this.props.updatedAt = new Date()
  }

  incrementSentCount (): void {
    this.props.totalSent++
    this.props.lastUsedAt = new Date()
    this.props.updatedAt = new Date()
  }

  incrementDeliveredCount (): void {
    this.props.totalDelivered++
    this.props.updatedAt = new Date()
  }

  incrementReadCount (): void {
    this.props.totalRead++
    this.props.updatedAt = new Date()
  }

  getDeliveryRate (): number {
    if (this.props.totalSent === 0) return 0
    return (this.props.totalDelivered / this.props.totalSent) * 100
  }

  getReadRate (): number {
    if (this.props.totalDelivered === 0) return 0
    return (this.props.totalRead / this.props.totalDelivered) * 100
  }

  canSendMessages (): boolean {
    return this.props.status.canSendMessages() && this.props.isActive
  }

  isHealthy (): boolean {
    return this.props.status.isApproved() &&
           this.props.isActive &&
           (!this.props.qualityScore || this.props.qualityScore.isGreen() || this.props.qualityScore.isNA())
  }

  deactivate (): void {
    this.props.isActive = false
    this.props.updatedAt = new Date()
  }

  activate (): void {
    this.props.isActive = true
    this.props.updatedAt = new Date()
  }

  validate (): Result<void> {
    return ok(undefined as void)
  }
}
