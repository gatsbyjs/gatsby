import { danger, warn } from "danger"
import { load as yamlLoad } from "js-yaml"
import * as Joi from "joi"
import * as path from "path"

const supportedImageExts = [".jpg", ".jpeg", ".gif", ".png"]
const uriOptions = { scheme: [`https`, `http`] }
const githubRepoRegex: RegExp = new RegExp(
  `^https?:\/\/github.com\/[^/]+/[^/]+$`
)

const getExistingFiles = async (path: string, base: string) => {
  const [owner, repo] = danger.github.pr.head.repo.full_name.split("/")
  const imagesDirReponse: {
    data: { name: string }[]
  } = await danger.github.api.repos.getContent({
    repo,
    owner,
    path,
    ref: danger.github.pr.head.ref,
  })
  const files = imagesDirReponse.data.map(({ name }) => `${base}/${name}`)
  return files
}

const customJoi = Joi.extend((joi: any) => ({
  base: joi.string(),
  name: "string",
  language: {
    supportedExtension: "need to use supported extension {{q}}",
    fileExists: "need to point to existing file",
  },
  rules: [
    {
      name: "supportedExtension",
      params: {
        q: joi.array().items(joi.string()),
      },
      validate(
        this: Joi.ExtensionBoundSchema,
        params: { q: string[] },
        value: string,
        state: any,
        options: any
      ): any {
        if (!params.q.includes(path.extname(value))) {
          return this.createError(
            "string.supportedExtension",
            { v: value, q: params.q },
            state,
            options
          )
        }

        return value
      },
    },
    {
      name: "fileExists",
      params: {
        q: joi.array().items(joi.string()),
      },
      validate(
        this: Joi.ExtensionBoundSchema,
        params: { q: string[] },
        value: string,
        state: any,
        options: any
      ): any {
        if (!params.q.includes(value)) {
          return this.createError(
            "string.fileExists",
            { v: value, q: params.q },
            state,
            options
          )
        }

        return value
      },
    },
  ],
}))

const VALID_SHOWCASE_CATEGORIES = [
  //  3D Printing
  //  AI
  //  Advertising
  //  Animation
  //  Art
  //  Artist
  //  Asset Sharing
  //  Athlete
  //  Auction
  // B2B Services
  // Banking
  //  Beauty
  //  Beverage
  // Blockchain
  //  Bot
  //  Brewery
  //  CMS
  //  Challenge
  //  Chaos Engineering
  //  Charity
  //  Cinema
  //  Club
  // Coffee
  // Construction
  //  Contentful
  //  Credit Card
  //  Crowdfunding
  // Drones
  //  Electronics
  //  Events
  //  Fashion
  //  Femtech
  //  Fundraising
  //  Game Development
  //  GraphQL
  //  HR
  // Hackathon
  //  Health & Wellness
  //  History
  //  Hosting
  //  IOT
  //  Instagram
  //  Insurance
  //  Job Board
  //  Joke
  // Landing
  //  Legal
  // Loans
  // Manufacturing
  // Media
  // Mobile Commerce
  // Models
  // Motion graphics
  // Multilingual
  // Netlify
  // News
  // Newspaper
  // Node.js
  // One Page
  // Performance
  // Personal Development
  // Personal Training
  //  Project Management
  //  Publishing
  //  React
  //  React Native
  //  Research
  //  Resource
  //  Responsive Design
  //  Restaurant
  //  SDK
  //  Software Engineering
  // Space
  //  Spanish
  //  Streaming
  //  Student
  //  Styles
  //  Testing
  //  Themes
  //  Tips
  // Tourism
  // Tutorial
  // Tutorials
  // Type Scale
  // VSCode
  // Video Games
  // Virtual Reality
  // Visualization

  `API`,
  `Accessibility`,
  `Agency`,
  `App`,
  `Blog`,
  `Business`,
  `Community`,
  `Conference`,
  `Consulting`,
  `Data`,
  `Design`,
  `Design System`,
  `Directory`,
  `Documentation`,
  `Education`,
  `Entertainment`,
  `Entrepreneurship`,
  `Event`,
  `Featured`,
  `Finance`,
  `Food`,
  `Freelance`,
  `Gallery`,
  `Government`,
  `Healthcare`,
  `JavaScript`,
  `Landing Page`,
  `Learning`,
  `Library`,
  `Marketing`,
  `Mobile Development`,
  `Music`,
  `Nonprofit`,
  `Open Source`,
  `Photography`,
  `Podcast`,
  `Portfolio`,
  `Productivity`,
  `Programming`,
  `Real Estate`,
  `SEO`,
  `Science`,
  `Security`,
  `Sports`,
  `Technology`,
  `Travel`,
  `User Experience`,
  `Video`,
  `Web Development`,
  `WordPress`,
  `eCommerce`,
]

