import {
  getNullableType,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLInputFieldConfigMap,
} from "graphql"
import { addDerivedType } from "./derived-types"
import {
  InputTypeComposer,
  SchemaComposer,
  EnumTypeComposer,
  InterfaceTypeComposer,
  ObjMap,
} from "graphql-compose"

export const SORTABLE_ENUM = {
  SORTABLE: `SORTABLE`,
  NOT_SORTABLE: `NON_SORTABLE`,
  DEPRECATED_SORTABLE: `DERPECATED_SORTABLE`,
} as const

const MAX_SORT_DEPTH = 3
const SORT_FIELD_DELIMITER = `___`

const convert = (
  schemaComposer: SchemaComposer<any>,
  typeComposer: InterfaceTypeComposer<any>,
  fields: GraphQLInputFieldConfigMap,
  prefix?: string,
  depth = 0,
  deprecationReason?: string
): ObjMap<EnumTypeComposer.ComposeEnumValueConfig> => {
  const sortFields = {}

  Object.keys(fields).forEach(fieldName => {
    const fieldConfig = fields[fieldName]
    const sortable = typeComposer.getFieldExtension(fieldName, `sortable`)
    if (sortable === SORTABLE_ENUM.NOT_SORTABLE) {
      return
    } else if (sortable === SORTABLE_ENUM.DEPRECATED_SORTABLE) {
      deprecationReason = `Sorting on fields that need arguments to resolve is deprecated.`
    }
    const sortKey = prefix !== undefined ? `${prefix}.${fieldName}` : fieldName
    const sortKeyFieldName = sortKey.split(`.`).join(SORT_FIELD_DELIMITER)

    // XXX(freiksenet): this is to preserve legacy behaviour, this probably doesn't actually sort
    if (getNullableType(fieldConfig.type) instanceof GraphQLList) {
      sortFields[sortKeyFieldName] = {
        value: sortKey,
        deprecationReason,
      }
    }

    const type = fieldConfig.type
    if (type instanceof GraphQLInputObjectType) {
      if (depth < MAX_SORT_DEPTH) {
        const typeComposer = schemaComposer.getIFTC(
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

export const getSortOrderEnum = ({
  schemaComposer,
}: {
  schemaComposer: SchemaComposer<any>
}): EnumTypeComposer =>
  schemaComposer.getOrCreateETC(`SortOrderEnum`, (etc: EnumTypeComposer) => {
    etc.setFields({
      ASC: { value: `ASC` },
      DESC: { value: `DESC` },
    })
  })

export const getFieldsEnum = ({
  schemaComposer,
  typeComposer,
  inputTypeComposer,
}: {
  schemaComposer: SchemaComposer<any>
  typeComposer: InterfaceTypeComposer<any>
  inputTypeComposer: InputTypeComposer
}): EnumTypeComposer => {
  const typeName = typeComposer.getTypeName()
  const fieldsEnumTypeName = `${typeName}FieldsEnum`
  const fieldsEnumTypeComposer = schemaComposer.getOrCreateETC(
    fieldsEnumTypeName
  )
  addDerivedType({ typeComposer, derivedTypeName: fieldsEnumTypeName })
  let fieldConfigs = {}

  Object.keys(inputTypeComposer.getFields()).forEach(fieldName => {
    fieldConfigs = {
      ...fieldConfigs,
      [fieldName]: inputTypeComposer.getFieldConfig(fieldName),
    }
  })

  const fields = convert(schemaComposer, typeComposer, fieldConfigs)
  fieldsEnumTypeComposer.setFields(fields)
  return fieldsEnumTypeComposer
}

export const getSortInput = ({
  schemaComposer,
  typeComposer,
}: {
  schemaComposer: SchemaComposer<any>
  typeComposer: InterfaceTypeComposer<any>
}): InputTypeComposer => {
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

  return schemaComposer.getOrCreateITC(
    sortInputTypeName,
    (itc: InputTypeComposer) => {
      itc.addFields({
        fields: [fieldsEnumTC],
        order: { type: [sortOrderEnumTC], defaultValue: [`ASC`] },
      })
    }
  )
}
