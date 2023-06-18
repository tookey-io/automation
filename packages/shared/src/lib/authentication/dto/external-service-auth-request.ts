import { Static, Type } from '@sinclair/typebox';

export const ExternalServiceAuthRequest = Type.Object({
    password: Type.String(),
});

export type ExternalServiceAuthRequest = Static<typeof ExternalServiceAuthRequest>;