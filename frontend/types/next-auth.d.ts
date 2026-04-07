import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    idToken?: string
    userProfile?: {
      id: string
      name: string
      given_name: string
      family_name: string
      email: string
      image: string
      documento: string
      cuil: string
      birthdate: string
      gender: string
    } & DefaultSession["user"]
  }

  interface User {
      given_name?: string
      family_name?: string
      documento?: string
      cuil?: string
      birthdate?: string
      gender?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    idToken?: string
    profile?: any
  }
}
