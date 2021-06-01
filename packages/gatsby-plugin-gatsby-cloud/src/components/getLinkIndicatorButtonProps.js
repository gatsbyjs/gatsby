const getLinkIndicatorButtonProps = ({ status, button }) => {
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
        overrideShowTooltip: button?.overrideShowTooltip,
        tooltipIcon: button?.tooltipIcon,
        active: true,
      }
    }
  }
}

export default getLinkIndicatorButtonProps
