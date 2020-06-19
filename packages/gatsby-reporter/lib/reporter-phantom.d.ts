import { Span } from "opentracing";
import { IPhantomReporter } from "./types";
interface ICreatePhantomReporterArguments {
    text: string;
    id: string;
    span: Span;
}
export declare const createPhantomReporter: ({ text, id, span, }: ICreatePhantomReporterArguments) => IPhantomReporter;
export {};
