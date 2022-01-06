import React, { FC, useEffect, useRef, useState, MouseEvent } from "react"
import { IIndicatorButtonTooltipProps } from "../../models/components"
import { closeIcon } from "../icons"

const IndicatorButtonTooltip: FC<IIndicatorButtonTooltipProps> = ({
  content,
  overrideShow,
  show,
  testId,
  closable,
  onClose,
  onAppear,
  onDisappear,
}) => {
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(overrideShow || show)
  const onCloseClick = (event: MouseEvent<HTMLSpanElement>): void => {
    event.preventDefault()
    if (onClose) {
      onClose()
    }
  }
  useEffect(() => {
    if (overrideShow || show) {
      setVisible(true)
    }
  }, [overrideShow, show])
  useEffect(() => {
    const onTransitionEnd = ({ propertyName }: TransitionEvent): void => {
      if (tooltipRef.current) {
        if (window && propertyName === `opacity`) {
          const opacity = window
            .getComputedStyle(tooltipRef.current)
            .getPropertyValue(`opacity`)
          if (opacity === `0`) {
            if (onDisappear) {
              onDisappear()
            }
            setVisible(false)
          } else {
            if (onAppear) {
              onAppear()
            }
          }
        }
        tooltipRef.current.addEventListener(`transitionend`, onTransitionEnd)
      }
    }
    return (): void => {
      if (tooltipRef.current) {
        tooltipRef.current.removeEventListener(`transitionend`, onTransitionEnd)
      }
    }
  }, [])
  return (
    <div
      data-gatsby-preview-indicator="tooltip"
      data-gatsby-preview-indicator-visible={`${overrideShow || show}`}
      data-gatsby-preview-indicator-removed={`${!visible}`}
      data-testid={`${testId}-tooltip`}
      ref={tooltipRef}
    >
      <div data-gatsby-preview-indicator="tooltip-inner">
        {content}
        {closable && (
          <span
            data-gatsby-preview-indicator="tooltip-close-btn"
            onClick={onCloseClick}
          >
            {closeIcon}
          </span>
        )}
      </div>
    </div>
  )
}

export default IndicatorButtonTooltip
