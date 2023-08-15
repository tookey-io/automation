import { Static, Type } from "@sinclair/typebox";

export const ListAppConnectionsRequestQuery = Type.Object({
    cursor: Type.Optional(Type.String({})),
    appName: Type.Optional(Type.String({})),
    limit: Type.Optional(Type.Number({}))
});
export type ListAppConnectionsRequestQuery = Static<typeof ListAppConnectionsRequestQuery>;
