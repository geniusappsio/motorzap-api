import type { Result } from '../../shared'
import { WhatsAppPhoneNumber } from '../entities'
import { PhoneNumberE164 } from '../value-objects'

export interface IWhatsAppPhoneNumberRepository {
  save(phoneNumber: WhatsAppPhoneNumber): Promise<Result<void>>;
  findById(id: string): Promise<Result<WhatsAppPhoneNumber>>;
  findByMetaPhoneNumberId(metaPhoneNumberId: string): Promise<Result<WhatsAppPhoneNumber>>;
  findByPhoneNumber(phoneNumber: PhoneNumberE164): Promise<Result<WhatsAppPhoneNumber>>;
  findByWabaId(wabaId: string): Promise<Result<WhatsAppPhoneNumber[]>>;
  findAll(): Promise<Result<WhatsAppPhoneNumber[]>>;
  findAllActive(): Promise<Result<WhatsAppPhoneNumber[]>>;
  findHealthy(): Promise<Result<WhatsAppPhoneNumber[]>>;
  update(phoneNumber: WhatsAppPhoneNumber): Promise<Result<void>>;
  delete(id: string): Promise<Result<void>>;
}
