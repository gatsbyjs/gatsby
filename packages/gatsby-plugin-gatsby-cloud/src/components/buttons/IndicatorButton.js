import React, { useEffect, useState } from "react"
import { IndicatorButtonTooltip } from "../tooltips"
import { spinnerIcon } from "../icons"

const IndicatorButton = ({
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
  onTooltipToogle,
}) => {
  const [showTooltip, setShowTooltip] = useState(tooltip?.show)
  const isFirstButton = buttonIndex === 0
  const marginTop = isFirstButton ? `0px` : `8px`
  const onButtonMouseEnter = () => {
    if (active && tooltip?.hoverable) {
      setShowTooltip(true)

      if (typeof onMouseEnter === `function`) {
        onMouseEnter()
      }
      if (typeof onTooltipToogle === `function`) {
        onTooltipToogle(true)
      }
    }
  }
  const onMouseLeave = () => {
    setShowTooltip(false)
    if (typeof onTooltipToogle === `function`) {
      onTooltipToogle(false)
    }
  }
  const onButtonClick = event => {
    event.preventDefault()
    event.stopPropagation()
    if (active && typeof onClick === `function`) {
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
        data-testid={`${testId}-button`}
        style={{ marginTop: marginTop }}
        onMouseEnter={onButtonMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={onButtonClick}
      >
        <div>
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
