import Joi from "joi"
import chalk from "chalk"
const { bindActionCreators } = require("redux")

const { store } = require("./index")
import { pageSchema } from "../joi-schemas/joi"
import { layoutComponentChunkName } from "../utils/js-chunk-names"

const actions = {}
actions.upsertPage = page => {
  page.componentChunkName = layoutComponentChunkName(page.component)
  const result = Joi.validate(page, pageSchema)
  if (result.error) {
    console.log(
      chalk.blue.bgYellow(`The upserted page didn't pass validation`)
    )
    console.log(chalk.bold.red(result.error))
    console.log(action.payload)
    return
  }

  return {
    type: "UPSERT_PAGE",
    payload: page,
  }
}

exports.actions = actions
exports.boundActionCreators = bindActionCreators(actions, store.dispatch)
