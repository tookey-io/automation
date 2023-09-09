import { TSchema, Type } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import { PiecePropertyMap, PropertyType } from '@activepieces/pieces-framework'
import {
    ActionType,
    apId,
    BranchActionSettingsWithValidation,
    CodeActionSettings,
    flowHelper,
    FlowId,
    FlowOperationRequest,
    FlowOperationType,
    FlowVersion,
    FlowVersionId,
    FlowVersionState,
    ImportFlowRequest,
    LoopOnItemsActionSettingsWithValidation,
    PieceActionSettings,
    PieceTriggerSettings,
    ProjectId,
    TriggerType,
    UserId,
} from '@activepieces/shared'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'
import { fileService } from '../../file/file.service'
import { ActivepiecesError, ErrorCode } from '@activepieces/shared'
import { databaseConnection } from '../../database/database-connection'
import { FlowVersionEntity } from './flow-version-entity'
import { flowVersionSideEffects } from './flow-version-side-effects'
import { DEFAULT_SAMPLE_DATA_SETTINGS } from '@activepieces/shared'
import { isNil } from '@activepieces/shared'
import { pieceMetadataService } from '../../pieces/piece-metadata-service'
import dayjs from 'dayjs'
import { captureException } from '../../helper/logger'
import { stepFileService } from '../step-file/step-file.service'

const branchSettingsValidator = TypeCompiler.Compile(BranchActionSettingsWithValidation)
const loopSettingsValidator = TypeCompiler.Compile(LoopOnItemsActionSettingsWithValidation)
const flowVersionRepo = databaseConnection.getRepository<FlowVersion>(FlowVersionEntity)

export const flowVersionService = {
    async lockPieceVersions(projectId: ProjectId, mutatedFlowVersion: FlowVersion): Promise<FlowVersion> {
        return await flowHelper.transferFlowAsync(mutatedFlowVersion, async (step) => {
            const clonedStep = JSON.parse(JSON.stringify(step))
            switch (step.type) {
                case ActionType.PIECE:
                case TriggerType.PIECE: {
                    const newVersion = await pieceMetadataService.get({
                        projectId,
                        name: step.settings.pieceName,
                        version: step.settings.pieceVersion,
                    })
                    clonedStep.settings.pieceVersion = newVersion.version
                    break
                }
                default:
                    break
            }
            return clonedStep
        })
    },
    async applyOperation(userId: UserId, projectId: ProjectId, flowVersion: FlowVersion, userOperation: FlowOperationRequest): Promise<FlowVersion> {
        let operations: FlowOperationRequest[] = []
        let mutatedFlowVersion = flowVersion
        switch (userOperation.type) {
            case FlowOperationType.IMPORT_FLOW:
                operations = handleImportFlowOperation(flowVersion, userOperation.request)
                break
            case FlowOperationType.LOCK_FLOW:
                mutatedFlowVersion = await this.lockPieceVersions(projectId, mutatedFlowVersion)
                operations = [userOperation]
                break
            default:
                operations = [userOperation]
                break
        }
        for (const operation of operations) {
            mutatedFlowVersion = await applySingleOperation(projectId, mutatedFlowVersion, operation)
        }
        mutatedFlowVersion.updated = dayjs().toISOString()
        mutatedFlowVersion.updatedBy = userId
        await flowVersionRepo.update(flowVersion.id, mutatedFlowVersion as QueryDeepPartialEntity<FlowVersion>)
        return flowVersionRepo.findOneByOrFail({
            id: flowVersion.id,
        })
    },
    async getOne(id: FlowVersionId): Promise<FlowVersion | null> {
        if (isNil(id)) {
            return null
        }
        return await flowVersionRepo.findOneBy({
            id,
        })
    },
    async getOneOrThrow(id: FlowVersionId): Promise<FlowVersion> {
        const flowVersion = await flowVersionService.getOne(id)
        if (isNil(flowVersion)) {
            throw new ActivepiecesError({
                code: ErrorCode.FLOW_VERSION_NOT_FOUND,
                params: {
                    id,
                },
            })
        }

        return flowVersion
    },
    async getFlowVersion({ projectId, flowId, versionId, removeSecrets, includeArtifactAsBase64 }: { projectId: ProjectId, flowId: FlowId, versionId: FlowVersionId | undefined, removeSecrets: boolean, includeArtifactAsBase64: boolean }): Promise<FlowVersion> {
        let flowVersion = await flowVersionRepo.findOneOrFail({
            where: {
                flowId,
                id: versionId,
            },
            order: {
                created: 'DESC',
            },
        })
        if (removeSecrets) {
            flowVersion = await removeSecretsFromFlow(flowVersion)
        }
        if (includeArtifactAsBase64) {
            flowVersion = await addArtifactsAsBase64(projectId, flowVersion)
        }
        return flowVersion
    },
    async createEmptyVersion(flowId: FlowId, request: {
        displayName: string
    }): Promise<FlowVersion> {
        const flowVersion: Partial<FlowVersion> = {
            id: apId(),
            displayName: request.displayName,
            flowId,
            trigger: {
                type: TriggerType.EMPTY,
                name: 'trigger',
                settings: {},
                valid: false,
                displayName: 'Select Trigger',
            },
            valid: false,
            state: FlowVersionState.DRAFT,
        }
        return await flowVersionRepo.save(flowVersion)
    },
}

