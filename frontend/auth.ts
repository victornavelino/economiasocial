import NextAuth from "next-auth"

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  providers: [
    {
      id: "micatamarca",
      name: "Mi Catamarca",
      type: "oidc",
      issuer: process.env.AUTH_MICATAMARCA_ISSUER,
      clientId: process.env.AUTH_MICATAMARCA_ID,
      clientSecret: process.env.AUTH_MICATAMARCA_SECRET,
      authorization: {
        url: "https://develop-api-mi.catamarca.gob.ar/openid/authorize",
        params: { scope: "openid email profile" },
      },
      token: "https://develop-api-mi.catamarca.gob.ar/openid/token",
      userinfo: "https://develop-api-mi.catamarca.gob.ar/openid/userinfo",
      jwks_endpoint: "https://develop-api-mi.catamarca.gob.ar/openid/jwks",
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name || `${profile.given_name} ${profile.family_name}`,
          given_name: profile.given_name,
          family_name: profile.family_name,
          email: profile.email,
          image: profile.picture,
          documento: profile.documento_identidad,
          cuil: profile.cuil,
          birthdate: profile.birthdate,
          gender: profile.gender,
        }
      },
    },
  ],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user
      const isApiAuthRoute = request.nextUrl.pathname.startsWith('/api/auth')
      if (isApiAuthRoute) return true
      return isLoggedIn
    },
    async jwt({ token, account, user }: any) {
      if (account && user) {
        token.accessToken = account.access_token
        token.idToken = account.id_token
        token.sub = user.id
        token.userProfile = user // NextAuth user object contains normalized profile
      }

      // Fetch extra info from our backend (is_staff, persona_id)
      if (token.accessToken && !token.backendUser) {
        try {
          const res = await fetch(`${process.env.NEXTAUTH_BACKEND_URL}usuario/me/`, {
            headers: {
              'Authorization': `Bearer ${token.accessToken}`,
              'X-Api-Key': process.env.NEXT_PUBLIC_API_KEY || ''
            }
          })
          if (res.ok) {
            const backendData = await res.json()
            // /me/ devuelve JSON plano: { is_staff, persona, ... }
            // Fallback a JSON:API por compatibilidad: { data: { attributes: { is_staff } } }
            const attrs = backendData.data?.attributes ?? backendData
            token.backendUser = {
              isStaff: attrs.is_staff ?? false,
              personaId: attrs.persona ?? backendData.data?.relationships?.persona?.data?.id ?? null
            }
          }
        } catch (error) {
          console.error("Error fetching backend user info:", error)
        }
      }
      return token
    },
    async session({ session, token }: { session: any, token: any }) {
      session.accessToken = token.accessToken
      session.idToken = token.idToken
      session.userId = token.sub
      session.userProfile = token.userProfile
      session.isStaff = token.backendUser?.isStaff || false
      session.personaId = token.backendUser?.personaId || null
      return session
    },
  },
})
