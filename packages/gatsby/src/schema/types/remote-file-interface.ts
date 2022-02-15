import {
  SchemaComposer,
  ObjectTypeComposer,
  InterfaceTypeComposer,
} from "graphql-compose"
import { store } from "../../redux/index"
import {
  getRemoteFileEnums,
  getRemoteFileFields,
} from "gatsby-plugin-utils/polyfill-remote-file"

export const DEFAULT_PIXEL_DENSITIES = [0.25, 0.5, 1, 2]
export const DEFAULT_BREAKPOINTS = [750, 1080, 1366, 1920]

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
    tc.addInterface(`Node`)
    tc.setDescription(`Remote Interface`)

    // @ts-ignore - types are messed up by schema composer maybe new version helps here
    tc.addFields(getRemoteFileFields(enums, store))
  })
}
