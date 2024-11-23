import { MiddlewareHandler } from 'hono'
import { env } from 'hono/adapter'
import { getCookie, setCookie } from 'hono/cookie'
import { HTTPException } from 'hono/http-exception'
import { AuthFlow } from './microsoftAuthFlow'

const rand = () => {
  return Math.random().toString(36).substr(2)
}

export function getRandomState() {
  return `${rand()}-${rand()}-${rand()}`
} 

export const microsoftAuth = (options: {
  scope: string[]
  client_id?: string
  client_secret?: string
  state?: string
  redirect_uri?: string
  tenant_id?: string
}): MiddlewareHandler => {
  return async (c, next) => {
    const newState = options.state || getRandomState()
    
    const auth = new AuthFlow({
      client_id: options.client_id || env(c).MICROSOFT_CLIENT_ID,
      client_secret: options.client_secret || env(c).MICROSOFT_CLIENT_SECRET,
      redirect_uri: options.redirect_uri || c.req.url.split('?')[0],
      scope: options.scope,
      state: newState,
      code: c.req.query('code'),
      token: {
        token: c.req.query('access_token') || '',
        expires_in: Number(c.req.query('expires_in'))
      },
      tenant_id: options.tenant_id
    })

    if (!auth.code) {
      setCookie(c, 'state', newState, {
        maxAge: 60 * 10,
        httpOnly: true,
        path: '/'
      })
      return c.redirect(auth.redirect())
    }

    if (c.req.url.includes('?')) {
      const storedState = getCookie(c, 'state')
      if (c.req.query('state') !== storedState) {
        throw new HTTPException(401)
      }
    }

    await auth.getUserData()
    c.set('token', auth.token)
    c.set('user-microsoft', auth.user)
    c.set('granted-scopes', auth.granted_scopes)

    await next()
  }
}