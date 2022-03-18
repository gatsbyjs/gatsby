import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  FC,
  MouseEvent,
} from "react"
import { closeIcon } from "../icons"
import {
  closeButtonStyle,
  wrapperInnerStyle,
  wrapperStyle,
} from "./indicator-button-tooltip.css"

export interface IIndicatorButtonTooltip {
  visible?: boolean
  content: React.ReactNode
  trigger: `click` | `hover` | `manual` | `none`
  onOpen?: () => void
  onClose?: () => void
  onAppear?: () => void
  onDisappear?: () => void
}

const IndicatorButtonTooltip: FC<IIndicatorButtonTooltip> = ({
  content,
  trigger,
  visible,
  onClose,
  onAppear,
  onDisappear,
}) => {
  const tooltipRef = useRef<HTMLDivElement | null>(null)
  const [isHidden, setIsHidden] = useState(visible)
  const [isRemoved, setIsRemoved] = useState(visible)
  const onCloseClick = (event: MouseEvent): void => {
    event.preventDefault()
    event.stopPropagation()
    onClose?.()
  }

  useEffect(() => {
    // check to make sure that tooltip fades out before setting it to 'display: none'
    const onTransitionEnd = (event: TransitionEvent): void => {
      const { propertyName, target } = event
      if (target !== tooltipRef.current) {
        return
      }
      if (tooltipRef.current) {
        if (window && propertyName === `opacity`) {
          const opacity = window
            .getComputedStyle(tooltipRef.current)
            .getPropertyValue(`opacity`)
          if (opacity === `0`) {
            onDisappear?.()
            setIsRemoved(true)
          } else {
            onAppear?.()
          }
        }
      }
    }
    if (tooltipRef.current) {
      tooltipRef.current.addEventListener(`transitionend`, onTransitionEnd)
    }
    return (): void => {
      if (tooltipRef.current) {
        tooltipRef.current.removeEventListener(`transitionend`, onTransitionEnd)
      }
    }
  }, [])

  useEffect(() => {
    setIsHidden(visible)
  }, [visible])

  return (
    <>
      {!isRemoved && (
        <div ref={tooltipRef} className={wrapperStyle}>
          <div className={wrapperInnerStyle[isHidden ? `hidden` : `default`]}>
            {content}
            {trigger === `manual` && (
              <button onClick={onCloseClick} className={closeButtonStyle}>
                {closeIcon}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default IndicatorButtonTooltip
