import React, { FC, useEffect, useState } from "react"
import { IndicatorButtonTooltip } from "../tooltips"
import { spinnerIcon } from "../icons"
import { buttonStyle, wrapperStyle } from "./indicator-button.css"

interface IIndicatorButtonTooltip {
  visible: boolean
  content: React.ReactNode
  trigger: `click` | `hover`
  onOpen?: () => void
  onClose?: () => void
}

interface IIndicatorButtonProps {
  testId?: string
  icon: React.SVGProps<SVGSVGElement>
  tooltip?: IIndicatorButtonTooltip
  disabled: boolean
  highlighted: boolean
  showSpinner: boolean
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
    <div className={wrapperStyle}>
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
        <IndicatorButtonTooltip
          {...tooltip}
          testId={testId}
          show={tooltipVisible}
        />
      )}
    </div>
  )
}

export default IndicatorButton
