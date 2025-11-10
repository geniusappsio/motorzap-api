import type { Result } from '../../shared'
import { BusinessManager } from '../entities'

export interface IBusinessManagerRepository {
  save(businessManager: BusinessManager): Promise<Result<void>>;
  findById(id: string): Promise<Result<BusinessManager>>;
  findByMetaBusinessId(metaBusinessId: string): Promise<Result<BusinessManager>>;
  findAll(): Promise<Result<BusinessManager[]>>;
  findAllActive(): Promise<Result<BusinessManager[]>>;
  update(businessManager: BusinessManager): Promise<Result<void>>;
  delete(id: string): Promise<Result<void>>;
}
