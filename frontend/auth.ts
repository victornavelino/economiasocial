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
        params: { scope: "openid email profile" },
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name || `${profile.given_name} ${profile.family_name}`,
          email: profile.email,
          image: profile.picture,
        }
      },
    },
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
        token.idToken = account.id_token
      }
      return token
    },
    async session({ session, token }: { session: any, token: any }) {
      session.accessToken = token.accessToken
      session.idToken = token.idToken
      return session
    },

  },
})
