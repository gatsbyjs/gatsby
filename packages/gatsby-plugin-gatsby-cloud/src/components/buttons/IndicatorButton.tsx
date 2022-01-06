import React, { FC, MouseEvent, useState } from "react"
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
  const [showTooltip, setShowTooltip] = useState(false)
  const isFirstButton = buttonIndex === 0
  const marginTop = isFirstButton ? `0px` : `8px`

  const onMouseLeave = (): void => setShowTooltip(false)
  const onButtonClick = (event: MouseEvent<HTMLButtonElement>): void => {
    event.stopPropagation()
    if (active && onClick) {
      onClick()
    }
  }

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
        onMouseEnter={(): void => {
          setShowTooltip(true)

          if (onMouseEnter) {
            onMouseEnter()
          }
        }}
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