async function applySingleOperation(projectId: ProjectId, flowVersion: FlowVersion, operation: FlowOperationRequest): Promise<FlowVersion> {
    await flowVersionSideEffects.preApplyOperation({
        projectId,
        flowVersion,
        operation,
    })
    operation = await prepareRequest(projectId, flowVersion, operation)
    return flowHelper.apply(flowVersion, operation)
}

async function removeSecretsFromFlow(flowVersion: FlowVersion): Promise<FlowVersion> {
    const flowVersionWithArtifacts: FlowVersion = JSON.parse(JSON.stringify(flowVersion))

    const steps = flowHelper.getAllSteps(flowVersionWithArtifacts.trigger)
    for (const step of steps) {
        /*
        Remove Sample Data & connections
        */
        step.settings.inputUiInfo = DEFAULT_SAMPLE_DATA_SETTINGS
        step.settings.input = replaceConnections(step.settings.input)
    }
    return flowVersionWithArtifacts
}

function replaceConnections(obj: Record<string, unknown>): Record<string, unknown> {
    if (isNil(obj)) {
        return obj
    }
    const replacedObj: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(obj)) {
        if (Array.isArray(value)) {
            replacedObj[key] = value
        }
        else if (typeof value === 'object' && value !== null) {
            replacedObj[key] = replaceConnections(value as Record<string, unknown>)
        }
        else if (typeof value === 'string') {
            const replacedValue = value.replace(/\{{connections\.[^}]*}}/g, '')
            replacedObj[key] = replacedValue === '' ? undefined : replacedValue
        }
        else {
            replacedObj[key] = value
        }
    }
    return replacedObj
}


function handleImportFlowOperation(flowVersion: FlowVersion, operation: ImportFlowRequest): FlowOperationRequest[] {
    const actionsToRemove = flowHelper.getAllStepsAtFirstLevel(flowVersion.trigger).filter(step => flowHelper.isAction(step.type))
    const operations: FlowOperationRequest[] = actionsToRemove.map(step => ({
        type: FlowOperationType.DELETE_ACTION,
        request: {
            name: step.name,
        },
    }))
    operations.push({
        type: FlowOperationType.UPDATE_TRIGGER,
        request: operation.trigger,
    })
    operations.push(...flowHelper.getImportOperations(operation.trigger))
    return operations
}

async function addArtifactsAsBase64(projectId: ProjectId, flowVersion: FlowVersion) {
    const flowVersionWithArtifacts: FlowVersion = JSON.parse(JSON.stringify(flowVersion))
    const steps = flowHelper.getAllSteps(flowVersionWithArtifacts.trigger)
    
    const artifactPromises = steps
        .filter(step => step.type === ActionType.CODE)
        .map(async (step) => {
            const codeSettings: CodeActionSettings = step.settings
            try {
                const artifact = await fileService.getOne({ projectId, fileId: codeSettings.artifactSourceId! })
                if (artifact !== null) {
                    codeSettings.artifactSourceId = undefined
                    codeSettings.artifact = artifact.data.toString('base64')
                }
            }
            catch (error) {
                captureException(error)
            }
        })

    await Promise.all(artifactPromises)
    return flowVersionWithArtifacts
}


