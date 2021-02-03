import React, { FunctionComponent } from "react"
import { Box, Text } from "ink"

export interface IDeprecationProps {
  details: {
    level: string
    text?: string
    pluginName?: string
  }
}

export const Deprecation: FunctionComponent<IDeprecationProps> = React.memo(
  ({ details }) => {
    let pluginNameMessage: string | null = null
    if (details.pluginName) {
      pluginNameMessage = `Plugin: ${details.pluginName} - upgrade to the latest version or contact the plugin author.`
    }

    return (
      <Box marginY={1} flexDirection="column">
        <Box flexDirection="column">
          <Box flexDirection="column">
            <Box>
              <Box marginRight={1}>
                <Text color="black" backgroundColor="yellow">
                  {` ${details.level} `}
                </Text>
              </Box>
            </Box>
            <Box marginTop={1}>
              <Text>{details.text}</Text>
            </Box>
          </Box>
          {pluginNameMessage && (
            <Box marginTop={1} flexDirection="column">
              <Text color="gray">{`─`.repeat(pluginNameMessage.length)}</Text>
              <Text color="gray" dimColor>
                {pluginNameMessage}
              </Text>
              <Text color="gray">{`─`.repeat(pluginNameMessage.length)}</Text>
            </Box>
          )}
        </Box>
      </Box>
    )
  }
)