const getSitesSchema = () => {
  return Joi.array()
    .items(
      Joi.object().keys({
        title: Joi.string().required(),
        url: Joi.string()
          .uri(uriOptions)
          .required(),
        main_url: Joi.string()
          .uri(uriOptions)
          .required(),
        source_url: Joi.string().uri(uriOptions),
        description: Joi.string(),
        categories: Joi.array()
          .items(Joi.string().valid(VALID_SHOWCASE_CATEGORIES))
          .required(),
        built_by: Joi.string(),
        built_by_url: Joi.string().uri(uriOptions),
        featured: Joi.boolean(),
      })
    )
    .unique("title")
    .unique("url")
    .unique("main_url")
}

const getCreatorsSchema = async () => {
  return Joi.array()
    .items(
      Joi.object().keys({
        name: Joi.string().required(),
        type: Joi.string()
          .valid(["individual", "agency", "company"])
          .required(),
        description: Joi.string(),
        location: Joi.string(),
        // need to explicitely allow `null` to not fail on github: null fields
        github: Joi.string()
          .uri(uriOptions)
          .allow(null),
        website: Joi.string().uri(uriOptions),
        for_hire: Joi.boolean(),
        portfolio: Joi.boolean(),
        hiring: Joi.boolean(),
        image: customJoi
          .string()
          .supportedExtension(supportedImageExts)
          .fileExists(await getExistingFiles("docs/community/images", "images"))
          .required(),
      })
    )
    .unique("name")
}

const getAuthorsSchema = async () => {
  return Joi.array()
    .items(
      Joi.object().keys({
        id: Joi.string().required(),
        bio: Joi.string().required(),
        avatar: customJoi
          .string()
          .supportedExtension(supportedImageExts)
          .fileExists(await getExistingFiles("docs/blog/avatars", "avatars"))
          .required(),
        twitter: Joi.string().regex(/^@/),
      })
    )
    .unique("id")
}

const VALID_STARTER_CATEGORIES = [
  `AMP`,
  `Authentication`,
  `AWS`,
  `Blog`,
  `Client-side App`,
  "CMS:Headless",
  "CMS:Contentful",
  "CMS:Drupal",
  "CMS:Prismic",
  "CMS:Netlify",
  "CMS:Wordpress",
  "CMS:Other",
  `Disqus`,
  `Documentation`,
  `eCommerce`,
  `Firebase`,
  `Google Sheets`,
  `HTML5UP`,
  `i18n`,
  `Landing Page`,
  `Language:Other`,
  `Language:TypeScript`,
  `Linting`,
  `Markdown`,
  `MDX`,
  `Netlify`,
  `Official`,
  `Onepage`,
  `Pagination`,
  `Portfolio`,
  `Presentation`,
  `PWA`,
  `Redux`,
  `RSS`,
  `Search`,
  `SEO`,
  `Shopify`,
  `Storybook`,
  `Stripe`,
  `Styling:Ant Design`,
  `Styling:Bootstrap`,
  `Styling:Bulma`,
  `Styling:CSS-in-JS`,
  `Styling:Grommet`,
  `Styling:Material`,
  `Styling:PostCSS`,
  `Styling:SCSS`,
  `Styling:Tailwind`,
  `Styling:Other`,
  `Testing`,
  `Transitions`,

  // Headless CMS => CMS:Headless
  //  Contentful => CMS:Contentful
  //  Prismic => CMS:Prismic
  //  API
  //  Accessibility
  //  App
  //  Blockstack
  //  Boilerplate
  //  Business Website
  //  ButterCMS => CMS:Headless
  //  BuckleScript
  //  CSV
  //  Charts
  //  ContentStack => CMS:Headless
  //  Craft CMS => CMS:Headless
  //  DatoCMS => CMS:Headless
  //  Dev.to
  //  Docker
  //  Docz
  //  Elm  =>   Language:Other
  //  Ghost => CMS:Other, CMS:Headless
  //  Google Cloud
  //  GraphCMS => CMS:Other, CMS:Headless
  //  Grouping
  //  Infinite Scroll
  //  Kentico Cloud => CMS:Other, CMS:Headless
  //  Livingdocs
  //  Lunr.js
  //  Material UI
  //  MobX
  //  Modern Design
  //  Moltin
  //  Netlify CMS => Netlify, CMS:Netlify,CMS:Headless
  //  Netlify Form => Netlify
  //  Netlify Functions => Netlify
  //  Netlify Identity => Netlify
  //  Orga
  //  Plone => CMS:Other
  //  Quiz
  //  ReasonML => Language:Other
  //  Serverless
  //  Sitemap
  //  Styling:Less => Styling:Other
  //  Styling:Material Design
  //  Styling:None => Styling:Other
  //  Styling:Primer => Styling:Other
  //  Styling:Rebass => Styling:Other
  //  Styling:Semantic => Styling:Other
  //  Styling:Tachyons => Styling:Other
  //  Tensorflow
  //  Under Construction
  //  Wordpress => CMS:Wordpress
]