async function prepareRequest(projectId: ProjectId, flowVersion: FlowVersion, request: FlowOperationRequest) {
    const clonedRequest: FlowOperationRequest = JSON.parse(JSON.stringify(request))
    switch (clonedRequest.type) {
        case FlowOperationType.ADD_ACTION:
            clonedRequest.request.action.valid = true
            switch (clonedRequest.request.action.type) {
                case ActionType.MISSING:
                    clonedRequest.request.action.valid = false
                    break
                case ActionType.LOOP_ON_ITEMS:
                    clonedRequest.request.action.valid = loopSettingsValidator.Check(clonedRequest.request.action.settings)
                    break
                case ActionType.BRANCH:
                    clonedRequest.request.action.valid = branchSettingsValidator.Check(clonedRequest.request.action.settings)
                    break
                case ActionType.PIECE:
                    clonedRequest.request.action.valid = await validateAction({
                        settings: clonedRequest.request.action.settings,
                        projectId,
                    })
                    break
                case ActionType.CODE: {
                    const codeSettings: CodeActionSettings = clonedRequest.request.action.settings
                    await uploadArtifact(projectId, codeSettings)
                    break
                }
            }
            break
        case FlowOperationType.UPDATE_ACTION:
            clonedRequest.request.valid = true
            switch (clonedRequest.request.type) {
                case ActionType.MISSING:
                    clonedRequest.request.valid = false
                    break
                case ActionType.LOOP_ON_ITEMS:
                    clonedRequest.request.valid = loopSettingsValidator.Check(clonedRequest.request.settings)
                    break
                case ActionType.BRANCH:
                    clonedRequest.request.valid = branchSettingsValidator.Check(clonedRequest.request.settings)
                    break
                case ActionType.PIECE: {
                    clonedRequest.request.valid = await validateAction({
                        settings: clonedRequest.request.settings,
                        projectId,
                    })
                    const previousStep = flowHelper.getStep(flowVersion, clonedRequest.request.name)
                    if (
                        previousStep !== undefined &&
                        previousStep.type === ActionType.PIECE &&
                        clonedRequest.request.settings.pieceName !== previousStep.settings.pieceName
                    ) {
                        await stepFileService.deleteAll({ projectId, flowId: flowVersion.flowId, stepName: previousStep.name })
                    }
                    break
                }
                case ActionType.CODE: {
                    const codeSettings: CodeActionSettings = clonedRequest.request.settings
                    await uploadArtifact(projectId, codeSettings)
                    const previousStep = flowHelper.getStep(flowVersion, clonedRequest.request.name)
                    if (
                        previousStep !== undefined &&
                        previousStep.type === ActionType.CODE &&
                        codeSettings.artifactSourceId !== previousStep.settings.artifactSourceId
                    ) {
                        await deleteArtifact(projectId, previousStep.settings)
                    }
                    break
                }
            }
            break
        case FlowOperationType.DELETE_ACTION: {
            const previousStep = flowHelper.getStep(flowVersion, clonedRequest.request.name)
            if (previousStep !== undefined && previousStep.type === ActionType.CODE) {
                await deleteArtifact(projectId, previousStep.settings)
            }
            if (previousStep !== undefined && previousStep.type === ActionType.PIECE) {
                await stepFileService.deleteAll({ projectId, flowId: flowVersion.flowId, stepName: previousStep.name })
            }
            break
        }

        case FlowOperationType.UPDATE_TRIGGER:
            switch (clonedRequest.request.type) {
                case TriggerType.EMPTY:
                    clonedRequest.request.valid = false
                    break
                case TriggerType.PIECE:
                    clonedRequest.request.valid = await validateTrigger({
                        settings: clonedRequest.request.settings,
                        projectId,
                    })
                    break
                default:
                    clonedRequest.request.valid = true
                    break
            }
            break
        default:
            break
    }
    return clonedRequest
}


async function validateAction({ projectId, settings }: { projectId: ProjectId, settings: PieceActionSettings }) {

    if (
        isNil(settings.pieceName) ||
        isNil(settings.pieceVersion) ||
        isNil(settings.actionName) ||
        isNil(settings.input)
    ) {
        return false
    }

    const piece = await pieceMetadataService.get({
        projectId,
        name: settings.pieceName,
        version: settings.pieceVersion,
    })

    if (isNil(piece)) {
        return false
    }
    const action = piece.actions[settings.actionName]
    if (isNil(action)) {
        return false
    }
    return validateProps(action.props, settings.input)
}

