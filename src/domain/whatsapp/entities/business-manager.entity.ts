import { randomUUID } from 'crypto'

import { BaseEntity, fail, ok, Result } from '../../shared'
import { InvalidBusinessManagerDataError } from '../errors'

export interface BusinessManagerProps {
  metaBusinessId: string;
  name: string;
  verificationStatus?: string;
  accessToken: string;
  tokenExpiresAt?: Date;
  flowPrivateKey?: string;
  flowCertificate?: string;
  flowCertificateExpiresAt?: Date;
  businessType?: string;
  timezone?: string;
  currency?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class BusinessManager extends BaseEntity<BusinessManagerProps> {
  constructor (props: BusinessManagerProps, id: string) {
    super(props, id)
  }

  static create (data: {
    metaBusinessId: string;
    name: string;
    accessToken: string;
    verificationStatus?: string;
    tokenExpiresAt?: Date;
    flowPrivateKey?: string;
    flowCertificate?: string;
    flowCertificateExpiresAt?: Date;
    businessType?: string;
    timezone?: string;
    currency?: string;
  }): Result<BusinessManager> {
    const validation = BusinessManager.validateCreateData(data)
    if (validation.isFailure) {
      return validation
    }

    const businessManager = new BusinessManager(
      {
        metaBusinessId: data.metaBusinessId,
        name: data.name,
        verificationStatus: data.verificationStatus,
        accessToken: data.accessToken,
        tokenExpiresAt: data.tokenExpiresAt,
        flowPrivateKey: data.flowPrivateKey,
        flowCertificate: data.flowCertificate,
        flowCertificateExpiresAt: data.flowCertificateExpiresAt,
        businessType: data.businessType,
        timezone: data.timezone,
        currency: data.currency,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      randomUUID()
    )

    return ok(businessManager)
  }

  static reconstitute (data: {
    id: string;
    metaBusinessId: string;
    name: string;
    verificationStatus?: string;
    accessToken: string;
    tokenExpiresAt?: Date;
    flowPrivateKey?: string;
    flowCertificate?: string;
    flowCertificateExpiresAt?: Date;
    businessType?: string;
    timezone?: string;
    currency?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): BusinessManager {
    return new BusinessManager(
      {
        metaBusinessId: data.metaBusinessId,
        name: data.name,
        verificationStatus: data.verificationStatus,
        accessToken: data.accessToken,
        tokenExpiresAt: data.tokenExpiresAt,
        flowPrivateKey: data.flowPrivateKey,
        flowCertificate: data.flowCertificate,
        flowCertificateExpiresAt: data.flowCertificateExpiresAt,
        businessType: data.businessType,
        timezone: data.timezone,
        currency: data.currency,
        isActive: data.isActive,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      },
      data.id
    )
  }

  private static validateCreateData (data: {
    metaBusinessId: string;
    name: string;
    accessToken: string;
  }): Result<void> {
    if (!data.metaBusinessId || data.metaBusinessId.trim().length === 0) {
      return fail(new InvalidBusinessManagerDataError('Meta Business ID is required'))
    }

    if (!data.name || data.name.trim().length === 0) {
      return fail(new InvalidBusinessManagerDataError('Name is required'))
    }

    if (data.name.length > 255) {
      return fail(new InvalidBusinessManagerDataError('Name cannot be longer than 255 characters'))
    }

    if (!data.accessToken || data.accessToken.trim().length === 0) {
      return fail(new InvalidBusinessManagerDataError('Access token is required'))
    }

    return ok(undefined as void)
  }

  // Getters
  getMetaBusinessId (): string {
    return this.props.metaBusinessId
  }

  getName (): string {
    return this.props.name
  }

  getVerificationStatus (): string | undefined {
    return this.props.verificationStatus
  }

  getAccessToken (): string {
    return this.props.accessToken
  }

  getTokenExpiresAt (): Date | undefined {
    return this.props.tokenExpiresAt
  }

  getFlowPrivateKey (): string | undefined {
    return this.props.flowPrivateKey
  }

  getFlowCertificate (): string | undefined {
    return this.props.flowCertificate
  }

  getFlowCertificateExpiresAt (): Date | undefined {
    return this.props.flowCertificateExpiresAt
  }

  getBusinessType (): string | undefined {
    return this.props.businessType
  }

  getTimezone (): string | undefined {
    return this.props.timezone
  }

  getCurrency (): string | undefined {
    return this.props.currency
  }

  isActiveStatus (): boolean {
    return this.props.isActive
  }

  getCreatedAt (): Date {
    return this.props.createdAt
  }

  getUpdatedAt (): Date {
    return this.props.updatedAt
  }

  // Business methods
  updateAccessToken (token: string, expiresAt?: Date): Result<void> {
    if (!token || token.trim().length === 0) {
      return fail(new InvalidBusinessManagerDataError('Access token cannot be empty'))
    }

    this.props.accessToken = token
    this.props.tokenExpiresAt = expiresAt
    this.props.updatedAt = new Date()
    return ok(undefined as void)
  }

  rotateFlowCertificate (privateKey: string, certificate: string, expiresAt?: Date): Result<void> {
    if (!privateKey || privateKey.trim().length === 0) {
      return fail(new InvalidBusinessManagerDataError('Private key cannot be empty'))
    }

    if (!certificate || certificate.trim().length === 0) {
      return fail(new InvalidBusinessManagerDataError('Certificate cannot be empty'))
    }

    this.props.flowPrivateKey = privateKey
    this.props.flowCertificate = certificate
    this.props.flowCertificateExpiresAt = expiresAt
    this.props.updatedAt = new Date()
    return ok(undefined as void)
  }

  updateName (newName: string): Result<void> {
    if (!newName || newName.trim().length === 0) {
      return fail(new InvalidBusinessManagerDataError('Name cannot be empty'))
    }

    if (newName.length > 255) {
      return fail(new InvalidBusinessManagerDataError('Name cannot be longer than 255 characters'))
    }

    this.props.name = newName
    this.props.updatedAt = new Date()
    return ok(undefined as void)
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
