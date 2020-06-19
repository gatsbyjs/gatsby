import { ErrorLevel, ErrorType } from "./types";
declare const errors: {
    "": {
        text: (context: any) => string;
        level: ErrorLevel;
    };
    95312: {
        text: (context: any) => string;
        level: ErrorLevel;
        docsUrl: string;
    };
    95313: {
        text: (context: any) => string;
        level: ErrorLevel;
        docsUrl: string;
    };
    98123: {
        text: (context: any) => string;
        type: ErrorType;
        level: ErrorLevel;
    };
    98124: {
        text: (context: any) => string;
        type: ErrorType;
        level: ErrorLevel;
    };
    85901: {
        text: (context: any) => string;
        type: ErrorType;
        level: ErrorLevel;
    };
    85907: {
        text: (context: any) => string;
        type: ErrorType;
        level: ErrorLevel;
    };
    85908: {
        text: (context: any) => string;
        type: ErrorType;
        level: ErrorLevel;
    };
    85909: {
        text: (context: any) => string;
        type: ErrorType;
        level: ErrorLevel;
    };
    85910: {
        text: (context: any) => string;
        type: ErrorType;
        level: ErrorLevel;
        docsUrl: string;
    };
    85911: {
        text: (context: any) => string;
        type: ErrorType;
        level: ErrorLevel;
    };
    85912: {
        text: (context: any) => string;
        type: ErrorType;
        level: ErrorLevel;
    };
    85913: {
        text: (context: any) => string;
        type: ErrorType;
        level: ErrorLevel;
    };
    85914: {
        text: (context: any) => string;
        type: ErrorType;
        level: ErrorLevel;
    };
    85915: {
        text: (context: any) => string;
        type: ErrorType;
        level: ErrorLevel;
    };
    85916: {
        text: (context: any) => string;
        type: ErrorType;
        level: ErrorLevel;
    };
    85917: {
        text: (context: any) => string;
        type: ErrorType;
        level: ErrorLevel;
    };
    85918: {
        text: (context: any) => string;
        type: ErrorType;
        level: ErrorLevel;
    };
    85919: {
        text: (context: any) => string;
        type: ErrorType;
        level: ErrorLevel;
    };
    85920: {
        text: (context: any) => string;
        type: ErrorType;
        level: ErrorLevel;
    };
    85921: {
        text: (context: any) => string;
        type: ErrorType;
        level: ErrorLevel;
    };
    85922: {
        text: (context: any) => string;
        type: ErrorType;
        level: ErrorLevel;
    };
    85923: {
        text: (context: any) => string;
        type: ErrorType;
        level: ErrorLevel;
    };
    85924: {
        text: (context: any) => string;
        type: ErrorType;
        level: ErrorLevel;
    };
    85925: {
        text: (context: any) => string;
        type: ErrorType;
        level: ErrorLevel;
    };
    85926: {
        text: (context: any) => string;
        type: ErrorType;
        level: ErrorLevel;
    };
    85927: {
        text: (context: any) => string;
        type: ErrorType;
        level: ErrorLevel;
    };
    10122: {
        text: (context: any) => string;
        type: ErrorType;
        level: ErrorLevel;
    };
    10123: {
        text: (context: any) => string;
        type: ErrorType;
        level: ErrorLevel;
    };
    10124: {
        text: (context: any) => string;
        type: ErrorType;
        level: ErrorLevel;
    };
    10125: {
        text: (context: any) => string;
        type: ErrorType;
        level: ErrorLevel;
    };
    10126: {
        text: (context: any) => string;
        type: ErrorType;
        level: ErrorLevel;
    };
    10226: {
        text: (context: any) => string;
        type: ErrorType;
        level: ErrorLevel;
    };
    11321: {
        text: (context: any) => string;
        type: ErrorType;
        level: ErrorLevel;
    };
    11322: {
        text: (context: any) => string;
        level: ErrorLevel;
    };
    11323: {
        text: (context: any) => string;
        level: ErrorLevel;
    };
    11324: {
        text: (context: any) => string;
        level: ErrorLevel;
    };
    11325: {
        text: (context: any) => string;
        level: ErrorLevel;
    };
    11326: {
        text: (context: any) => string;
        level: ErrorLevel;
    };
    11327: {
        text: (context: any) => string;
        level: ErrorLevel;
    };
    11328: {
        text: (context: any) => string;
        level: ErrorLevel;
    };
    11329: {
        text: (context: any) => string;
        level: ErrorLevel;
    };
    11330: {
        text: (context: any) => string;
        type: ErrorType;
        level: ErrorLevel;
    };
    11331: {
        text: (context: any) => string;
        level: ErrorLevel;
    };
    11467: {
        text: (context: any) => string;
        level: ErrorLevel;
        docsUrl: string;
    };
    11521: {
        text: () => string;
        level: ErrorLevel;
        docsUrl: string;
    };
    11522: {
        text: () => string;
        level: ErrorLevel;
        docsUrl: string;
    };
    11610: {
        text: (context: any) => string;
        level: ErrorLevel;
        docsUrl: string;
    };
    11611: {
        text: (context: any) => string;
        level: ErrorLevel;
        docsUrl: string;
    };
    11612: {
        text: (context: any) => string;
        level: ErrorLevel;
        docsUrl: string;
    };
    11613: {
        text: (context: any) => string;
        level: ErrorLevel;
        docsUrl: string;
    };
};
export declare type ErrorId = keyof typeof errors;
export declare const errorMap: Record<ErrorId, IErrorMapEntry>;
export declare const defaultError: IErrorMapEntry;
export interface IErrorMapEntry {
    text: (context: any) => string;
    level: ErrorLevel;
    type?: ErrorType;
    docsUrl?: string;
}
export {};
