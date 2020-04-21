import styled from "@emotion/styled"

export const HorizontalScroller = styled(`div`)`
  overflow-x: scroll;
  -webkit-overflow-scrolling: touch;
`

export const HorizontalScrollerContent = styled(`ul`)`
  display: inline-flex;
  list-style: none;
  padding: ${p => p.theme.space[2]} ${p => p.theme.space[6]}
    calc(${p => p.theme.space[2]} * 1.5);
  margin: 0;
`

export const HorizontalScrollerItem = styled(`li`)`
  background: ${p => p.theme.colors.card.background};
  border-radius: ${p => p.theme.radii[2]};
  box-shadow: ${p => p.theme.shadows.raised};
  margin: 0;
  margin-right: ${p => p.theme.space[6]};
  width: 77vw;

  :last-child {
    margin-right: 0;
  }
`
