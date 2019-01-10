const {
  findById,
  findByIds,
  findByIdsAndType,
  findMany,
  findOne,
  paginate,
} = require(`./resolvers`)
const link = require(`./link`)

module.exports = {
  findById: findById(),
  findByIds: findByIds(),
  findByIdsAndType,
  findMany,
  findOne,
  link,
  paginate,
}
