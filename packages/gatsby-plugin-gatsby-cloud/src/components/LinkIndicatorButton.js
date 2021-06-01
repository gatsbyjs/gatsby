export const getButtonProps = ({ status, copyLinkClick, button }) => {
  switch (status) {
    case `SUCCESS`:
    case `ERROR`: {
      return {
        tooltipText: ``,
      }
    }
    case `BUILDING`:
    case `UPTODATE`:
    default: {
      return {
        tooltipText: button?.tooltipText || `Copy link`,
        onClick: copyLinkClick,
        overrideShowTooltip: button?.overrideShowTooltip,
        tooltipIcon: button?.tooltipIcon,
        active: true,
      }
    }
  }
}
