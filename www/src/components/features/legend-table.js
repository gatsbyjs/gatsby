/** @jsx jsx */
import { jsx } from "theme-ui"

import EvaluationCell from "./evaluation-cell"
import { h4, h3 } from "../../utils/styles/global"

const legendTableCaptionStyle = {
  fontWeight: `body`,
  letterSpacing: `tracked`,
  textTransform: `uppercase`,
  textAlign: `left`,
  marginBottom: `1.5rem`,
  lineHeight: `1.5rem`,
}

const legendBallStyle = {
  float: `none`,
  display: `inline-block`,
  mx: 0,
}

const baseCellStyle = {
  verticalAlign: `baseline`,
  textAlign: `left`,
  p: 3,
}

const legendTableContainerStyle = {
  border: 1,
  borderLeft: 0,
  borderColor: `ui.border`,
  fontFamily: `heading`,
}

const legendBallCellStyle = {
  ...baseCellStyle,
  borderLeft: 1,
  borderBottom: 1,
  borderColor: `ui.border`,
}

const legendExplanationCellStyle = {
  ...baseCellStyle,
  borderLeft: 1,
  borderBottom: [1, null, 0],
  borderColor: `ui.border`,
}

const legendHeaderStyle = {
  ...baseCellStyle,
  borderLeft: 1,
  borderColor: `ui.border`,
  ...h4,
  m: 0,
}

const balls = [
  <td sx={legendBallCellStyle} key={`${legendBallCellStyle}-2`}>
    <EvaluationCell num="3" style={legendBallStyle} />
  </td>,
  <td sx={legendBallCellStyle} key={`${legendBallCellStyle}-3`}>
    <EvaluationCell num="2" style={legendBallStyle} />
  </td>,
  <td sx={legendBallCellStyle} key={`${legendBallCellStyle}-4`}>
    <EvaluationCell num="1" style={legendBallStyle} />
  </td>,
  <td sx={legendBallCellStyle} key={`${legendBallCellStyle}-5`}>
    <EvaluationCell num="0" style={legendBallStyle} />
  </td>,
]

const legendText = [
  <td sx={legendExplanationCellStyle} key={`legendExplanationCell-2`}>
    Excellent (fully available)
  </td>,
  <td
    sx={legendExplanationCellStyle}
    key={`legendExplanalegendBallCellStyletionCell-3`}
  >
    Good (partially available, e.g. plugins)
  </td>,
  <td sx={legendExplanationCellStyle} key={`legendExplanationCell-4`}>
    Fair (needs customization or limited)
  </td>,
  <td sx={legendExplanationCellStyle} key={`legendExplanationCell-5`}>
    Poor (not possible)
  </td>,
]

export default function LegendTable() {
  return (
    <table sx={{ ...legendTableContainerStyle, width: `100%` }} id="legend">
      <caption sx={{ ...legendTableCaptionStyle }}>Legend</caption>
      <tbody
        sx={{
          display: [`none`, null, `table`],
        }}
      >
        <tr>
          <th
            sx={{ ...legendBallCellStyle, ...legendHeaderStyle }}
            key={`${legendBallCellStyle}-1`}
            scope="row"
          >
            Icon
          </th>
          {balls}
        </tr>
        <tr>
          <th
            sx={{ ...legendExplanationCellStyle, ...legendHeaderStyle }}
            key={`legendExplanationCell-1`}
            scope="row"
          >
            Feature Availability
          </th>
          {legendText}
        </tr>
      </tbody>
      <tbody
        sx={{
          display: [`table`, null, `none`],
          ...legendTableContainerStyle,
        }}
      >
        <tr>
          <th
            sx={{ ...legendBallCellStyle, ...legendHeaderStyle }}
            key={`${legendBallCellStyle}-1`}
            scope="col"
          >
            <h4 sx={{ m: 0 }}>Icon</h4>
          </th>
          <th
            sx={{ ...legendExplanationCellStyle, ...legendHeaderStyle }}
            key={`legendExplanationCell-1`}
            scope="col"
          >
            <h4 sx={{ m: 0 }}>Feature Availability</h4>
          </th>
        </tr>
        {[0, 1, 2, 3, 4].map(i => (
          <tr key={i}>
            {balls[i]}
            {legendText[i]}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
