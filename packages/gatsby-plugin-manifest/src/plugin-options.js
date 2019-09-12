const defaultConfig = {
  legacy: true,
  theme_color_in_head: true,
  cache_busting_mode: `query`,
  crossOrigin: `anonymous`,
  include_favicon: true,
}

const validOptions = Joi =>
  Joi.object()
    .keys({
      icon: Joi.string(),
      legacy: Joi.boolean().default(defaultConfig.legacy),
      theme_color_in_head: Joi.boolean().default(
        defaultConfig.theme_color_in_head
      ),
      cache_busting_mode: Joi.string()
        .valid(`none`, `query`, `name`)
        .default(defaultConfig.cache_busting_mode),
      crossOrigin: Joi.string().default(defaultConfig.crossOrigin),
      include_favicon: Joi.boolean().default(defaultConfig.include_favicon),
      icon_options: Joi.object(),
      localize: Joi.array().items(Joi.object()),
      icons: Joi.array().items(Joi.object()),
    })
    .or(`icon`, `icons`)

export default validOptions
