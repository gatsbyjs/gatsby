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
  ({ details }) => (
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
        {details.pluginName && (
          <Box marginTop={1} flexDirection="column">
            <Text color="gray">
              {`─`.repeat(`Plugin: ${details.pluginName}`.length)}
            </Text>
            <Text color="gray" dimColor>
              Plugin: {details.pluginName}
            </Text>
            <Text color="gray">
              {`─`.repeat(`Plugin: ${details.pluginName}`.length)}
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  )
)
