import { OAuthVariables } from "@hono/oauth-providers"

export interface MicrosoftUser {
  id: string
  displayName?: string
  givenName?: string
  surname?: string
  userPrincipalName?: string
  mail?: string
}

export interface MicrosoftTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  scope: string
  refresh_token?: string
  id_token?: string
}

export interface MicrosoftErrorResponse {
  error: string
  error_description: string
} 

declare module 'hono' {
  interface ContextVariableMap extends OAuthVariables {
      'user-microsoft': Partial<MicrosoftUser> | undefined;
  }
}
