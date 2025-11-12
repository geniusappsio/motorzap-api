export abstract class DomainError extends Error {
  constructor (
    public readonly code: string,
    public readonly message: string,
    public readonly statusCode: number = 400
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}
