import process from "node:process";

const BASE_CODE_DIRECTORY = process.env.AP_BASE_CODE_DIRECTORY ?? './codes';

export const codeExecutor = {
   async executeCode(artifact: string, params: unknown) {
      const artifactPath = `${BASE_CODE_DIRECTORY}/${artifact}/index.js`;
      const codePieceModule: CodePieceModule = await import(artifactPath);
      return codePieceModule.code(params);
  }
}

type CodePieceModule = {
  code(params: unknown): Promise<unknown>;
}
