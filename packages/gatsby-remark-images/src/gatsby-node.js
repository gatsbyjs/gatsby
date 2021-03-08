const { Potrace } = require(`potrace`)

exports.pluginOptionsSchema = function ({ Joi }) {
  return Joi.object({
    maxWidth: Joi.number()
      .default(650)
      .description(
        `The maxWidth in pixels of the div where the markdown will be displayed. This value is used when deciding what the width of the various responsive thumbnails should be.`
      ),
    linkImagesToOriginal: Joi.boolean()
      .default(true)
      .description(
        `Add a link to each image to the original image. Sometimes people want to see a full-sized version of an image e.g. to see extra detail on a part of the image and this is a convenient and common pattern for enabling this. Set this option to false to disable this behavior.`
      ),
    showCaptions: Joi.alternatives()
      .try(
        Joi.boolean(),
        Joi.array().items(
          Joi.string().valid(`title`),
          Joi.string().valid(`alt`)
        )
      )
      .default(false)
      .description(
        `Add a caption to each image with the contents of the title attribute, when this is not empty. If the title attribute is empty but the alt attribute is not, it will be used instead. Set this option to true to enable this behavior. You can also pass an array instead to specify which value should be used for the caption — for example, passing ['alt', 'title'] would use the alt attribute first, and then the title. When this is set to true it is the same as passing ['title', 'alt']. If you just want to use the title (and omit captions for images that have alt attributes but no title), pass ['title'].`
      ),
    markdownCaptions: Joi.boolean()
      .default(false)
      .description(
        `Parse the caption as markdown instead of raw text. Ignored if showCaptions is false.`
      ),
    sizeByPixelDensity: Joi.boolean()
      .default(false)
      .description(
        `[deprecated] Pixel density is only used in vector images, which Gatsby’s implementation of Sharp doesn’t support. This option is currently a no-op and will be removed in the next major version of Gatsby.`
      ),
    wrapperStyle: Joi.alternatives().try(
      Joi.object({}).unknown(true),
      Joi.function().maxArity(1),
      Joi.string()
    ),
    backgroundColor: Joi.string().default(`white`)
      .description(`Set the background color of the image to match the background image of your design.

      Note:
      - set this option to transparent for a transparent image background.
      - set this option to none to completely remove the image background.`),
    quality: Joi.number()
      .default(50)
      .description(`The quality level of the generated files.`),
    withWebp: Joi.alternatives()
      .try(Joi.object({ quality: Joi.number() }), Joi.boolean())
      .default(false)
      .description(
        `Additionally generate WebP versions alongside your chosen file format. They are added as a srcset with the appropriate mimetype and will be loaded in browsers that support the format. Pass true for default support, or an object of options to specifically override those for the WebP files. For example, pass { quality: 80 } to have the WebP images be at quality level 80.`
      ),
    tracedSVG: Joi.alternatives()
      .try(
        Joi.boolean(),
        Joi.object({
          turnPolicy: Joi.string()
            .valid(
              // this plugin also allow to use key names and not exact values
              `TURNPOLICY_BLACK`,
              `TURNPOLICY_WHITE`,
              `TURNPOLICY_LEFT`,
              `TURNPOLICY_RIGHT`,
              `TURNPOLICY_MINORITY`,
              `TURNPOLICY_MAJORITY`,
              // it also allow using actual policy values
              Potrace.TURNPOLICY_BLACK,
              Potrace.TURNPOLICY_WHITE,
              Potrace.TURNPOLICY_LEFT,
              Potrace.TURNPOLICY_RIGHT,
              Potrace.TURNPOLICY_MINORITY,
              Potrace.TURNPOLICY_MAJORITY
            )
            .default(Potrace.TURNPOLICY_MAJORITY),
          turdSize: Joi.number().default(100),
          alphaMax: Joi.number(),
          optCurve: Joi.boolean().default(true),
          optTolerance: Joi.number().default(0.4),
          threshold: Joi.alternatives()
            .try(
              Joi.number().min(0).max(255),
              Joi.number().valid(Potrace.THRESHOLD_AUTO)
            )
            .default(Potrace.THRESHOLD_AUTO),
          blackOnWhite: Joi.boolean().default(true),
          color: Joi.string().default(`lightgray`),
          background: Joi.string().default(`transparent`),
        })
      )
      .default(false)
      .description(
        `Use traced SVGs for placeholder images instead of the “blur up” effect. Pass true for traced SVGs with the default settings (seen here), or an object of options to override the default. For example, pass { color: "#F00", turnPolicy: "TURNPOLICY_MAJORITY" } to change the color of the trace to red and the turn policy to TURNPOLICY_MAJORITY. See node-potrace parameter documentation for a full listing and explanation of the available options.`
      ),
    loading: Joi.string()
      .valid(`lazy`, `eager`, `auto`)
      .default(`lazy`)
      .description(
        `Set the browser’s native lazy loading attribute. One of lazy, eager or auto.`
      ),
    disableBgImageOnAlpha: Joi.boolean()
      .default(false)
      .description(
        `Images containing transparent pixels around the edges results in images with blurry edges. As a result, these images do not work well with the “blur up” technique used in this plugin. As a workaround to disable background images with blurry edges on images containing transparent pixels, enable this setting.`
      ),
    disableBgImage: Joi.boolean()
      .default(false)
      .description(
        `Remove background image and its’ inline style. Useful to prevent Stylesheet too long error on AMP.`
      ),
    srcSetBreakpoints: Joi.array()
      .items(Joi.number())
      .description(
        `By default gatsby generates 0.25x, 0.5x, 1x, 1.5x, 2x, and 3x sizes of thumbnails. If you want more control over which sizes are output you can use the srcSetBreakpoints parameter. For example, if you want images that are 200, 340, 520, and 890 wide you can add srcSetBreakpoints: [ 200, 340, 520, 890 ] as a parameter. You will also get maxWidth as a breakpoint (which is 650 by default), so you will actually get [ 200, 340, 520, 650, 890 ] as breakpoints.`
      ),
  })
}
