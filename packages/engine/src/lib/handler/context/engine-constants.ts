import { ExecuteFlowOperation, ExecuteStepOperation, ExecuteTriggerOperation, ExecutionType, Project, ProjectId, TriggerHookType } from '@activepieces/shared'
import { VariableService } from '../../services/variable-service'

export class EngineConstants {
    public static readonly API_URL = 'http://127.0.0.1:3000/'
    public static readonly BASE_CODE_DIRECTORY = process.env.AP_BASE_CODE_DIRECTORY ?? './codes'
    public static readonly INPUT_FILE = './input.json'
    public static readonly OUTPUT_FILE = './output.json'
    public static readonly PIECE_SOURCES = process.env.AP_PIECES_SOURCE ?? 'FILE'

    private project: Project | null = null

    public get apiUrl(): string {
        return EngineConstants.API_URL
    }

    public get baseCodeDirectory(): string {
        return EngineConstants.BASE_CODE_DIRECTORY
    }

    public get piecesSource(): string {
        return EngineConstants.PIECE_SOURCES
    }

    public constructor(
        public readonly flowId: string,
        public readonly flowRunId: string,
        public readonly serverUrl: string,
        public readonly executionType: ExecutionType,
        public readonly workerToken: string,
        public readonly projectId: ProjectId,
        public readonly variableService: VariableService,
        public readonly testSingleStepMode: boolean,
        public readonly filesServiceType: 'local' | 'db',
        public readonly resumePayload?: unknown,
    ) {}

    public static fromExecuteFlowInput(input: ExecuteFlowOperation): EngineConstants {
        return new EngineConstants(
            input.flowVersion.flowId,
            input.flowRunId,
            input.serverUrl,
            input.executionType,
            input.workerToken,
            input.projectId,
            new VariableService({
                projectId: input.projectId,
                workerToken: input.workerToken,
            }),
            false,
            'local',
            input.executionType === ExecutionType.RESUME ? input.resumePayload : undefined,
        )
    }

    public static fromExecuteStepInput(input: ExecuteStepOperation): EngineConstants {
        return new EngineConstants(
            input.flowVersion.flowId,
            'test-run',
            input.serverUrl,
            ExecutionType.BEGIN,
            input.workerToken,
            input.projectId,
            new VariableService({
                projectId: input.projectId,
                workerToken: input.workerToken,
            }),
            true,
            'db',
        )
    }

    public static fromExecuteTriggerInput(input: ExecuteTriggerOperation<TriggerHookType>): EngineConstants {
        return new EngineConstants(
            input.flowVersion.flowId,
            'execute-trigger',
            input.serverUrl,
            ExecutionType.BEGIN,
            input.workerToken,
            input.projectId,
            new VariableService({
                projectId: input.projectId,
                workerToken: input.workerToken,
            }),
            true,
            'db',
        )
    }

    private async getProject(): Promise<Project> {
        if (this.project) {
            return this.project
        }

        const getWorkerProjectEndpoint = `${EngineConstants.API_URL}v1/worker/project`

        const response = await fetch(getWorkerProjectEndpoint, {
            headers: {
                Authorization: `Bearer ${this.workerToken}`,
            },
        })

        this.project = await response.json() as Project
        return this.project
    }

    public externalProjectId = async (): Promise<string | undefined> => {
        const project = await this.getProject()
        return project.externalId
    }
}
