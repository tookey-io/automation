import { Static, Type } from "@sinclair/typebox";

export const ExternalUserRequest = Type.Object({
    id: Type.String(),
    firstName: Type.String(),
    lastName: Type.String(),
    trackEvents: Type.Boolean(),
    newsLetter: Type.Boolean(),
});

export type ExternalUserRequest = Static<typeof ExternalUserRequest>