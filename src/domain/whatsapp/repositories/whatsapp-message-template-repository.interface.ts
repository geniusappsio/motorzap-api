import type { Result } from '../../shared'
import { WhatsAppMessageTemplate } from '../entities'
import { TemplateCategory, TemplateStatus } from '../value-objects'

export interface IWhatsAppMessageTemplateRepository {
  save(template: WhatsAppMessageTemplate): Promise<Result<void>>;
  findById(id: string): Promise<Result<WhatsAppMessageTemplate>>;
  findByMetaTemplateId(metaTemplateId: string): Promise<Result<WhatsAppMessageTemplate>>;
  findByWabaId(wabaId: string): Promise<Result<WhatsAppMessageTemplate[]>>;
  findByNameAndLanguage(wabaId: string, name: string, language: string): Promise<Result<WhatsAppMessageTemplate>>;
  findByStatus(status: TemplateStatus): Promise<Result<WhatsAppMessageTemplate[]>>;
  findByCategory(category: TemplateCategory): Promise<Result<WhatsAppMessageTemplate[]>>;
  findApproved(): Promise<Result<WhatsAppMessageTemplate[]>>;
  findAll(): Promise<Result<WhatsAppMessageTemplate[]>>;
  findAllActive(): Promise<Result<WhatsAppMessageTemplate[]>>;
  update(template: WhatsAppMessageTemplate): Promise<Result<void>>;
  delete(id: string): Promise<Result<void>>;
}
