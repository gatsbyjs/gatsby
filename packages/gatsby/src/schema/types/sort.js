// @flow

const {
  getNamedType,
  getNullableType,
  GraphQLInputObjectType,
  GraphQLList,
} = require(`graphql`)
const { addDerivedType } = require(`./derived-types`)

const SORTABLE_ENUM = {
  SORTABLE: `SORTABLE`,
  NOT_SORTABLE: `NON_SORTABLE`,
  DEPRECATED_SORTABLE: `DERPECATED_SORTABLE`,
}

const getSortOrderEnum = ({ schemaComposer }) =>
  schemaComposer.getOrCreateETC(`SortOrderEnum`, etc => {
    etc.setFields({
      ASC: { value: `ASC` },
      DESC: { value: `DESC` },
    })
  })

const getFieldsEnum = ({ schemaComposer, typeComposer, inputTypeComposer }) => {
  const typeName = typeComposer.getTypeName()
  const fieldsEnumTypeName = `${typeName}FieldsEnum`
  const fieldsEnumTypeComposer = schemaComposer.getOrCreateETC(
    fieldsEnumTypeName
  )
  addDerivedType({ typeComposer, derivedTypeName: fieldsEnumTypeName })

  const fields = convert(
    schemaComposer,
    typeComposer,
    inputTypeComposer.getFields()
  )
  fieldsEnumTypeComposer.setFields(fields)
  return fieldsEnumTypeComposer
}

const getSortInput = ({ schemaComposer, typeComposer }) => {
  const inputTypeComposer = typeComposer.getInputTypeComposer()
  const sortOrderEnumTC = getSortOrderEnum({ schemaComposer })
  const fieldsEnumTC = getFieldsEnum({
    schemaComposer,
    typeComposer,
    inputTypeComposer,
  })
  const typeName = typeComposer.getTypeName()
  // console.log(fieldsEnumTC.getType().getValues())

  const sortInputTypeName = `${typeName}SortInput`
  addDerivedType({ typeComposer, derivedTypeName: sortInputTypeName })

  return schemaComposer.getOrCreateITC(sortInputTypeName, itc => {
    itc.addFields({
      fields: [fieldsEnumTC],
      order: { type: [sortOrderEnumTC], defaultValue: [`ASC`] },
    })
  })
}

module.exports = {
  getSortInput,
  getFieldsEnum,
  getSortOrderEnum,
  SORTABLE_ENUM,
}

const MAX_SORT_DEPTH = 3
const SORT_FIELD_DELIMITER = `___`

const convert = (
  schemaComposer,
  typeComposer,
  fields,
  prefix = null,
  depth = 0,
  deprecationReason
) => {
  const sortFields = {}

  Object.keys(fields).forEach(fieldName => {
    const fieldConfig = fields[fieldName]
    const sortable = typeComposer.getFieldExtension(fieldName, `sortable`)
    if (sortable === SORTABLE_ENUM.NOT_SORTABLE) {
      return
    } else if (sortable === SORTABLE_ENUM.DEPRECATED_SORTABLE) {
      deprecationReason = `Sorting on fields that need arguments to resolve is deprecated.`
    }
    const sortKey = prefix ? `${prefix}.${fieldName}` : fieldName
    const sortKeyFieldName = sortKey.split(`.`).join(SORT_FIELD_DELIMITER)

    // XXX(freiksenet): this is to preserve legacy behaviour, this probably doesn't actually sort
    if (getNullableType(fieldConfig.type) instanceof GraphQLList) {
      sortFields[sortKeyFieldName] = {
        value: sortKey,
        deprecationReason,
      }
    }

    const type = getNamedType(fieldConfig.type)
    if (type instanceof GraphQLInputObjectType) {
      if (depth < MAX_SORT_DEPTH) {
        const typeComposer = schemaComposer.getAnyTC(
          type.name.replace(/Input$/, ``)
        )
        Object.assign(
          sortFields,
          convert(
            schemaComposer,
            typeComposer,
            type.getFields(),
            sortKey,
            depth + 1,
            deprecationReason
          )
        )
      }
    } else {
      // GraphQLScalarType || GraphQLEnumType
      sortFields[sortKeyFieldName] = {
        value: sortKey,
        deprecationReason,
      }
    }
  })
  return sortFields
}
