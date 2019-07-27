import styled from "@emotion/styled"

export const HorizontalScroller = styled(`div`)`
  overflow-x: scroll;
  -webkit-overflow-scrolling: touch;
`

export const HorizontalScrollerContent = styled(`ul`)`
  display: inline-flex;
  list-style: none;
  padding: ${props => props.theme.space[2]} ${props => props.theme.space[6]}
    calc(${props => props.theme.space[2]} * 1.5);
  margin: 0;
`

export const HorizontalScrollerItem = styled(`li`)`
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.radii[2]}px;
  box-shadow: ${props => props.theme.shadows.raised};
  margin: 0;
  margin-right: ${props => props.theme.space[6]};
  width: 77vw;

  :last-child {
    margin-right: 0;
  }
`
