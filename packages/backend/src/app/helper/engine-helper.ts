import fs from 'node:fs/promises'
import {
    apId,
    EngineOperation,
    EngineOperationType,
    ExecuteActionOperation,
    ExecuteFlowOperation,
    ExecutePropsOptions,
    ExecuteTriggerOperation,
    ExecutionOutput,
    PieceTrigger,
    PrincipalType,
    ProjectId,
    TriggerHookType,
    ExecuteTriggerResponse,
    ExecuteActionResponse,
    EngineResponseStatus,
    ActivepiecesError,
    ErrorCode,
    ExecuteCodeOperation,
    ExecuteExtractPieceMetadata,
    ExecuteValidateAuthOperation,
    ExecuteValidateAuthResponse,
    EngineTestOperation,
    CodeActionSettings,
} from '@activepieces/shared'
import { Sandbox } from '../workers/sandbox'
import { tokenUtils } from '../authentication/lib/token-utils'
import {
    DropdownState,
    DynamicPropsValue,
    PieceMetadata,
} from '@activepieces/pieces-framework'
import { logger } from '../helper/logger'
import chalk from 'chalk'
import { getEdition, getWebhookSecret } from './secret-helper'
import { appEventRoutingService } from '../app-event-routing/app-event-routing.service'
import { pieceMetadataService } from '../pieces/piece-metadata-service'
import { flowVersionService } from '../flows/flow-version/flow-version.service'
import { fileService } from '../file/file.service'
import { sandboxProvisioner } from '../workers/sandbox/provisioner/sandbox-provisioner'
import { SandBoxCacheType } from '../workers/sandbox/provisioner/sandbox-cache-type'

type GenerateWorkerTokenParams = {
    projectId: ProjectId
}

export type EngineHelperFlowResult = ExecutionOutput

export type EngineHelperTriggerResult<
    T extends TriggerHookType = TriggerHookType,
> = ExecuteTriggerResponse<T>

export type EngineHelperPropResult =
  | DropdownState<unknown>
  | Record<string, DynamicPropsValue>

export type EngineHelperActionResult = ExecuteActionResponse

export type EngineHelperValidateAuthResult = ExecuteValidateAuthResponse

export type EngineHelperCodeResult = ExecuteActionResponse
export type EngineHelperExtractPieceInformation = Omit<
PieceMetadata,
'name' | 'version'
>

export type EngineHelperResult =
  | EngineHelperFlowResult
  | EngineHelperTriggerResult
  | EngineHelperPropResult
  | EngineHelperCodeResult
  | EngineHelperExtractPieceInformation
  | EngineHelperActionResult
  | EngineHelperValidateAuthResult

export type EngineHelperResponse<Result extends EngineHelperResult> = {
    status: EngineResponseStatus
    result: Result
    standardError: string
    standardOutput: string
}

const generateWorkerToken = (
    request: GenerateWorkerTokenParams,
): Promise<string> => {
    return tokenUtils.encode({
        type: PrincipalType.WORKER,
        id: apId(),
        projectId: request.projectId,
    })
}

function tryParseJson(value: unknown) {
    try {
        return JSON.parse(value as string)
    }
    catch (e) {
        return value
    }
}

const execute = async <Result extends EngineHelperResult>(
    operation: EngineOperationType,
    sandbox: Sandbox,
    input: EngineOperation,
): Promise<EngineHelperResponse<Result>> => {
    logger.debug({ operation, sandboxId: sandbox.boxId }, '[EngineHelper#execute]')

    const sandboxPath = sandbox.getSandboxFolderPath()

    const serializedInput = JSON.stringify({
        ...input,
        apiUrl: 'http://127.0.0.1:3000',
    })

    await fs.writeFile(`${sandboxPath}/input.json`, serializedInput)
    const sandboxResponse = await sandbox.runOperation(operation)

    sandboxResponse.standardOutput.split('\n').forEach((f) => {
        if (f.trim().length > 0) logger.debug({}, chalk.yellow(f))
    })

    sandboxResponse.standardError.split('\n').forEach((f) => {
        if (f.trim().length > 0) logger.debug({}, chalk.red(f))
    })

    if (sandboxResponse.verdict === EngineResponseStatus.TIMEOUT) {
        throw new ActivepiecesError({
            code: ErrorCode.EXECUTION_TIMEOUT,
            params: {},
        })
    }

    const result: Result = tryParseJson(sandboxResponse.output)

    const response = {
        status: sandboxResponse.verdict,
        result,
        standardError: sandboxResponse.standardError,
        standardOutput: sandboxResponse.standardOutput,
    }

    logger.trace(response, '[EngineHelper#response] response')

    return response
}

