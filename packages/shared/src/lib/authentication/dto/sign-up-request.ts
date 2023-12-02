import { Static, Type } from '@sinclair/typebox'
import { EmailType, PasswordType } from '../../user/user'

export const SignUpRequest = Type.Object({
    email: EmailType,
    password: PasswordType,
    firstName: Type.String(),
    lastName: Type.String(),
    trackEvents: Type.Boolean(),
    newsLetter: Type.Boolean(),
})

export type SignUpRequest = Static<typeof SignUpRequest>