const getStartersSchema = () => {
  return Joi.array()
    .items(
      Joi.object().keys({
        url: Joi.string()
          .uri(uriOptions)
          .required(),
        repo: Joi.string()
          .uri(uriOptions)
          .regex(githubRepoRegex)
          .required(),
        description: Joi.string().required(),
        tags: Joi.array()
          .items(Joi.string().valid(VALID_STARTER_CATEGORIES))
          .required(),
        features: Joi.array()
          .items(Joi.string())
          .required(),
      })
    )
    .unique("url")
    .unique("repo")
}

const fileSchemas = {
  "docs/sites.yml": getSitesSchema,
  "docs/community/creators.yml": getCreatorsSchema,
  "docs/blog/author.yaml": getAuthorsSchema,
  "docs/starters.yml": getStartersSchema,
}

export const utils = {
  addErrorMsg: (
    index: string,
    message: string,
    customErrors: { [id: string]: string[] }
  ) => {
    if (!customErrors[index]) {
      customErrors[index] = []
    }
    customErrors[index].push(message)
  },
}

export const validateYaml = async () => {
  return Promise.all(
    Object.entries(fileSchemas).map(async ([filePath, schemaFn]) => {
      if (!danger.git.modified_files.includes(filePath)) {
        return
      }
      const textContent = await danger.github.utils.fileContents(filePath)
      let content: any
      try {
        content = yamlLoad(textContent)
      } catch (e) {
        warn(
          `## ${filePath} is not valid YAML file:\n\n\`\`\`${e.message}\n\`\`\``
        )
        return
      }

      const result = Joi.validate(content, await schemaFn(), {
        abortEarly: false,
      })
      if (result.error) {
        const customErrors: { [id: string]: string[] } = {}
        result.error.details.forEach(detail => {
          if (detail.path.length > 0) {
            const index = detail.path[0]

            let message = detail.message
            if (detail.type === "array.unique" && detail.context) {
              // by default it doesn't say what field is not unique
              message = `"${detail.context.path}" is not unique`
            }
            utils.addErrorMsg(index, message, customErrors)
          } else {
            utils.addErrorMsg("root", detail.message, customErrors)
          }
        })

        const errors = Object.entries(customErrors).map(
          ([index, errors]: [string, string[]]) => {
            if (index === "root") {
              return errors.map(msg => ` - ${msg}`).join("\n")
            } else {
              const errorsString = errors.map(msg => `  - ${msg}`).join("\n")
              return `- \`\`\`json\n${JSON.stringify(content[index], null, 2)
                .split("\n")
                .map(line => `  ${line}`)
                .join("\n")}\n  \`\`\`\n  **Errors**:\n${errorsString}`
            }
          }
        )

        warn(
          `## ${filePath} didn't pass validation:\n\n${errors.join("\n---\n")}`
        )
      }
    })
  )
}

export default async () => {
  return await validateYaml()
}
