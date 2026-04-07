import NextAuth from "next-auth"

export const { handlers, signIn, signOut, auth } = NextAuth({
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
    authorized({ auth }) {
      return !!auth?.user // Forzar login en todo el sitio
    },
    async jwt({ token, account, user }) {
      if (account && user) {
        token.accessToken = account.access_token
        token.idToken = account.id_token
        token.profile = user
      }
      return token
    },
    async session({ session, token }: { session: any, token: any }) {
      session.accessToken = token.accessToken
      session.idToken = token.idToken
      session.userProfile = token.profile
      return session
    },
  },
})
