import { formatDistance } from "date-fns"

export const getButtonProps = ({ status, createdAt }) => {
  switch (status) {
    case `SUCCESS`:
    case `ERROR`:
    case `BUILDING`: {
      return {
        tooltipText: ``,
      }
    }
    case `UPTODATE`: {
      return {
        tooltipText: `Preview updated ${formatDistance(
          Date.now(),
          new Date(createdAt),
          { includeSeconds: true }
        )} ago`,
        active: true,
      }
    }
    default: {
      return {
        tooltipText: ``,
      }
    }
  }
}
