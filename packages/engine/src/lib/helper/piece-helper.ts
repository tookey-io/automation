import {
    DropdownProperty,
    DropdownState,
    DynamicProperties,
    MultiSelectDropdownProperty,
    PieceMetadata,
    PiecePropertyMap,
    PropertyType,
    StaticPropsValue,
} from '@activepieces/pieces-framework'
import {
    ExecuteValidateAuthOperation,
    ExecuteValidateAuthResponse,
    BasicAuthConnectionValue,
    SecretTextConnectionValue,
    CustomAuthConnectionValue,
    ExecuteExtractPieceMetadata,
    ExecutePropsOptions,
} from '@activepieces/shared'
import { API_URL } from '../constants'
import { FlowExecutorContext } from '../handler/context/flow-execution-context'
import { pieceLoader } from './piece-loader'
import { variableService } from '../services/variable-service'


export const pieceHelper = {
    async executeProps({ params, piecesSource }: { params: ExecutePropsOptions, piecesSource: string }) {
        const property = await pieceLoader.getPropOrThrow({
            params,
            piecesSource,
        })

        try {
            const { resolvedInput } = await variableService({
                projectId: params.projectId,
                workerToken: params.workerToken,
            }).resolve<
            StaticPropsValue<PiecePropertyMap>
            >({
                unresolvedInput: params.input,
                executionState: FlowExecutorContext.empty(),
            })
            const ctx = {
                server: {
                    token: params.workerToken,
                    apiUrl: API_URL,
                    publicUrl: params.serverUrl,
                },
            }

            if (property.type === PropertyType.DYNAMIC) {
                const dynamicProperty = property as DynamicProperties<boolean>
                return await dynamicProperty.props(resolvedInput, ctx)
            }

            if (property.type === PropertyType.MULTI_SELECT_DROPDOWN) {
                const multiSelectProperty = property as MultiSelectDropdownProperty<
                unknown,
                boolean
                >
                return await multiSelectProperty.options(resolvedInput, ctx)
            }

            const dropdownProperty = property as DropdownProperty<unknown, boolean>
            return await dropdownProperty.options(resolvedInput, ctx)
        }
        catch (e) {
            console.error(e)
            return {
                disabled: true,
                options: [],
                placeholder: 'Throws an error, reconnect or refresh the page',
            } as DropdownState<unknown>
        }
    },

    async executeValidateAuth(
        { params, piecesSource }: { params: ExecuteValidateAuthOperation, piecesSource: string },
    ): Promise<ExecuteValidateAuthResponse> {
        const { piece: piecePackage } = params

        const piece = await pieceLoader.loadPieceOrThrow({ pieceName: piecePackage.pieceName, pieceVersion: piecePackage.pieceVersion, piecesSource })
        if (piece.auth?.validate === undefined) {
            return {
                valid: true,
            }
        }

        switch (piece.auth.type) {
            case PropertyType.BASIC_AUTH: {
                const con = params.auth as BasicAuthConnectionValue
                return piece.auth.validate({
                    auth: {
                        username: con.username,
                        password: con.password,
                    },
                })
            }
            case PropertyType.SECRET_TEXT: {
                const con = params.auth as SecretTextConnectionValue
                return piece.auth.validate({
                    auth: con.secret_text,
                })
            }
            case PropertyType.CUSTOM_AUTH: {
                const con = params.auth as CustomAuthConnectionValue
                return piece.auth.validate({
                    auth: con.props,
                })
            }
            default: {
                throw new Error('Invalid auth type')
            }
        }
    },

    async extractPieceMetadata({ piecesSource, params }: { piecesSource: string, params: ExecuteExtractPieceMetadata }): Promise<PieceMetadata> {
        const { pieceName, pieceVersion } = params
        const piece = await pieceLoader.loadPieceOrThrow({ pieceName, pieceVersion, piecesSource })

        return {
            ...piece.metadata(),
            name: pieceName,
            version: pieceVersion,
        }
    },
}
