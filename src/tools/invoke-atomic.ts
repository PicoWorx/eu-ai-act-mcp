import type { ClassifyInput, ClassifyOutput } from "../schemas/classify.js";
import type { Art6ExceptionInput, Art6ExceptionOutput } from "../schemas/art6.js";
import type { GpaiSystemicInput, GpaiSystemicOutput } from "../schemas/gpai-systemic.js";
import type { ObligationsInput, ObligationsOutput } from "../schemas/obligations.js";
import { registerClassifyTool } from "./classify.js";
import { registerArt6ExceptionTool } from "./art6-exception.js";
import { registerGpaiSystemicTool } from "./gpai-systemic.js";
import { registerObligationsTool } from "./obligations.js";

type AtomicResult<Output> = {
  content: unknown[];
  structuredContent: Output;
};

type RegisterFunction = (server: any) => void;

async function invokeRegistered<Input, Output>(
  register: RegisterFunction,
  toolName: string,
  input: Input,
): Promise<Output> {
  let handler: ((value: Input) => Promise<AtomicResult<Output>>) | undefined;
  register({
    registerTool(name: string, _metadata: unknown, candidate: typeof handler) {
      if (name === toolName) handler = candidate;
    },
  });
  if (!handler) throw new Error(`Atomic tool handler was not registered: ${toolName}`);
  return (await handler(input)).structuredContent;
}

export function invokeClassifier(input: ClassifyInput): Promise<ClassifyOutput> {
  return invokeRegistered(registerClassifyTool, "euaiact_classify_system", input);
}

export function invokeArt6Exception(
  input: Art6ExceptionInput,
): Promise<Art6ExceptionOutput> {
  return invokeRegistered(
    registerArt6ExceptionTool,
    "euaiact_assess_art6_3_exception",
    input,
  );
}

export function invokeGpaiSystemic(
  input: GpaiSystemicInput,
): Promise<GpaiSystemicOutput> {
  return invokeRegistered(
    registerGpaiSystemicTool,
    "euaiact_check_gpai_systemic_risk",
    input,
  );
}

export function invokeObligations(
  input: ObligationsInput,
): Promise<ObligationsOutput> {
  return invokeRegistered(registerObligationsTool, "euaiact_get_obligations", input);
}
