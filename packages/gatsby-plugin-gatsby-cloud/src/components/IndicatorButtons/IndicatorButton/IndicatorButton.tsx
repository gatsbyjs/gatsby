import React, { FC, useEffect, useState } from "react"
import IndicatorButtonTooltip from "../../IndicatorButtonTooltip"
import { spinnerIcon } from "../../icons"
import { buttonStyle, wrapperStyle } from "./indicator-button.css"
import { IIndicatorButtonTooltip } from "../../IndicatorButtonTooltip"

export interface IIndicatorButtonProps {
  icon: React.SVGProps<SVGSVGElement>
  testId?: string
  tooltip?: IIndicatorButtonTooltip
  disabled?: boolean
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
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const [tooltipVisible, setTooltipVisible] = useState(tooltip?.visible)

  const onButtonMouseEnter = (): void => {
    if (!disabled && tooltip?.trigger === `hover`) {
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

  useEffect(() => {
    setTooltipVisible(tooltip?.visible)
  }, [tooltip?.visible])

  return (
    <div className={wrapperStyle} data-test-id={testId}>
      <button
        disabled={disabled}
        onMouseEnter={onButtonMouseEnter}
        onMouseLeave={onButtonMouseLeave}
        onClick={onClick}
        className={buttonStyle[highlighted ? `highlighted` : `default`]}
      >
        {icon}
        {showSpinner && spinnerIcon}
      </button>
      {tooltip && (
        <IndicatorButtonTooltip {...tooltip} visible={tooltipVisible} />
      )}
    </div>
  )
}

export default IndicatorButton
