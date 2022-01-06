import React, { useState } from "react"
import { IndicatorButtonTooltip } from "../tooltips"
import { spinnerIcon, exitIcon } from "../icons"
import { props } from "bluebird"

export default function IndicatorButton({
  buttonIndex,
  tooltipContent,
  overrideShowTooltip = false,
  iconSvg,
  onClick,
  showSpinner,
  active = false,
  testId,
  onMouseEnter,
  hoverable,
  exitButton,
}) {
  const [showTooltip, setShowTooltip] = useState(false)
  const isFirstButton = buttonIndex === 0
  const marginTop = isFirstButton ? `0px` : `8px`

  return (
    <>
      <button
        data-gatsby-preview-indicator="button"
        data-gatsby-preview-indicator-active-button={`${active}`}
        data-gatsby-preview-indicator-hoverable={
          active && hoverable ? `true` : `false`
        }
        style={{ marginTop: marginTop }}
      >
        <div
          data-testid={`${testId}-button`}
          onClick={
            hoverable
              ? onClick
              : () => {
                  setShowTooltip(!showTooltip)
                }
          }
          onMouseEnter={() => {
            if (hoverable) {
              setShowTooltip(true)

              if (onMouseEnter) {
                onMouseEnter()
              }
            }
          }}
          onMouseLeave={() => {
            if (hoverable) {
              setShowTooltip(false)
            }
          }}
        >
          {iconSvg}
          {showSpinner && (
            <div data-gatsby-preview-indicator="spinner">{spinnerIcon}</div>
          )}
        </div>
      </button>
      {tooltipContent && (
        <IndicatorButtonTooltip
          tooltipContent={tooltipContent}
          iconExit={
            exitButton && (
              <button
                onClick={() => {
                  setShowTooltip(false)
                }}
                data-gatsby-preview-indicator="tooltip-link"
              >
                {exitIcon}
              </button>
            )
          }
          overrideShowTooltip={overrideShowTooltip}
          showTooltip={showTooltip}
          buttonIndex={buttonIndex}
          testId={testId}
        />
      )}
    </>
  )
}
