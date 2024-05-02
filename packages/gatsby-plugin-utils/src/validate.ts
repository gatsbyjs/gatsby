import type { ValidationOptions } from "joi";
import { type ObjectSchema, Joi } from "./joi";
// import type { PluginOptions } from "gatsby";

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any; // PluginOptions;
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pluginOptions: any, // PluginOptions,
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
