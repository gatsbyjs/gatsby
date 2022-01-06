import React, { FC, MouseEvent, useEffect, useState } from "react"
import { IndicatorButtonTooltip } from "../tooltips"
import { spinnerIcon } from "../icons"
import { IIndicatorButtonProps } from "../../models/components"

const IndicatorButton: FC<IIndicatorButtonProps> = ({
  buttonIndex,
  tooltip,
  iconSvg,
  onClick,
  showSpinner,
  active = false,
  testId,
  onMouseEnter,
  hoverable,
  highlighted,
}) => {
  const [showTooltip, setShowTooltip] = useState(tooltip?.show)
  const isFirstButton = buttonIndex === 0
  const marginTop = isFirstButton ? `0px` : `8px`

  const onButtonMouseEnter = (): void => {
    if (active) {
      setShowTooltip(true)

      if (onMouseEnter) {
        onMouseEnter()
      }
    }
  }
  const onMouseLeave = (): void => setShowTooltip(false)
  const onButtonClick = (event: MouseEvent<HTMLButtonElement>): void => {
    event.stopPropagation()
    if (active && hoverable && onClick) {
      onClick()
    }
  }

  useEffect(() => {
    setShowTooltip(tooltip?.show)
  }, [tooltip?.show])

  return (
    <>
      <button
        data-gatsby-preview-indicator="button"
        data-gatsby-preview-indicator-active-button={`${active}`}
        data-gatsby-preview-indicator-hoverable={
          active && hoverable && !highlighted ? `true` : `false`
        }
        data-gatsby-preview-indicator-highlighted-button={`${highlighted}`}
        style={{ marginTop: marginTop }}
        onMouseEnter={onButtonMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={onButtonClick}
      >
        <div data-testid={`${testId}-button`}>
          {iconSvg}
          {showSpinner && (
            <div data-gatsby-preview-indicator="spinner">{spinnerIcon}</div>
          )}
        </div>
        {tooltip && (
          <IndicatorButtonTooltip
            {...tooltip}
            testId={testId}
            show={showTooltip}
          />
        )}
      </button>
    </>
  )
}

export default IndicatorButton
