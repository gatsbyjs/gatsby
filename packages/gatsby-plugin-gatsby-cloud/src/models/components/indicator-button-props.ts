import { IIndicatorButtonTooltipProps } from "."

export default interface IIndicatorButtonProps {
  buttonIndex: number
  testId: string
  showSpinner?: boolean
  active?: boolean
  hoverable?: boolean
  highlighted?: boolean
  iconSvg?: React.ReactNode
  tooltip?: IIndicatorButtonTooltipProps
  onClick?: () => void
  onMouseEnter?: () => void
}
