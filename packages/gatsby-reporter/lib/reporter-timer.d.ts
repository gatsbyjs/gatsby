import { Span } from "opentracing";
import { reporter as gatsbyReporter } from "./reporter";
import { ITimerReporter } from "./types";
interface ICreateTimerReporterArguments {
    text: string;
    id: string;
    span: Span;
    reporter: typeof gatsbyReporter;
}
export declare const createTimerReporter: ({ text, id, span, reporter, }: ICreateTimerReporterArguments) => ITimerReporter;
export {};
