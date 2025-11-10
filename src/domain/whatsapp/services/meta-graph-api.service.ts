import type {
  MetaBusinessesResponse,
  MetaGraphAPIErrorResponse,
  MetaMeResponse,
  MetaPhoneNumbersResponse,
  MetaWABAsResponse
} from '../types/meta-graph-api.types'

export class MetaGraphAPIService {
  private readonly baseUrl = 'https://graph.facebook.com'
  private readonly apiVersion = 'v21.0'

  constructor (private readonly accessToken: string) {}

  /**
   * Get current user/system user info
   */
  async getMe (): Promise<MetaMeResponse> {
    const url = `${this.baseUrl}/${this.apiVersion}/me`
    return this.makeRequest<MetaMeResponse>(url)
  }

  /**
   * Get businesses associated with the access token
   */
  async getBusinesses (): Promise<MetaBusinessesResponse> {
    const url = `${this.baseUrl}/${this.apiVersion}/me/businesses`
    return this.makeRequest<MetaBusinessesResponse>(url)
  }

  /**
   * Get owned WhatsApp Business Accounts for a business
   */
  async getOwnedWABAs (businessId: string): Promise<MetaWABAsResponse> {
    const url = `${this.baseUrl}/${this.apiVersion}/${businessId}/owned_whatsapp_business_accounts`
    return this.makeRequest<MetaWABAsResponse>(url)
  }

  /**
   * Get client (shared) WhatsApp Business Accounts for a business
   */
  async getClientWABAs (businessId: string): Promise<MetaWABAsResponse> {
    const url = `${this.baseUrl}/${this.apiVersion}/${businessId}/client_whatsapp_business_accounts`
    return this.makeRequest<MetaWABAsResponse>(url)
  }

  /**
   * Get phone numbers for a WABA
   */
  async getPhoneNumbers (wabaId: string): Promise<MetaPhoneNumbersResponse> {
    const url = `${this.baseUrl}/${this.apiVersion}/${wabaId}/phone_numbers`
    return this.makeRequest<MetaPhoneNumbersResponse>(url)
  }

  /**
   * Debug token to get information about it
   */
  async debugToken (): Promise<any> {
    const url = `${this.baseUrl}/${this.apiVersion}/debug_token`
    return this.makeRequest<any>(url, {
      input_token: this.accessToken
    })
  }

  /**
   * Generic request method with error handling
   */
  private async makeRequest<T> (url: string, additionalParams: Record<string, string> = {}): Promise<T> {
    const params = new URLSearchParams({
      access_token: this.accessToken,
      ...additionalParams
    })

    const fullUrl = `${url}?${params.toString()}`

    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (!response.ok) {
        const errorData = data as MetaGraphAPIErrorResponse
        throw new MetaGraphAPIError(
          errorData.error.message,
          errorData.error.code,
          errorData.error.type,
          errorData.error.fbtrace_id
        )
      }

      return data as T
    } catch (error) {
      if (error instanceof MetaGraphAPIError) {
        throw error
      }

      throw new MetaGraphAPIError(
        `Failed to make request to Meta Graph API: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500,
        'NetworkError'
      )
    }
  }
}

/**
 * Custom error class for Meta Graph API errors
 */
export class MetaGraphAPIError extends Error {
  constructor (
    message: string,
    public readonly code: number,
    public readonly type: string,
    public readonly fbTraceId?: string
  ) {
    super(message)
    this.name = 'MetaGraphAPIError'
  }
}
