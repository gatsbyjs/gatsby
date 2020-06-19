import stackTrace from "stack-trace";
import { IStructuredStackFrame } from "./types";
export declare const sanitizeStructuredStackTrace: (stack: stackTrace.StackFrame[]) => IStructuredStackFrame[];
