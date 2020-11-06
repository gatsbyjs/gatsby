"use strict";

exports.pluginOptionsSchema = function (_ref) {
  var Joi = _ref.Joi;
  return Joi.object({
    offsetY: Joi.number().integer().description("Signed integer. Vertical offset value in pixels.").default(0),
    icon: Joi.alternatives().try(Joi.string(), Joi.boolean()).description("SVG shape inside a template literal or boolean 'false'. Set your own svg or disable icon."),
    className: Joi.string().description("Set your own class for the anchor.").default("anchor"),
    maintainCase: Joi.boolean().description("Maintains the case for markdown header."),
    removeAccents: Joi.boolean().description("Remove accents from generated headings IDs."),
    enableCustomId: Joi.boolean().description("Enable custom header IDs with `{#id}`"),
    isIconAfterHeader: Joi.boolean().description("Enable the anchor icon to be inline at the end of the header text."),
    elements: Joi.array().items(Joi.string()).description("Specify which type of header tags to link.")
  });
};