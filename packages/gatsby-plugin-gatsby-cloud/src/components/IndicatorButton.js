import React, { useState } from "react";
import IndicatorButtonTooltip from "./IndicatorButtonTooltip"

const spinnerIcon = <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
<mask id="mask0" mask-type="alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="28" height="28">
<mask id="mask1" maskUnits="userSpaceOnUse" x="0" y="14" width="28" height="14">
<path d="M14 28C21.732 28 28 21.732 28 14L-4.20265e-07 14C-1.24156e-06 21.732 6.26801 28 14 28Z" fill="#232129"/>
</mask>
<g mask="url(#mask1)">
<path fill-rule="evenodd" clip-rule="evenodd" d="M13.999 28C21.731 28 27.999 21.732 27.999 14C27.999 6.26801 21.731 0 13.999 0C6.26704 0 -0.000976562 6.26801 -0.000976562 14C-0.000976562 21.732 6.26704 28 13.999 28ZM13.9988 25.2001C20.1844 25.2001 25.1989 20.1857 25.1989 14.0001C25.1989 7.81452 20.1844 2.80011 13.9988 2.80011C7.81325 2.80011 2.79883 7.81452 2.79883 14.0001C2.79883 20.1857 7.81325 25.2001 13.9988 25.2001Z" fill="#2DE3DA"/>
</g>
<mask id="mask2" maskUnits="userSpaceOnUse" x="0" y="0" width="28" height="28">
<path fill-rule="evenodd" clip-rule="evenodd" d="M14 28C21.732 28 28 21.732 28 14C28 6.26801 21.732 0 14 0C6.26801 0 0 6.26801 0 14C0 21.732 6.26801 28 14 28ZM13.9996 25.2001C20.1852 25.2001 25.1996 20.1857 25.1996 14.0001C25.1996 7.81452 20.1852 2.80011 13.9996 2.80011C7.814 2.80011 2.79958 7.81452 2.79958 14.0001C2.79958 20.1857 7.814 25.2001 13.9996 25.2001Z" fill="#2DE3DA"/>
</mask>
<g mask="url(#mask2)">
<path d="M14 0C6.26801 0 0 6.26801 0 14L28 14C28 6.26801 21.732 0 14 0Z" fill="url(#paint0_linear)"/>
</g>
</mask>
<g mask="url(#mask0)">
<circle cx="14" cy="14" r="14" fill="#8A4BAF"/>
</g>
<defs>
<linearGradient id="paint0_linear" x1="5.25" y1="14" x2="22.75" y2="14" gradientUnits="userSpaceOnUse">
<stop stop-color="#663399" stop-opacity="0"/>
<stop offset="1"/>
</linearGradient>
</defs>
</svg>

const IndicatorButton = ({ 
    toolTipOffset, 
    isFirstButton,
    tooltipText,
    overrideShowTooltip=false,
    tooltipLink,
    tooltipIcon,
    tooltipLinkImage,
    iconSvg,
    onClick,
    showSpinner,
    active=false,
    testId 
  }) => {
    const [showTooltip, setShowTooltip] = useState(false)
    const marginTop = isFirstButton ? '0px' : '8px';
    
    const onMouseEnter = () => setShowTooltip(true)
    const onMouseLeave = () => setShowTooltip(false)

    return (
      <>
        <div
          data-gatsby-preview-indicator="button"
          data-testid={testId}
          data-gatsby-preview-indicator-active-button={`${active}`}
          data-gatsby-preview-indicator-hoverable={active && !isFirstButton ? "true" : "false"}
          style={{ marginTop: marginTop }}
        >
          <div onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} onClick={onClick}>
            {iconSvg}
            {showSpinner && <div data-gatsby-preview-indicator="spinner">{spinnerIcon}
            </div>}
          </div>
        </div>
        {tooltipText && <IndicatorButtonTooltip 
          tooltipText={tooltipText}
          overrideShowTooltip={overrideShowTooltip}
          showTooltip={showTooltip}
          tooltipIcon={tooltipIcon}
          toolTipOffset={toolTipOffset}
          tooltipLink={tooltipLink}
          tooltipLinkImage={tooltipLinkImage}
          onClick={onClick}
        />}
      </>
    )
  }

  export default IndicatorButton;