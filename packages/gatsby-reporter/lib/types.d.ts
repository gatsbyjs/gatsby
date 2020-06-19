import { Span } from "opentracing";
import { IStructuredError } from "./structured-errors/types";
export declare type ErrorMeta = {
    id: string;
    error?: Error;
    context: Record<string, any>;
    [id: string]: any;
} | string | Error | ErrorMeta[];
export interface IActivityArgs {
    id?: string;
    parentSpan?: Span;
    tags?: {
        [key: string]: any;
    };
}
export interface IPhantomReporter {
    start(): void;
    end(): void;
    span: Span;
}
export interface IProgressReporter {
    start(): void;
    setStatus(statusText: string): void;
    tick(increment?: number): void;
    panicOnBuild(arg: any, ...otherArgs: any[]): IStructuredError | IStructuredError[];
    panic(arg: any, ...otherArgs: any[]): never;
    end(): void;
    done(): void;
    total: number;
    span: Span;
}
export interface ITimerReporter {
    start(): void;
    setStatus(statusText: string): void;
    panicOnBuild(arg: any, ...otherArgs: any[]): IStructuredError | IStructuredError[];
    panic(arg: any, ...otherArgs: any[]): never;
    end(): void;
    span: Span;
}
