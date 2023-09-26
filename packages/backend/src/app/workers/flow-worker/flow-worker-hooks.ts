
export type FlowWorkerHooks = {
    preExecute({ projectId }: { projectId: string }): Promise<void>
}

const emptyHooks: FlowWorkerHooks = {
    async preExecute() {
        // DO NOTHING
    },
}

let hooks = emptyHooks

export const flowWorkerHooks = {
    setHooks(newHooks: FlowWorkerHooks) {
        hooks = newHooks
    },
    getHooks() {
        return hooks
    },
}