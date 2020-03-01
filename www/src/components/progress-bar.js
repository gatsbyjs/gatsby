/** @jsx jsx */
import { jsx } from "theme-ui"
import styled from "@emotion/styled"

const Wrapper = styled.div`
  display: flex;
  align-items: center;
`

const BarBackground = styled.div`
  flex-grow: 1;
  overflow: hidden;

  height: 4px;
  border-radius: 4px;
  margin-right: 8px;

  background-color: ${p => p.theme.colors.ui.border};
`

const Bar = styled.div`
  height: 100%;
  background-color: ${p => p.theme.colors.textMuted};
`

const ProgressBar = ({ progress, ...props }) => (
  <Wrapper {...props}>
    <BarBackground>
      <Bar css={{ width: `${progress * 100}%` }} />
    </BarBackground>
    <span sx={{ width: "2.5rem", textAlign: "right" }}>
      {Math.round(progress * 100)}%
    </span>
  </Wrapper>
)

export default ProgressBar
