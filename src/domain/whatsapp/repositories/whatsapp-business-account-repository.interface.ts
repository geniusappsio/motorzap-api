import type { Result } from '../../shared'
import { WhatsAppBusinessAccount } from '../entities'

export interface IWhatsAppBusinessAccountRepository {
  save(waba: WhatsAppBusinessAccount): Promise<Result<void>>;
  findById(id: string): Promise<Result<WhatsAppBusinessAccount>>;
  findByMetaWabaId(metaWabaId: string): Promise<Result<WhatsAppBusinessAccount>>;
  findByBusinessManagerId(businessManagerId: string): Promise<Result<WhatsAppBusinessAccount[]>>;
  findAll(): Promise<Result<WhatsAppBusinessAccount[]>>;
  findAllActive(): Promise<Result<WhatsAppBusinessAccount[]>>;
  update(waba: WhatsAppBusinessAccount): Promise<Result<void>>;
  delete(id: string): Promise<Result<void>>;
}
