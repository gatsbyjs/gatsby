import React, { useEffect, useRef, useState, FC, MouseEvent } from "react";
import { closeIcon } from "../icons";
import { closeButtonStyle, wrapperInnerStyle, wrapperStyle } from "./indicator-button-tooltip.css";

export interface IIndicatorButtonTooltip {
  visible?: boolean;
  content: React.ReactNode;
  /**
   * 'click': toggle tooltip by clicking the button
   * 'hover': toggle tooltip by mousing over the button
   * 'manual': tooltip only visible be setting the 'visible' prop to 'true, shows a close button'
   * 'manual': tooltip only visible be setting the 'visible' prop to 'true'
   */
  trigger: `click` | `hover` | `manual` | `none`;
  onOpen?: () => void;
  onClose?: () => void;
  onAppear?: () => void;
  onDisappear?: () => void;
}

const IndicatorButtonTooltip: FC<IIndicatorButtonTooltip> = ({
  content,
  trigger,
  visible,
  onClose,
  onAppear,
  onDisappear,
}) => {
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [isHidden, setIsHidden] = useState(visible);
  const onCloseClick = (event: MouseEvent): void => {
    event.preventDefault();
    event.stopPropagation();
    onClose?.();
  };

  useEffect(() => {
    // check to make sure that tooltip fades out before setting it to 'display: none'
    const onTransitionEnd = (event: TransitionEvent): void => {
      const { propertyName, target } = event;
      if (target !== tooltipRef.current) {
        return;
      }
      if (tooltipRef.current) {
        if (window && propertyName === `opacity`) {
          const opacity = window.getComputedStyle(tooltipRef.current).getPropertyValue(`opacity`);
          if (opacity === `0`) {
            onDisappear?.();
          } else {
            onAppear?.();
          }
        }
      }
    };
    if (tooltipRef.current) {
      tooltipRef.current.addEventListener(`transitionend`, onTransitionEnd);
    }
    return (): void => {
      if (tooltipRef.current) {
        tooltipRef.current.removeEventListener(`transitionend`, onTransitionEnd);
      }
    };
  }, []);

  useEffect(() => {
    setIsHidden(!visible);
  }, [visible]);

  return (
    <>
      <div className={wrapperStyle}>
        <div ref={tooltipRef} className={wrapperInnerStyle[isHidden ? `hidden` : `default`]}>
          {content}
          {trigger === `manual` && (
            <button onClick={onCloseClick} className={closeButtonStyle}>
              {closeIcon}
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default IndicatorButtonTooltip;
