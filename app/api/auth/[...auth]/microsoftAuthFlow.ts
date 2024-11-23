import { HTTPException } from 'hono/http-exception'
import type { MicrosoftTokenResponse, MicrosoftUser, MicrosoftErrorResponse } from './types'

export class AuthFlow {
  private client_id: string
  private client_secret: string
  private redirect_uri: string
  private scope: string[]
  private state?: string
  private tenant_id: string
  
  public code?: string
  public token?: { token: string; expires_in: number }
  public user?: MicrosoftUser
  public granted_scopes?: string[]

  constructor({
    client_id,
    client_secret,
    redirect_uri,
    scope,
    state,
    code,
    token,
    tenant_id = 'common'
  }: {
    client_id: string
    client_secret: string
    redirect_uri: string
    scope: string[]
    state?: string
    code?: string
    token?: { token: string; expires_in: number }
    tenant_id?: string
  }) {
    this.client_id = client_id
    this.client_secret = client_secret
    this.redirect_uri = redirect_uri
    this.scope = scope
    this.state = state
    this.code = code
    this.token = token
    this.tenant_id = tenant_id

    if (!this.client_id || !this.client_secret || !this.scope.length) {
      throw new HTTPException(400, {
        message: 'Required parameters were not found.'
      })
    }
  }

  redirect(): string {
    const params = new URLSearchParams({
      client_id: this.client_id,
      response_type: 'code',
      redirect_uri: this.redirect_uri,
      scope: this.scope.join(' '),
      response_mode: 'query',
      state: this.state || ''
    })

    return `https://login.microsoftonline.com/${this.tenant_id}/oauth2/v2.0/authorize?${params.toString()}`
  }

  async getTokenFromCode(): Promise<void> {
    const response = await fetch(
      `https://login.microsoftonline.com/${this.tenant_id}/oauth2/v2.0/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id: this.client_id,
          client_secret: this.client_secret,
          code: this.code || '',
          redirect_uri: this.redirect_uri,
          grant_type: 'authorization_code'
        }).toString()
      }
    ).then(res => res.json()) as MicrosoftTokenResponse | MicrosoftErrorResponse

    if ('error' in response) {
      throw new HTTPException(400, { 
        message: (response as MicrosoftErrorResponse).error_description 
      })
    }

    const tokenResponse = response as MicrosoftTokenResponse
    this.token = {
      token: tokenResponse.access_token,
      expires_in: tokenResponse.expires_in
    }
    this.granted_scopes = tokenResponse.scope.split(' ')
  }

  async getUserData(): Promise<void> {
    await this.getTokenFromCode()
    const response = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        Authorization: `Bearer ${this.token?.token}`
      }
    }).then(res => res.json())

    if ('error' in response) {
      throw new HTTPException(400, { message: response.error.message })
    }

    this.user = response
  }
} 