import {
  SchemaComposer,
  ObjectTypeComposer,
  InterfaceTypeComposer,
} from "graphql-compose"
import { bindActionCreators } from "redux"
import { store } from "../../redux/index"
import { actions } from "../../redux/actions/index"
import {
  getRemoteFileEnums,
  getRemoteFileFields,
} from "gatsby-plugin-utils/polyfill-remote-file"

export function addRemoteFileInterfaceFields<TContext = unknown>(
  schemaComposer: SchemaComposer<unknown>,
  typeComposer: ObjectTypeComposer<unknown, TContext>
): void {
  const remoteFileInterfaceType = getOrCreateRemoteFileInterface(schemaComposer)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  typeComposer.addFields(remoteFileInterfaceType.getFields() as any)
}

export function getOrCreateRemoteFileInterface(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schemaComposer: SchemaComposer<any>
): InterfaceTypeComposer {
  const enums = getRemoteFileEnums(
    schemaComposer.createEnumTC.bind(schemaComposer)
  )

  schemaComposer.getOrCreateOTC(`RemoteFileResize`, tc => {
    tc.addFields({
      width: `Int`,
      height: `Int`,
      src: `String`,
    })
  })

  return schemaComposer.getOrCreateIFTC(`RemoteFile`, tc => {
    tc.setDescription(`Remote Interface`)

    const boundActions = bindActionCreators(actions, store.dispatch)

    // @ts-ignore - types are messed up by schema composer maybe new version helps here
    tc.addFields(getRemoteFileFields(enums, boundActions, store))
  })
}
