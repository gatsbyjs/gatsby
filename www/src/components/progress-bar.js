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

  height: ${p => p.theme.space[1]};
  border-radius: ${p => p.theme.radii[2]};
  margin-right: ${p => p.theme.space[2]};

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
    <span sx={{ width: "2.5rem", textAlign: "right", fontSize: 1 }}>
      {Math.round(progress * 100)}%
    </span>
  </Wrapper>
)

export default ProgressBar
