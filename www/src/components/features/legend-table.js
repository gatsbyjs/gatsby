/** @jsx jsx */
import { jsx } from "theme-ui"

import EvaluationCell from "./evaluation-cell"

const legendBallStyle = {
  float: `none`,
  display: `inline-block`,
  mx: 0,
}

const baseCellStyle = {
  display: `table-cell`,
  verticalAlign: `middle`,
  textAlign: `center`,
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

const balls = [
  <div sx={legendBallCellStyle} key={`${legendBallCellStyle}-1`}>
    <h4 sx={{ m: 0 }}>Icon</h4>
  </div>,
  <div sx={legendBallCellStyle} key={`${legendBallCellStyle}-2`}>
    <EvaluationCell num="3" style={legendBallStyle} />
  </div>,
  <div sx={legendBallCellStyle} key={`${legendBallCellStyle}-3`}>
    <EvaluationCell num="2" style={legendBallStyle} />
  </div>,
  <div sx={legendBallCellStyle} key={`${legendBallCellStyle}-4`}>
    <EvaluationCell num="1" style={legendBallStyle} />
  </div>,
  <div sx={legendBallCellStyle} key={`${legendBallCellStyle}-5`}>
    <EvaluationCell num="0" style={legendBallStyle} />
  </div>,
]

const legendText = [
  <div sx={legendExplanationCellStyle} key={`legendExplanationCell-1`}>
    <h5 sx={{ m: 0 }}>Feature Availability</h5>
  </div>,
  <div sx={legendExplanationCellStyle} key={`legendExplanationCell-2`}>
    Excellent (fully available)
  </div>,
  <div sx={legendExplanationCellStyle} key={`legendExplanationCell-3`}>
    Good (partially available, e.g. plugins)
  </div>,
  <div sx={legendExplanationCellStyle} key={`legendExplanationCell-4`}>
    Fair (needs customization or limited)
  </div>,
  <div sx={legendExplanationCellStyle} key={`legendExplanationCell-5`}>
    Poor (not possible)
  </div>,
]

export default function LegendTable() {
  return (
    <div>
      <div
        sx={{
          display: [`none`, null, `table`],
          ...legendTableContainerStyle,
          width: `100%`,
        }}
      >
        <div sx={{ display: `table-row` }}>{balls}</div>
        <div sx={{ display: `table-row` }}>{legendText}</div>
      </div>
      <div
        sx={{
          display: [`table`, null, `none`],
          ...legendTableContainerStyle,
        }}
      >
        {[0, 1, 2, 3, 4].map(i => (
          <div sx={{ display: `table-row` }} key={i}>
            {balls[i]}
            {legendText[i]}
          </div>
        ))}
      </div>
    </div>
  )
}
