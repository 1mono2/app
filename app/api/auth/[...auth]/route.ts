import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { googleAuth } from '@hono/oauth-providers/google'
import { microsoftAuth } from './microsoftAuth'

const app = new Hono().basePath('/api/auth')

// Google OAuth設定
app.use('/google', 
  googleAuth({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    scope: ['openid', 'email', 'profile'],
    redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
}))

// Microsoft OAuth設定
app.use('/microsoft', microsoftAuth({
  client_id: process.env.MICROSOFT_CLIENT_ID!,
  client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
  redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/microsoft`,
  scope: ['user.read', 'calendars.read']
}))

// Google認証コールバック
app.get('/callback/google', (c) => {
  const token = c.get('token')
  const grantedScopes = c.get('granted-scopes')
  const user = c.get('user-google')

  console.log(token, grantedScopes, user)

  return c.json({
    token,
    grantedScopes,
    user,
  })
})

// Microsoft認証コールバック
app.get('/callback/microsoft', async (c) => {
  try {
    const token = c.get('token')
    const user = c.get('user-microsoft')
    
    return c.json({
      token,
      user
    })
  } catch (error) {
    console.error('Microsoft認証エラー:', error)
    return c.redirect('/error')
  }
})

export const GET = handle(app)
