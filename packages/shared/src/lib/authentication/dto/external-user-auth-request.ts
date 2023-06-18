import { Static, Type } from "@sinclair/typebox";

export const ExternalUserAuthRequest = Type.Object({
    id: Type.String(),
});

export type ExternalUserAuthRequest = Static<typeof ExternalUserAuthRequest>