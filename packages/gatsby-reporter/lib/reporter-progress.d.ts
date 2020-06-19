import { Span } from "opentracing";
import { reporter as gatsbyReporter } from "./reporter";
import { IProgressReporter } from "./types";
interface ICreateProgressReporterArguments {
    id: string;
    text: string;
    start: number;
    total: number;
    span: Span;
    reporter: typeof gatsbyReporter;
}
export declare const createProgressReporter: ({ id, text, start, total, span, reporter, }: ICreateProgressReporterArguments) => IProgressReporter;
export {};