async function validateTrigger({ settings, projectId }: { settings: PieceTriggerSettings, projectId: ProjectId }) {
    if (
        isNil(settings.pieceName) ||
        isNil(settings.pieceVersion) ||
        isNil(settings.triggerName) ||
        isNil(settings.input)
    ) {
        return false
    }

    const piece = await pieceMetadataService.get({
        projectId,
        name: settings.pieceName,
        version: settings.pieceVersion,
    })

    if (isNil(piece)) {
        return false
    }
    const trigger = piece.triggers[settings.triggerName]
    if (isNil(trigger)) {
        return false
    }
    return validateProps(trigger.props, settings.input)
}

function validateProps(props: PiecePropertyMap, input: Record<string, unknown>) {
    const propsSchema = buildSchema(props)
    const propsValidator = TypeCompiler.Compile(propsSchema)
    return propsValidator.Check(input)
}

function buildSchema(props: PiecePropertyMap): TSchema {
    const entries = Object.entries(props)
    const nonNullableUnknownPropType = Type.Not(Type.Union([Type.Null(), Type.Undefined()]), Type.Unknown())
    const propsSchema: Record<string, TSchema> = {}
    for (const [name, property] of entries) {
        switch (property.type) {
            case PropertyType.MARKDOWN:
                propsSchema[name] = Type.Optional(Type.Union([Type.Null(), Type.Undefined(), Type.Never()]))
                break
            case PropertyType.DATE_TIME:
            case PropertyType.SHORT_TEXT:
            case PropertyType.LONG_TEXT:
            case PropertyType.FILE:
                propsSchema[name] = Type.String({
                    minLength: property.required ? 1 : undefined,
                })
                break
            case PropertyType.CHECKBOX:
                propsSchema[name] = Type.Union([Type.Boolean(), Type.String({})])
                break
            case PropertyType.NUMBER:
                // Because it could be a variable
                propsSchema[name] = Type.String({})
                break
            case PropertyType.STATIC_DROPDOWN:
                propsSchema[name] = nonNullableUnknownPropType
                break
            case PropertyType.DROPDOWN:
                propsSchema[name] = nonNullableUnknownPropType
                break
            case PropertyType.BASIC_AUTH:
            case PropertyType.CUSTOM_AUTH:
            case PropertyType.SECRET_TEXT:
            case PropertyType.OAUTH2:
                // Only accepts connections variable.
                propsSchema[name] = Type.Union([Type.RegEx(RegExp('{{1}{connections.(.*?)}{1}}')), Type.String()])
                break
            case PropertyType.ARRAY:
                // Only accepts connections variable.
                propsSchema[name] = Type.Union([Type.Array(Type.String({})), Type.String()])
                break
            case PropertyType.OBJECT:
                propsSchema[name] = Type.Union([Type.Record(Type.String(), Type.Any()), Type.String()])
                break
            case PropertyType.JSON:
                propsSchema[name] = Type.Union([Type.Record(Type.String(), Type.Any()), Type.Array(Type.Any()), Type.String()])
                break
            case PropertyType.MULTI_SELECT_DROPDOWN:
                propsSchema[name] = Type.Union([Type.Array(Type.Any()), Type.String()])
                break
            case PropertyType.STATIC_MULTI_SELECT_DROPDOWN:
                propsSchema[name] = Type.Union([Type.Array(Type.Any()), Type.String()])
                break
            case PropertyType.DYNAMIC:
                propsSchema[name] = Type.Record(Type.String(), Type.Any())
                break
        }

        if (!property.required) {
            propsSchema[name] = Type.Optional(Type.Union([Type.Null(), Type.Undefined(), propsSchema[name]]))
        }
    }

    return Type.Object(propsSchema)
}

async function deleteArtifact(projectId: ProjectId, codeSettings: CodeActionSettings): Promise<CodeActionSettings> {
    const requests: Promise<void>[] = []
    if (codeSettings.artifactSourceId !== undefined) {
        requests.push(fileService.delete({ projectId, fileId: codeSettings.artifactSourceId }))
    }
    await Promise.all(requests)
    return codeSettings
}

async function uploadArtifact(projectId: ProjectId, codeSettings: CodeActionSettings): Promise<CodeActionSettings> {
    if (codeSettings.artifact !== undefined) {
        const bufferFromBase64 = Buffer.from(codeSettings.artifact, 'base64')

        const savedFile = await fileService.save({
            projectId,
            data: bufferFromBase64,
        })

        codeSettings.artifact = undefined
        codeSettings.artifactSourceId = savedFile.id
    }
    return codeSettings
}
