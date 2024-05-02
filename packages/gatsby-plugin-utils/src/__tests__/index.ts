/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { validateOptionsSchema, Joi } from "../";
// import type { PluginOptions, PluginOptionsSchemaArgs } from "../../../gatsby";
import { testPluginOptionsSchema } from "../test-plugin-options-schema";

it("validates a basic schema", async () => {
  const pluginSchema = Joi.object({
    str: Joi.string(),
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const validOptions: any = {
    // @ts-ignore
    str: "is a string",
  };

  const { value } = await validateOptionsSchema(pluginSchema, validOptions);
  expect(value).toEqual(validOptions);

  const invalid = () =>
    validateOptionsSchema(pluginSchema, {
      // @ts-ignore
      str: 43,
    });

  expect(invalid()).rejects.toThrowErrorMatchingInlineSnapshot(
    '"\\"str\\" must be a string"',
  );
});

it("asynchronously validates the external validation rules", () => {
  const failingAsyncValidationRule = async () => {
    throw new Error("This failed for some unknown reason.");
  };

  const schema = Joi.object({}).external(failingAsyncValidationRule);

  const invalid = () => validateOptionsSchema(schema, {});

  expect(invalid()).rejects.toThrowErrorMatchingInlineSnapshot(
    '"This failed for some unknown reason. (value)"',
  );
});

it("does not validate async external validation rules when validateExternalRules is set to false", async () => {
  const failingAsyncValidationRule = async () => {
    throw new Error("This failed for some unknown reason.");
  };

  const schema = Joi.object({}).external(failingAsyncValidationRule);

  const invalid = () =>
    validateOptionsSchema(
      schema,
      {},
      {
        validateExternalRules: false,
      },
    );

  expect(invalid).not.toThrowError();
});

it("throws an warning on unknown values", async () => {
  const schema = Joi.object({
    str: Joi.string(),
  });

  const validWarnings = ['"notInSchema" is not allowed'];

  const optionsSchema = await testPluginOptionsSchema(
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    (_args: any) => schema,
    {
      // @ts-ignore
      str: "bla",
      notInSchema: true,
    },
  );

  expect(optionsSchema?.hasWarnings).toBe(true);
  expect(optionsSchema?.warnings).toEqual(validWarnings);
});

it("populates default values", async () => {
  const pluginSchema = Joi.object({
    str: Joi.string(),
    default: Joi.string().default("default"),
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const validOptions: any = {
    // @ts-ignore
    str: "is a string",
  };

  const { value } = await validateOptionsSchema(pluginSchema, validOptions);
  expect(value).toEqual({
    ...validOptions,
    default: "default",
  });
});
