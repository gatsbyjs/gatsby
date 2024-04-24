import type { ValidationOptions } from "joi";
import { type ObjectSchema, Joi } from "./joi";
import type { IPluginInfoOptions } from "./types";

const validationOptions: ValidationOptions = {
  // Show all errors at once, rather than only the first one every time
  abortEarly: false,
  cache: true,
};

type IOptions = {
  validateExternalRules?: boolean | undefined;
  returnWarnings?: boolean | undefined;
};

type IValidateAsyncResult = {
  value: IPluginInfoOptions;
  warning: {
    message: string;
    details: Array<{
      message: string;
      path: Array<string>;
      type: string;
      context: Array<Record<string, unknown>>;
    }>;
  };
};

export async function validateOptionsSchema(
  pluginSchema: ObjectSchema,
  pluginOptions: IPluginInfoOptions,
  options: IOptions = {
    validateExternalRules: true,
    returnWarnings: true,
  },
): Promise<IValidateAsyncResult> {
  const { validateExternalRules, returnWarnings } = options;

  const warnOnUnknownSchema = pluginSchema.pattern(
    /.*/,
    Joi.any().warning("any.unknown"),
  );

  return (await warnOnUnknownSchema.validateAsync(pluginOptions, {
    ...validationOptions,
    externals: validateExternalRules,
    warnings: returnWarnings,
  })) satisfies Promise<IValidateAsyncResult>;
}
