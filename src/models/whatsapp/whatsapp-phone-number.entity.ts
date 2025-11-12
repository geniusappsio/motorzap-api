import { randomUUID } from 'crypto'

import { BaseEntity, fail, ok, Result } from '@/shared'
import { InvalidWhatsAppPhoneNumberDataError } from './whatsapp-errors'
import { PhoneNumberE164, QualityRating, QualityRatingEnum } from '../value-objects'

export interface WhatsAppPhoneNumberProps {
  wabaId: string;
  metaPhoneNumberId: string;
  phoneNumber: PhoneNumberE164;
  displayPhoneNumber?: string;
  verifiedName?: string;
  nameStatus?: string;
  certificate?: string;
  certificateStatus?: string;
  qualityRating: QualityRating;
  messagingLimitTier?: string;
  currentLimit?: number;
  status: string;
  platformType?: string;
  accountMode?: string;
  isPinEnabled: boolean;
  pin?: string;
  isOfficialBusinessAccount: boolean;
  throughputLevel?: string;
  messagesPerSecond?: number;
  codeVerificationStatus?: string;
  isActive: boolean;
  lastStatusCheck?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class WhatsAppPhoneNumber extends BaseEntity<WhatsAppPhoneNumberProps> {
  constructor (props: WhatsAppPhoneNumberProps, id: string) {
    super(props, id)
  }

  static create (data: {
    wabaId: string;
    metaPhoneNumberId: string;
    phoneNumber: PhoneNumberE164;
    displayPhoneNumber?: string;
    verifiedName?: string;
    nameStatus?: string;
    certificate?: string;
    certificateStatus?: string;
    qualityRating?: QualityRating;
    messagingLimitTier?: string;
    currentLimit?: number;
    status: string;
    platformType?: string;
    accountMode?: string;
    isPinEnabled?: boolean;
    pin?: string;
    isOfficialBusinessAccount?: boolean;
    throughputLevel?: string;
    messagesPerSecond?: number;
    codeVerificationStatus?: string;
  }): Result<WhatsAppPhoneNumber> {
    const validation = WhatsAppPhoneNumber.validateCreateData(data)
    if (validation.isFailure) {
      return validation
    }

    const phoneNumber = new WhatsAppPhoneNumber(
      {
        wabaId: data.wabaId,
        metaPhoneNumberId: data.metaPhoneNumberId,
        phoneNumber: data.phoneNumber,
        displayPhoneNumber: data.displayPhoneNumber,
        verifiedName: data.verifiedName,
        nameStatus: data.nameStatus,
        certificate: data.certificate,
        certificateStatus: data.certificateStatus,
        qualityRating: data.qualityRating ?? QualityRating.createUnsafe(QualityRatingEnum.NA),
        messagingLimitTier: data.messagingLimitTier,
        currentLimit: data.currentLimit,
        status: data.status,
        platformType: data.platformType,
        accountMode: data.accountMode,
        isPinEnabled: data.isPinEnabled ?? false,
        pin: data.pin,
        isOfficialBusinessAccount: data.isOfficialBusinessAccount ?? false,
        throughputLevel: data.throughputLevel,
        messagesPerSecond: data.messagesPerSecond,
        codeVerificationStatus: data.codeVerificationStatus,
        isActive: true,
        lastStatusCheck: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      randomUUID()
    )

    return ok(phoneNumber)
  }

  static reconstitute (data: {
    id: string;
    wabaId: string;
    metaPhoneNumberId: string;
    phoneNumber: PhoneNumberE164;
    displayPhoneNumber?: string;
    verifiedName?: string;
    nameStatus?: string;
    certificate?: string;
    certificateStatus?: string;
    qualityRating: QualityRating;
    messagingLimitTier?: string;
    currentLimit?: number;
    status: string;
    platformType?: string;
    accountMode?: string;
    isPinEnabled: boolean;
    pin?: string;
    isOfficialBusinessAccount: boolean;
    throughputLevel?: string;
    messagesPerSecond?: number;
    codeVerificationStatus?: string;
    isActive: boolean;
    lastStatusCheck?: Date;
    createdAt: Date;
    updatedAt: Date;
  }): WhatsAppPhoneNumber {
    return new WhatsAppPhoneNumber(
      {
        wabaId: data.wabaId,
        metaPhoneNumberId: data.metaPhoneNumberId,
        phoneNumber: data.phoneNumber,
        displayPhoneNumber: data.displayPhoneNumber,
        verifiedName: data.verifiedName,
        nameStatus: data.nameStatus,
        certificate: data.certificate,
        certificateStatus: data.certificateStatus,
        qualityRating: data.qualityRating,
        messagingLimitTier: data.messagingLimitTier,
        currentLimit: data.currentLimit,
        status: data.status,
        platformType: data.platformType,
        accountMode: data.accountMode,
        isPinEnabled: data.isPinEnabled,
        pin: data.pin,
        isOfficialBusinessAccount: data.isOfficialBusinessAccount,
        throughputLevel: data.throughputLevel,
        messagesPerSecond: data.messagesPerSecond,
        codeVerificationStatus: data.codeVerificationStatus,
        isActive: data.isActive,
        lastStatusCheck: data.lastStatusCheck,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      },
      data.id
    )
  }

  private static validateCreateData (data: {
    wabaId: string;
    metaPhoneNumberId: string;
    phoneNumber: PhoneNumberE164;
    status: string;
  }): Result<void> {
    if (!data.wabaId || data.wabaId.trim().length === 0) {
      return fail(new InvalidWhatsAppPhoneNumberDataError('WABA ID is required'))
    }

    if (!data.metaPhoneNumberId || data.metaPhoneNumberId.trim().length === 0) {
      return fail(new InvalidWhatsAppPhoneNumberDataError('Meta Phone Number ID is required'))
    }

    if (!data.status || data.status.trim().length === 0) {
      return fail(new InvalidWhatsAppPhoneNumberDataError('Status is required'))
    }

    return ok(undefined as void)
  }

  // Getters
  getWabaId (): string {
    return this.props.wabaId
  }

  getMetaPhoneNumberId (): string {
    return this.props.metaPhoneNumberId
  }

  getPhoneNumber (): PhoneNumberE164 {
    return this.props.phoneNumber
  }

  getDisplayPhoneNumber (): string | undefined {
    return this.props.displayPhoneNumber
  }

  getVerifiedName (): string | undefined {
    return this.props.verifiedName
  }

  getNameStatus (): string | undefined {
    return this.props.nameStatus
  }

  getQualityRating (): QualityRating {
    return this.props.qualityRating
  }

  getMessagingLimitTier (): string | undefined {
    return this.props.messagingLimitTier
  }

  getCurrentLimit (): number | undefined {
    return this.props.currentLimit
  }

  getStatus (): string {
    return this.props.status
  }

  getPlatformType (): string | undefined {
    return this.props.platformType
  }

  getAccountMode (): string | undefined {
    return this.props.accountMode
  }

  isPinEnabledStatus (): boolean {
    return this.props.isPinEnabled
  }

  isOfficialBusiness (): boolean {
    return this.props.isOfficialBusinessAccount
  }

  getThroughputLevel (): string | undefined {
    return this.props.throughputLevel
  }

  getMessagesPerSecond (): number | undefined {
    return this.props.messagesPerSecond
  }

  isActiveStatus (): boolean {
    return this.props.isActive
  }

  getLastStatusCheck (): Date | undefined {
    return this.props.lastStatusCheck
  }

  getCreatedAt (): Date {
    return this.props.createdAt
  }

  getUpdatedAt (): Date {
    return this.props.updatedAt
  }

  // Business methods
  updateQualityRating (newRating: QualityRating): void {
    this.props.qualityRating = newRating
    this.props.lastStatusCheck = new Date()
    this.props.updatedAt = new Date()
  }

  updateMessagingLimit (tier: string, currentLimit: number): void {
    this.props.messagingLimitTier = tier
    this.props.currentLimit = currentLimit
    this.props.updatedAt = new Date()
  }

  updateStatus (newStatus: string): void {
    this.props.status = newStatus
    this.props.lastStatusCheck = new Date()
    this.props.updatedAt = new Date()
  }

  updateVerifiedName (name: string, status: string): void {
    this.props.verifiedName = name
    this.props.nameStatus = status
    this.props.updatedAt = new Date()
  }

  enablePin (pin: string): Result<void> {
    if (!pin || pin.length !== 6) {
      return fail(new InvalidWhatsAppPhoneNumberDataError('PIN must be 6 digits'))
    }

    this.props.isPinEnabled = true
    this.props.pin = pin
    this.props.updatedAt = new Date()
    return ok(undefined as void)
  }

  disablePin (): void {
    this.props.isPinEnabled = false
    this.props.pin = undefined
    this.props.updatedAt = new Date()
  }

  isHealthy (): boolean {
    return this.props.qualityRating.isGreen() &&
           this.props.status === 'CONNECTED' &&
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
