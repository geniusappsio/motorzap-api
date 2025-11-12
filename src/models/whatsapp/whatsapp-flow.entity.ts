import { randomUUID } from 'crypto'

import { BaseEntity, fail, ok, Result } from '@/shared'

import { FlowCategory, FlowStatus, FlowStatusEnum } from '../value-objects'
import { InvalidWhatsAppFlowDataError } from './whatsapp-errors'

export interface WhatsAppFlowProps {
  wabaId: string;
  metaFlowId: string;
  name: string;
  status: FlowStatus;
  categories: FlowCategory[];
  flowJson?: Record<string, any>;
  jsonVersion?: string;
  dataApiVersion?: string;
  dataChannelUri?: string;
  endpointUri?: string;
  previewUrl?: string;
  previewExpiresAt?: Date;
  validationErrors?: any[];
  lastValidationAt?: Date;
  canSendMessage?: string;
  healthStatusDetails?: Record<string, any>;
  lastHealthCheckAt?: Date;
  assetsCount: number;
  totalSent: number;
  totalCompleted: number;
  isActive: boolean;
  publishedAt?: Date;
  deprecatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class WhatsAppFlow extends BaseEntity<WhatsAppFlowProps> {
  constructor (props: WhatsAppFlowProps, id: string) {
    super(props, id)
  }

  static create (data: {
    wabaId: string;
    metaFlowId: string;
    name: string;
    status?: FlowStatus;
    categories?: FlowCategory[];
    flowJson?: Record<string, any>;
    jsonVersion?: string;
    dataApiVersion?: string;
    dataChannelUri?: string;
    endpointUri?: string;
  }): Result<WhatsAppFlow> {
    const validation = WhatsAppFlow.validateCreateData(data)
    if (validation.isFailure) {
      return validation
    }

    const flow = new WhatsAppFlow(
      {
        wabaId: data.wabaId,
        metaFlowId: data.metaFlowId,
        name: data.name,
        status: data.status ?? FlowStatus.createUnsafe(FlowStatusEnum.DRAFT),
        categories: data.categories ?? [],
        flowJson: data.flowJson,
        jsonVersion: data.jsonVersion,
        dataApiVersion: data.dataApiVersion,
        dataChannelUri: data.dataChannelUri,
        endpointUri: data.endpointUri,
        assetsCount: 0,
        totalSent: 0,
        totalCompleted: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      randomUUID()
    )

    return ok(flow)
  }

  static reconstitute (data: {
    id: string;
    wabaId: string;
    metaFlowId: string;
    name: string;
    status: FlowStatus;
    categories: FlowCategory[];
    flowJson?: Record<string, any>;
    jsonVersion?: string;
    dataApiVersion?: string;
    dataChannelUri?: string;
    endpointUri?: string;
    previewUrl?: string;
    previewExpiresAt?: Date;
    validationErrors?: any[];
    lastValidationAt?: Date;
    canSendMessage?: string;
    healthStatusDetails?: Record<string, any>;
    lastHealthCheckAt?: Date;
    assetsCount: number;
    totalSent: number;
    totalCompleted: number;
    isActive: boolean;
    publishedAt?: Date;
    deprecatedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
  }): WhatsAppFlow {
    return new WhatsAppFlow(
      {
        wabaId: data.wabaId,
        metaFlowId: data.metaFlowId,
        name: data.name,
        status: data.status,
        categories: data.categories,
        flowJson: data.flowJson,
        jsonVersion: data.jsonVersion,
        dataApiVersion: data.dataApiVersion,
        dataChannelUri: data.dataChannelUri,
        endpointUri: data.endpointUri,
        previewUrl: data.previewUrl,
        previewExpiresAt: data.previewExpiresAt,
        validationErrors: data.validationErrors,
        lastValidationAt: data.lastValidationAt,
        canSendMessage: data.canSendMessage,
        healthStatusDetails: data.healthStatusDetails,
        lastHealthCheckAt: data.lastHealthCheckAt,
        assetsCount: data.assetsCount,
        totalSent: data.totalSent,
        totalCompleted: data.totalCompleted,
        isActive: data.isActive,
        publishedAt: data.publishedAt,
        deprecatedAt: data.deprecatedAt,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      },
      data.id
    )
  }

  private static validateCreateData (data: {
    wabaId: string;
    metaFlowId: string;
    name: string;
  }): Result<void> {
    if (!data.wabaId || data.wabaId.trim().length === 0) {
      return fail(new InvalidWhatsAppFlowDataError('WABA ID is required'))
    }

    if (!data.metaFlowId || data.metaFlowId.trim().length === 0) {
      return fail(new InvalidWhatsAppFlowDataError('Meta Flow ID is required'))
    }

    if (!data.name || data.name.trim().length === 0) {
      return fail(new InvalidWhatsAppFlowDataError('Name is required'))
    }

    if (data.name.length > 255) {
      return fail(new InvalidWhatsAppFlowDataError('Name cannot be longer than 255 characters'))
    }

    return ok(undefined as void)
  }

  // Getters
  getWabaId (): string {
    return this.props.wabaId
  }

  getMetaFlowId (): string {
    return this.props.metaFlowId
  }

  getName (): string {
    return this.props.name
  }

  getStatus (): FlowStatus {
    return this.props.status
  }

  getCategories (): FlowCategory[] {
    return this.props.categories
  }

  getFlowJson (): Record<string, any> | undefined {
    return this.props.flowJson
  }

  getJsonVersion (): string | undefined {
    return this.props.jsonVersion
  }

  getDataChannelUri (): string | undefined {
    return this.props.dataChannelUri
  }

  getEndpointUri (): string | undefined {
    return this.props.endpointUri
  }

  getPreviewUrl (): string | undefined {
    return this.props.previewUrl
  }

  getValidationErrors (): any[] | undefined {
    return this.props.validationErrors
  }

  canSend (): boolean {
    return this.props.canSendMessage === 'AVAILABLE'
  }

  getTotalSent (): number {
    return this.props.totalSent
  }

  getTotalCompleted (): number {
    return this.props.totalCompleted
  }

  isActiveStatus (): boolean {
    return this.props.isActive
  }

  getPublishedAt (): Date | undefined {
    return this.props.publishedAt
  }

  getCreatedAt (): Date {
    return this.props.createdAt
  }

  getUpdatedAt (): Date {
    return this.props.updatedAt
  }

  // Business methods
  updateName (newName: string): Result<void> {
    if (!newName || newName.trim().length === 0) {
      return fail(new InvalidWhatsAppFlowDataError('Name cannot be empty'))
    }

    if (newName.length > 255) {
      return fail(new InvalidWhatsAppFlowDataError('Name cannot be longer than 255 characters'))
    }

    this.props.name = newName
    this.props.updatedAt = new Date()
    return ok(undefined as void)
  }

  updateFlowJson (json: Record<string, any>, version: string): void {
    this.props.flowJson = json
    this.props.jsonVersion = version
    this.props.updatedAt = new Date()
  }

  updateStatus (newStatus: FlowStatus): void {
    this.props.status = newStatus

    if (newStatus.isPublished()) {
      this.props.publishedAt = new Date()
    } else if (newStatus.isDeprecated()) {
      this.props.deprecatedAt = new Date()
    }

    this.props.updatedAt = new Date()
  }

  addCategory (category: FlowCategory): void {
    if (!this.props.categories.some(c => c.equals(category))) {
      this.props.categories.push(category)
      this.props.updatedAt = new Date()
    }
  }

  removeCategory (category: FlowCategory): void {
    this.props.categories = this.props.categories.filter(c => !c.equals(category))
    this.props.updatedAt = new Date()
  }

  updateValidation (errors: any[]): void {
    this.props.validationErrors = errors
    this.props.lastValidationAt = new Date()
    this.props.updatedAt = new Date()
  }

  updateHealthStatus (canSend: string, details?: Record<string, any>): void {
    this.props.canSendMessage = canSend
    this.props.healthStatusDetails = details
    this.props.lastHealthCheckAt = new Date()
    this.props.updatedAt = new Date()
  }

  incrementSentCount (): void {
    this.props.totalSent++
    this.props.updatedAt = new Date()
  }

  incrementCompletedCount (): void {
    this.props.totalCompleted++
    this.props.updatedAt = new Date()
  }

  updateAssetsCount (count: number): void {
    this.props.assetsCount = count
    this.props.updatedAt = new Date()
  }

  isHealthy (): boolean {
    return this.props.status.canSendMessages() &&
           this.props.canSendMessage === 'AVAILABLE' &&
           this.props.isActive
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
