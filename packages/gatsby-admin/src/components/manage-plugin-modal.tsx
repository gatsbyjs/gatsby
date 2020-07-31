/* @jsx jsx */
import { jsx } from "strict-ui"
import { useMutation } from "urql"
import { useState } from "react"
import {
  StyledModalHeader,
  StyledModalBody,
  StyledModalActions,
  Button,
  ModalCard,
  Modal,
  TextAreaField,
  TextAreaFieldLabel,
  TextAreaFieldControl,
} from "gatsby-interface"

interface IProps {
  plugin: {
    name: string
    description?: string
    options?: Record<string, any>
  }
  isOpen: boolean
  onDismiss: () => void
}

export default function ManagePluginModal({
  plugin,
  onDismiss,
  isOpen,
}: IProps): JSX.Element {
  const [{ fetching: updatingGatsbyPlugin }, updateGatsbyPlugin] = useMutation(`
    mutation updateGatsbyPlugin(
      $name: String!
      $options: JSONObject) {
      updateGatsbyPlugin(gatsbyPlugin: {
        name: $name,
        id: $name,
        options: $options
      }) {
        id
        name
        options
      }
    }
  `)
  const [{ fetching: deletingGatsbyPlugin }, deleteGatsbyPlugin] = useMutation(`
    mutation destroyGatsbyPlugin($name: String!) {
      destroyNpmPackage(npmPackage: {
        name: $name,
        id: $name,
        dependencyType: "production"
      }) {
        id
        name
      }
      destroyGatsbyPlugin(gatsbyPlugin: {
        name: $name,
        id: $name
      }) {
        id
        name
      }
    }
  `)

  const [options, setOptions] = useState(() =>
    JSON.stringify(plugin.options || {}, null, 2)
  )

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss}>
      <ModalCard aria-label={`Manage ${plugin.name}`}>
        <StyledModalHeader onCloseButtonClick={onDismiss}>
          Manage {plugin.name}
        </StyledModalHeader>
        <form
          onSubmit={(evt: React.FormEvent): void => {
            evt.preventDefault()
            let json
            try {
              // NOTE(@mxstbr): I use eval() to support JS object notation (`{ bla: true }`) and
              // not just strict JSON (`{ "bla": true }`)
              const js = eval(`(${options})`)
              // Validate that options isn't any JavaScript but an object
              json = JSON.parse(JSON.stringify(js))
            } catch (err) {
              return
            }
            updateGatsbyPlugin({
              name: plugin.name,
              options: json,
            })
          }}
        >
          <StyledModalBody>
            <div>
              <TextAreaField id="plugin-options">
                <TextAreaFieldLabel>Options:</TextAreaFieldLabel>
                <TextAreaFieldControl
                  sx={{ fontFamily: `monospace` }}
                  value={options}
                  onChange={(evt): void => setOptions(evt.target.value)}
                />
              </TextAreaField>
            </div>
            <StyledModalActions>
              <Button
                variant="GHOST"
                tone="DANGER"
                loading={deletingGatsbyPlugin}
                onClick={(evt): void => {
                  evt.preventDefault()
                  if (
                    window.confirm(
                      `Are you sure you want to uninstall ${plugin.name}?`
                    )
                  ) {
                    deleteGatsbyPlugin({ name: plugin.name }).then(() =>
                      onDismiss()
                    )
                  }
                }}
              >
                Uninstall
              </Button>
              <Button
                variant="PRIMARY"
                tone="BRAND"
                type="submit"
                loading={updatingGatsbyPlugin}
              >
                Save options
              </Button>
            </StyledModalActions>
          </StyledModalBody>
        </form>
      </ModalCard>
    </Modal>
  )
}
