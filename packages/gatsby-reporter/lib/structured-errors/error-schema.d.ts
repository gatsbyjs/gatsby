/// <reference types="hapi__joi" />
import Joi from "@hapi/joi";
import { ILocationPosition, IStructuredError } from "./types";
export declare const Position: Joi.ObjectSchema<ILocationPosition>;
export declare const errorSchema: Joi.ObjectSchema<IStructuredError>;
