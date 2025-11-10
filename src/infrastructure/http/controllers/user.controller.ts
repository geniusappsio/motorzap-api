import type { CreateUserUseCase } from '../../../application/use-cases/user'
import type { CreateUserResponse } from '../../../application/use-cases/user/create-user/create-user.response'
import type { CreateUserValidationInput } from '../validators/user.validator'

export class UserController {
  constructor (private readonly createUserUseCase: CreateUserUseCase) {}

  async create (input: CreateUserValidationInput): Promise<CreateUserResponse> {
    const result = await this.createUserUseCase.execute({
      phone: input.phone,
      role: input.role,
      name: input.name,
      email: input.email
    })

    if (result.isFailure) {
      throw result.error
    }

    return result.value
  }
}
