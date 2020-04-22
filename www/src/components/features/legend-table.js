/** @jsx jsx */
import { jsx } from "theme-ui"

import EvaluationCell from "./evaluation-cell"

const LegendTable = () => {
  const legendBallStyle = {
    float: `none`,
    marginLeft: 0,
    marginRight: 0,
    display: `inline-block`,
  }

  const legendBallCellStyle = t => {
    return {
      display: `table-cell`,
      verticalAlign: `middle`,
      textAlign: `center`,
      padding: 3,
      borderLeft: `1px solid ${t.colors.ui.border}`,
      borderBottom: `1px solid ${t.colors.ui.border}`,
    }
  }

  const legendExplanationCellStyle = t => {
    return {
      display: `table-cell`,
      verticalAlign: `middle`,
      textAlign: `center`,
      padding: 3,
      borderLeft: `1px solid ${t.colors.ui.border}`,
      borderBottom: [`1px solid ${t.colors.ui.border}`, null, 0],
    }
  }

  const balls = [
    <div sx={legendBallCellStyle} key={`${legendBallCellStyle}-1`}>
      <h4 style={{ margin: 0 }}>Icon</h4>
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

  return (
    <div>
      <div
        sx={{
          border: t => `1px solid ${t.colors.ui.border}`,
          borderLeft: 0,
          fontFamily: `heading`,
          display: [`none`, null, `table`],
        }}
      >
        <div css={{ display: `table-row` }}>{balls}</div>
        <div css={{ display: `table-row` }}>{legendText}</div>
      </div>
      <div
        sx={{
          display: [`table`, null, `none`],
          border: t => `1px solid ${t.colors.ui.border}`,
          borderLeft: 0,
          fontFamily: `heading`,
        }}
      >
        {[0, 1, 2, 3, 4].map(i => (
          <div css={{ display: `table-row` }} key={i}>
            {balls[i]}
            {legendText[i]}
          </div>
        ))}
      </div>
    </div>
  )
}

export default LegendTable
