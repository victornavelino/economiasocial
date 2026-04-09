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
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
    async jwt({ token, account, user }) {
      if (account && user) {
        token.accessToken = account.access_token
        token.idToken = account.id_token
        token.sub = user.id
      }
      return token
    },
    async session({ session, token }: { session: any, token: any }) {
      session.accessToken = token.accessToken
      session.idToken = token.idToken
      session.userId = token.sub
      return session
    },
  },
})
