import { Static, Type } from "@sinclair/typebox";

export const EXACT_VERSION_PATTERN = /^[0-9]+\.[0-9]+\.[0-9]+$/;
export const VERSION_PATTERN = /^([~^])?[0-9]+\.[0-9]+\.[0-9]+$/;

export const ExactVersionType = Type.RegEx(EXACT_VERSION_PATTERN);
export const VersionType = Type.RegEx(VERSION_PATTERN);

export const GetPieceRequestWithScopeParams = Type.Object({
    name: Type.String(),
    scope: Type.String(),
});

export type GetPieceRequestWithScopeParams = Static<typeof GetPieceRequestWithScopeParams>;


export const GetPieceRequestParams = Type.Object({
    name: Type.String(),
});

export type GetPieceRequestParams = Static<typeof GetPieceRequestParams>;

export const ListPiecesRequestQuery = Type.Object({
    release: Type.Optional(ExactVersionType),
});

export type ListPiecesRequestQuery = Static<typeof ListPiecesRequestQuery>;


export const GetPieceRequestQuery = Type.Object({
    version: Type.Optional(VersionType),
});

export type GetPieceRequestQuery = Static<typeof GetPieceRequestQuery>;

export const PieceOptionRequest = Type.Object({
    pieceVersion: VersionType,
    pieceName: Type.String({}),
    stepName: Type.String({}),
    propertyName: Type.String({}),
    input: Type.Any({}),
});

export type PieceOptionRequest = Static<typeof PieceOptionRequest>;

export const InstallPieceRequest = Type.Object({
    pieceName: Type.String(),
    pieceVersion: ExactVersionType,
})

export type InstallPieceRequest = Static<typeof InstallPieceRequest>
