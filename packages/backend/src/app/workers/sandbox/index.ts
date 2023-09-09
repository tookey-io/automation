import { ExecutionMode, system } from '../../helper/system/system'
import { SystemProp } from '../../helper/system/system-prop'
import { FileSandbox } from './file-sandbox'
import { IsolateSandbox } from './isolate-sandbox'

const getSandbox = () => {
    const executionMode = system.getOrThrow<ExecutionMode>(SystemProp.EXECUTION_MODE)

    const sandbox = {
        [ExecutionMode.SANDBOXED]: IsolateSandbox,
        [ExecutionMode.UNSANDBOXED]: FileSandbox,
    }

    return sandbox[executionMode]
}

export const Sandbox = getSandbox()

export type Sandbox = InstanceType<typeof Sandbox>
