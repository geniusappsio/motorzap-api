import type { Result } from '../../shared'
import { WhatsAppFlow } from '../entities'
import { FlowStatus } from '../value-objects'

export interface IWhatsAppFlowRepository {
  save(flow: WhatsAppFlow): Promise<Result<void>>;
  findById(id: string): Promise<Result<WhatsAppFlow>>;
  findByMetaFlowId(metaFlowId: string): Promise<Result<WhatsAppFlow>>;
  findByWabaId(wabaId: string): Promise<Result<WhatsAppFlow[]>>;
  findByStatus(status: FlowStatus): Promise<Result<WhatsAppFlow[]>>;
  findPublished(): Promise<Result<WhatsAppFlow[]>>;
  findAll(): Promise<Result<WhatsAppFlow[]>>;
  findAllActive(): Promise<Result<WhatsAppFlow[]>>;
  update(flow: WhatsAppFlow): Promise<Result<void>>;
  delete(id: string): Promise<Result<void>>;
}