export const engineHelper = {
    async executeFlow(
        sandbox: Sandbox,
        operation: ExecuteFlowOperation,
    ): Promise<EngineHelperResponse<EngineHelperFlowResult>> {
        logger.debug({
            executionType: operation.executionType,
            flowRunId: operation.flowRunId,
            projectId: operation.projectId,
            sandboxId: sandbox.boxId,
        }, '[EngineHelper#executeFlow]')

        const input = {
            ...operation,
            workerToken: await generateWorkerToken({ projectId: operation.projectId }),
        }

        return await execute(EngineOperationType.EXECUTE_FLOW, sandbox, input)
    },

    async executeTrigger<T extends TriggerHookType>(
        operation: ExecuteTriggerOperation<T>,
    ): Promise<EngineHelperResponse<EngineHelperTriggerResult<T>>> {
        logger.debug({ hookType: operation.hookType, projectId: operation.projectId }, '[EngineHelper#executeTrigger]')

        const lockedFlowVersion = await flowVersionService.lockPieceVersions(
            operation.projectId,
            operation.flowVersion,
        )

        const { pieceName, pieceVersion } = (lockedFlowVersion.trigger as PieceTrigger).settings

        const exactPieceVersion = await pieceMetadataService.getExactPieceVersion({
            name: pieceName,
            version: pieceVersion,
            projectId: operation.projectId,
        })

        const sandbox = await sandboxProvisioner.provision({
            type: SandBoxCacheType.PIECE,
            pieceName,
            pieceVersion: exactPieceVersion,
            pieces: [
                {
                    name: pieceName,
                    version: exactPieceVersion,
                },
            ],
        })

        try {
            const input = {
                ...operation,
                pieceVersion: exactPieceVersion,
                flowVersion: lockedFlowVersion,
                edition: getEdition(),
                appWebhookUrl: await appEventRoutingService.getAppWebhookUrl({
                    appName: pieceName,
                }),
                webhookSecret: await getWebhookSecret(operation.flowVersion),
                workerToken: await generateWorkerToken({ projectId: operation.projectId }),
            }

            return await execute(
                EngineOperationType.EXECUTE_TRIGGER_HOOK,
                sandbox,
                input,
            )
        }
        finally {
            await sandboxProvisioner.release({ sandbox })
        }
    },

    async executeProp(
        operation: ExecutePropsOptions,
    ): Promise<EngineHelperResponse<EngineHelperPropResult>> {
        logger.debug({
            pieceName: operation.pieceName,
            pieceVersion: operation.pieceVersion,
            projectId: operation.projectId,
            stepName: operation.stepName,
        }, '[EngineHelper#executeProp]')

        const { pieceName, pieceVersion } = operation

        const exactPieceVersion = await pieceMetadataService.getExactPieceVersion({
            name: pieceName,
            version: pieceVersion,
            projectId: operation.projectId,
        })

        const sandbox = await sandboxProvisioner.provision({
            type: SandBoxCacheType.PIECE,
            pieceName,
            pieceVersion: exactPieceVersion,
            pieces: [
                {
                    name: pieceName,
                    version: exactPieceVersion,
                },
            ],
        })

        try {
            const input = {
                ...operation,
                pieceVersion: exactPieceVersion,
                workerToken: await generateWorkerToken({ projectId: operation.projectId }),
            }

            return await execute(
                EngineOperationType.EXECUTE_PROPERTY,
                sandbox,
                input,
            )
        }
        finally {
            await sandboxProvisioner.release({ sandbox })
        }
    },

    async executeCode(
        operation: ExecuteCodeOperation,
    ): Promise<EngineHelperResponse<EngineHelperCodeResult>> {
        logger.debug({
            flowVersionId: operation.flowVersion.id,
            stepName: operation.step.name,
        }, '[EngineHelper#executeCode]')

        const sourceId = (operation.step.settings as CodeActionSettings).artifactSourceId!

        const fileEntity = await fileService.getOneOrThrow({
            projectId: operation.projectId,
            fileId: sourceId,
        })

        const sandbox = await sandboxProvisioner.provision({
            type: SandBoxCacheType.CODE,
            artifactSourceId: sourceId,
            codeArchives: [
                {
                    id: sourceId,
                    content: fileEntity.data,
                },
            ],
        })

        try {
            const input = {
                ...operation,
                workerToken: await generateWorkerToken({ projectId: operation.projectId }),
            }
            return execute(EngineOperationType.EXECUTE_CODE, sandbox, input)
        }
        finally {
            await sandboxProvisioner.release({ sandbox })
        }
    },

    async extractPieceMetadata(
        operation: ExecuteExtractPieceMetadata,
    ): Promise<EngineHelperResponse<EngineHelperExtractPieceInformation>> {
        logger.debug({
            pieceName: operation.pieceName,
            pieceVersion: operation.pieceVersion,
        }, '[EngineHelper#extractPieceMetadata]')

        const { pieceName, pieceVersion } = operation

        const sandbox = await sandboxProvisioner.provision({
            type: SandBoxCacheType.PIECE,
            pieceName,
            pieceVersion,
            pieces: [
                {
                    name: pieceName,
                    version: pieceVersion,
                },
            ],
        })

        try {
            return await execute(
                EngineOperationType.EXTRACT_PIECE_METADATA,
                sandbox,
                operation,
            )
        }
        finally {
            await sandboxProvisioner.release({ sandbox })
        }
    },

    async executeAction(operation: ExecuteActionOperation): Promise<EngineHelperResponse<EngineHelperActionResult>> {
        logger.debug({
            flowVersionId: operation.flowVersion.id,
            pieceName: operation.pieceName,
            pieceVersion: operation.pieceVersion,
            actionName: operation.actionName,
        }, '[EngineHelper#executeAction]')

        const { pieceName, pieceVersion } = operation

        const exactPieceVersion = await pieceMetadataService.getExactPieceVersion({
            name: pieceName,
            version: pieceVersion,
            projectId: operation.projectId,
        })

        const sandbox = await sandboxProvisioner.provision({
            type: SandBoxCacheType.PIECE,
            pieceName,
            pieceVersion: exactPieceVersion,
            pieces: [
                {
                    name: pieceName,
                    version: exactPieceVersion,
                },
            ],
        })

        try {
            const input = {
                ...operation,
                pieceVersion: exactPieceVersion,
                workerToken: await generateWorkerToken({ projectId: operation.projectId }),
            }

            return await execute(EngineOperationType.EXECUTE_ACTION, sandbox, input)
        }
        finally {
            await sandboxProvisioner.release({
                sandbox,
            })
        }
    },

    async executeValidateAuth(
        operation: ExecuteValidateAuthOperation,
    ): Promise<EngineHelperResponse<EngineHelperValidateAuthResult>> {
        logger.debug({
            pieceName: operation.pieceName,
            pieceVersion: operation.pieceVersion,
        }, '[EngineHelper#executeValidateAuth]')

        const { pieceName, pieceVersion } = operation

        const exactPieceVersion = await pieceMetadataService.getExactPieceVersion({
            name: pieceName,
            version: pieceVersion,
            projectId: operation.projectId,
        })

        const sandbox = await sandboxProvisioner.provision({
            type: SandBoxCacheType.PIECE,
            pieceName,
            pieceVersion: exactPieceVersion,
            pieces: [
                {
                    name: pieceName,
                    version: exactPieceVersion,
                },
            ],
        })

        try {
            const input = {
                ...operation,
                pieceVersion: exactPieceVersion,
                workerToken: await generateWorkerToken({ projectId: operation.projectId }),
            }

            return await execute(
                EngineOperationType.EXECUTE_VALIDATE_AUTH,
                sandbox,
                input,
            )
        }
        finally {
            await sandboxProvisioner.release({ sandbox })
        }
    },

    async executeTest(sandbox: Sandbox, operation: EngineTestOperation): Promise<EngineHelperResponse<EngineHelperFlowResult>> {
        logger.debug({
            flowVersionId: operation.sourceFlowVersion.id,
            projectId: operation.projectId,
            sandboxId: sandbox.boxId,
            executionType: operation.executionType,
        }, '[EngineHelper#executeTest]')

        const input = {
            ...operation,
            workerToken: await generateWorkerToken({ projectId: operation.projectId }),
        }

        return await execute(EngineOperationType.EXECUTE_TEST, sandbox, input)
    },
}
