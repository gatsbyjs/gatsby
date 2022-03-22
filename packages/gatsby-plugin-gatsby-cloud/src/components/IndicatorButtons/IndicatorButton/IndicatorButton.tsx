import React, { FC, useEffect, useState } from "react"
import { spinnerIcon } from "../../icons"
import { buttonStyle, wrapperStyle, spinnerStyle } from "./indicator-button.css"
import IndicatorButtonTooltip, {
  IIndicatorButtonTooltip,
} from "../../IndicatorButtonTooltip"

export interface IIndicatorButtonProps {
  icon: React.SVGProps<SVGSVGElement>
  testId?: string
  tooltip?: IIndicatorButtonTooltip
  disabled?: boolean
  clickable?: boolean
  highlighted?: boolean
  showSpinner?: boolean
  onClick?: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

const IndicatorButton: FC<IIndicatorButtonProps> = ({
  testId,
  tooltip,
  icon,
  showSpinner,
  highlighted,
  disabled,
  clickable = true,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const [tooltipVisible, setTooltipVisible] = useState(tooltip?.visible)
  const [tooltipIsRemoved, setTooltipIsRemoved] = useState(!tooltip?.visible)

  const onButtonMouseEnter = (): void => {
    if (!disabled && tooltip?.trigger === `hover`) {
      setTooltipIsRemoved(false)
      setTooltipVisible(true)
      onMouseEnter?.()
    }
  }

  const onButtonMouseLeave = (): void => {
    if (!disabled && tooltip?.trigger === `hover`) {
      setTooltipVisible(false)
      onMouseLeave?.()
    }
  }

  const onTooltipDisappear = () => {
    setTooltipIsRemoved(true)
    tooltip?.onDisappear?.()
  }

  useEffect(() => {
    setTooltipVisible(tooltip?.visible)
    if (tooltip?.visible) {
      setTooltipIsRemoved(false)
    }
  }, [tooltip?.visible])

  return (
    <div
      className={wrapperStyle}
      data-test-id={testId}
      onMouseEnter={onButtonMouseEnter}
      onMouseLeave={onButtonMouseLeave}
    >
      <button
        disabled={disabled}
        onClick={onClick}
        className={
          buttonStyle[
            highlighted ? `highlighted` : clickable ? `clickable` : `default`
          ]
        }
      >
        {icon}
        {showSpinner && <span className={spinnerStyle}>{spinnerIcon}</span>}
      </button>
      {tooltip && !tooltipIsRemoved && (
        <IndicatorButtonTooltip
          {...tooltip}
          visible={tooltipVisible}
          onDisappear={onTooltipDisappear}
        />
      )}
    </div>
  )
}

export default IndicatorButton
