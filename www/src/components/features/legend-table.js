import React from "react"

import EvaluationCell from "./evaluation-cell"
import { colors, mediaQueries, fonts } from "../../utils/presets"

const legendBorderColor = colors.ui.border.subtle

const LegendTable = () => {
  const legendBallStyle = {
    float: `none`,
    marginLeft: 0,
    marginRight: 0,
    display: `inline-block`,
  }

  const legendBallCellStyle = {
    display: `table-cell`,
    verticalAlign: `middle`,
    textAlign: `center`,
    padding: 10,
    borderLeft: `1px solid ${legendBorderColor}`,
    borderBottom: `1px solid ${legendBorderColor}`,
  }

  const legendExplanationCellStyle = {
    display: `table-cell`,
    verticalAlign: `middle`,
    textAlign: `center`,
    padding: 10,
    borderLeft: `1px solid ${legendBorderColor}`,
    borderBottom: `1px solid ${legendBorderColor}`,
    [mediaQueries.sm]: {
      borderBottom: 0,
    },
  }

  const balls = [
    <div css={legendBallCellStyle} key={`${legendBallCellStyle}-1`}>
      <h4 style={{ margin: 0 }}>Icon</h4>
    </div>,
    <div css={legendBallCellStyle} key={`${legendBallCellStyle}-2`}>
      <EvaluationCell num="3" style={legendBallStyle} />
    </div>,
    <div css={legendBallCellStyle} key={`${legendBallCellStyle}-3`}>
      <EvaluationCell num="2" style={legendBallStyle} />
    </div>,
    <div css={legendBallCellStyle} key={`${legendBallCellStyle}-4`}>
      <EvaluationCell num="1" style={legendBallStyle} />
    </div>,
    <div css={legendBallCellStyle} key={`${legendBallCellStyle}-5`}>
      <EvaluationCell num="0" style={legendBallStyle} />
    </div>,
  ]

  const legendText = [
    <div css={legendExplanationCellStyle} key={`legendExplanationCell-1`}>
      <h5 style={{ margin: 0 }}>Feature Availability</h5>
    </div>,
    <div css={legendExplanationCellStyle} key={`legendExplanationCell-2`}>
      Excellent (fully available)
    </div>,
    <div css={legendExplanationCellStyle} key={`legendExplanationCell-3`}>
      Good (partially available, e.g. plugins)
    </div>,
    <div css={legendExplanationCellStyle} key={`legendExplanationCell-4`}>
      Fair (needs customization or limited)
    </div>,
    <div css={legendExplanationCellStyle} key={`legendExplanationCell-5`}>
      Poor (not possible)
    </div>,
  ]

  return (
    <div>
      <div
        css={{
          border: `1px solid ${legendBorderColor}`,
          borderLeft: 0,
          fontFamily: fonts.header,
          display: `none`,
          [mediaQueries.sm]: {
            display: `table`,
          },
        }}
      >
        <div css={{ display: `table-row` }}>{balls}</div>
        <div css={{ display: `table-row` }}>{legendText}</div>
      </div>
      <div
        css={{
          display: `table`,
          border: `1px solid ${legendBorderColor}`,
          borderLeft: 0,
          fontFamily: fonts.header,
          [mediaQueries.sm]: {
            display: `none`,
          },
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
