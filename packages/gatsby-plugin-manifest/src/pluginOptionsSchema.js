export default function pluginOptionSchema({ Joi }) {
  /* Descriptions copied from or based on documentation at https://developer.mozilla.org/en-US/docs/Web/Manifest
   *
   * Currently based on https://www.w3.org/TR/2020/WD-appmanifest-20201019/
   * and the August 4th 2020 version of https://w3c.github.io/manifest-app-info/
   */

  const platform = Joi.string()
    .optional()
    .empty(``)
    .valid(
      `narrow`,
      `wide`,
      `chromeos`,
      `ios`,
      `kaios`,
      `macos`,
      `windows`,
      `windows10x`,
      `xbox`,
      `chrome_web_store`,
      `play`,
      `itunes`,
      `microsoft`,
      `webapp`
    ) // https://w3c.github.io/manifest-app-info/#platform-member
    .description(`The platform on which the application can be found.`)

  const FingerPrint = Joi.object().keys({
    type: Joi.string()
      .required()
      .description(`syntax and semantics are platform-defined`),
    value: Joi.string()
      .required()
      .description(`syntax and semantics are platform-defined`),
  })

  const ImageResource = Joi.object().keys({
    sizes: Joi.string()
      .optional()
      .description(`A string containing space-separated image dimensions`),
    src: Joi.string()
      .required()
      .description(
        `The path to the image file. If src is a relative URL, the base URL will be the URL of the manifest.`
      ),
    type: Joi.string()
      .optional()
      .description(
        `A hint as to the media type of the image. The purpose of this member is to allow a user agent to quickly ignore images with media types it does not support.`
      ),
  })

  const ManifestImageResource = ImageResource.keys({
    purpose: Joi.string()
      .optional()
      .description(
        `Defines the purpose of the image, for example if the image is intended to serve some special purpose in the context of the host OS.`
      ),
  })

  const ShortcutItem = Joi.object().keys({
    name: Joi.string()
      .required()
      .description(
        `The name member of a ShortcutItem is a string that represents the name of the shortcut as it is usually displayed to the user in a context menu. `
      ),
    short_name: Joi.string()
      .optional()
      .description(
        `The short_name member of a ShortcutItem is a string that represents a short version of the name of the shortcut. `
      ),
    description: Joi.string()
      .optional()
      .description(
        `The description member of a ShortcutItem is a string that allows the developer to describe the purpose of the shortcut. `
      ),
    url: Joi.string()
      .required()
      .description(
        `The url member of a ShortcutItem is a URL within scope of a processed manifest that opens when the associated shortcut is activated. `
      ),
    icons: Joi.array()
      .optional()
      .items(ManifestImageResource)
      .description(
        `The icons member of an ShortcutItem member serve as iconic representations of the shortcut in various contexts. `
      ),
  })

  const ExternalApplicationResource = Joi.object()
    .keys({
      platform: platform.required(),
      url: Joi.string()
        .uri()
        .description(`The URL at which the application can be found.`),
      id: Joi.string().description(
        `The ID used to represent the application on the specified platform.`
      ),
      min_version: Joi.string()
        .optional()
        .description(
          `The minimum version of the application that is considered related to this web app.`
        ),
      fingerprints: Joi.array()
        .optional()
        .items(FingerPrint)
        .description(
          `Each Fingerprints represents a set of cryptographic fingerprints used for verifying the application.`
        ),
    })
    .or(`url`, `id`)

  /**
   * This only includes items in the draft, but allows unknown keys in params
   * @see https://w3c.github.io/web-share-target/
   */
  const ShareTarget = Joi.object().keys({
    action: Joi.string()
      .uri({ allowRelative: true })
      .required()
      .description(`The URL for the web share target.`),
    method: Joi.string()
      .optional()
      .description(`The HTTP request method for the web share target`),
    enctype: Joi.string()
      .optional()
      .description(
        `Specifies how the share data is encoded in the body of a POST request. It is ignored when method is "GET"`
      ),
    params: Joi.object()
      .required()
      .keys({
        title: Joi.string()
          .optional()
          .description(
            `The name of the query parameter used for the title of the document being shared`
          ),
        text: Joi.string()
          .optional()
          .description(
            `The name of the query parameter used for the arbitrary text that forms the body of the message being shared`
          ),
        url: Joi.string()
          .optional()
          .description(
            `The name of the query parameter used for the URL string referring to a resource being shared`
          ),
      })
      // Allow unknown keys, because the spec is an unofficial draft and Google already seems to have added support for keys that are not in the spec
      .unknown(true),
  })

  const WebAppManifest = Joi.object().keys({
    background_color: Joi.string()
      .optional()
      .description(
        `The background_color member defines a placeholder background color for the application page to display before its stylesheet is loaded.`
      ),
    categories: Joi.array()
      .items(Joi.string().empty(``))
      .optional()
      .description(
        `The categories member is an array of strings defining the names of categories that the application supposedly belongs to.`
      ),
    description: Joi.string()
      .optional()
      .description(
        `The description member is a string in which developers can explain what the application does. `
      ),
    dir: Joi.string()
      .optional()
      .valid(`auto`, `ltr`, `rtl`)
      .description(
        `The base direction in which to display direction-capable members of the manifest.`
      ),
    display: Joi.string()
      .optional()
      .valid(`fullscreen`, `standalone`, `minimal-ui`, `browser`)
      .description(
        `The display member is a string that determines the developers’ preferred display mode for the website`
      ),
    iarc_rating_id: Joi.string()
      .guid()
      .optional()
      .description(
        `The iarc_rating_id member is a string that represents the International Age Rating Coalition (IARC) certification code of the web application.`
      ),
    icons: Joi.array()
      .optional()
      .items(ManifestImageResource)
      .description(
        `The icons member specifies an array of objects representing image files that can serve as application icons for different contexts.`
      ),
    lang: Joi.string()
      .optional()
      .description(
        `The lang member is a string containing a single language tag.`
      ),
    name: Joi.string()
      .optional()
      .description(
        `The name member is a string that represents the name of the web application as it is usually displayed to the user.`
      ),
    orientation: Joi.string()
      .optional()
      .valid(
        `any`,
        `natural`,
        `landscape`,
        `landscape-primary`,
        `landscape-secondary`,
        `portrait`,
        `portrait-primary`,
        `portrait-secondary`
      ) // From: https://www.w3.org/TR/screen-orientation/#screenorientation-interface
      .description(
        `The orientation member defines the default orientation for all the website's top-level browsing contexts`
      ),
    prefer_related_applications: Joi.boolean()
      .optional()
      .description(
        `The prefer_related_applications member is a boolean value that specifies that applications listed in related_applications should be preferred over the web application.`
      ),
    related_applications: Joi.array()
      .optional()
      .items(ExternalApplicationResource)
      .description(
        `The related_applications field is an array of objects specifying native applications that are installable by, or accessible to, the underlying platform.`
      ),
    share_target: ShareTarget.optional().description(
      `Allows websites to declare themselves as web share targets, which can receive shared content from either the Web Share API, or system events (e.g., shares from native apps).`
    ),
    scope: Joi.string()
      .optional()
      .description(
        `The scope member is a string that defines the navigation scope of this web application's application context.`
      ),
    screenshots: Joi.array()
      .optional()
      .items(
        ManifestImageResource.keys({
          label: Joi.string()
            .optional()
            .description(
              `The label member is a string that serves as the accessible name of that screenshots object.`
            ),
          platform: platform,
        })
      )
      .description(
        `The screenshots member defines an array of screenshots intended to showcase the application.`
      ),
    short_name: Joi.string()
      .optional()
      .description(
        `The short_name member is a string that represents the name of the web application displayed to the user if there is not enough space to display name.`
      ),
    shortcuts: Joi.array()
      .optional()
      .items(ShortcutItem)
      .description(
        `Each ShortcutItem represents a link to a key task or page within a web app. `
      ),
    start_url: Joi.string()
      .optional()
      .description(
        `The start_url member is a string that represents the start URL of the web application.`
      ),
    theme_color: Joi.string()
      .optional()
      .description(
        `The theme_color member is a string that defines the default theme color for the application.`
      ),
  })

  const GatsbyPluginOptions = Joi.object()
    .keys({
      icon: Joi.string(),
      legacy: Joi.boolean().default(true),
      theme_color_in_head: Joi.boolean().default(true),
      cache_busting_mode: Joi.string()
        .valid(`none`, `query`, `name`)
        .default(`query`),
      crossOrigin: Joi.string()
        .valid(`anonymous`, `use-credentials`)
        .default(`anonymous`),
      include_favicon: Joi.boolean().default(true),
      icon_options: ManifestImageResource.keys({
        src: Joi.string().forbidden(),
        sizes: Joi.string().forbidden(),
      }),

      localize: Joi.array()
        .items(
          WebAppManifest.keys({
            lang: Joi.required(),
            start_url: Joi.required(),
          })
        )
        .description(`Used for localizing your WebAppManifest`),
    })
    .or(`icon`, `icons`)
    .with(`localize`, `lang`)

  return WebAppManifest.concat(GatsbyPluginOptions)
}
