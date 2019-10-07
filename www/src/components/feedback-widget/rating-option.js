import React from "react"
import styled from "@emotion/styled"
import { keyframes } from "@emotion/core"

import { colors, fontSizes, space } from "../../utils/presets"

const animA = keyframes`
  from  {
    transform: translate3d(0,0,0);
  }
  20%, 53%, 80%, to {
    transform: translate3d(0,0.3rem,0);
  }

  40%, 43% {
    transform: translate3d(0, -0.5rem, 0);
  }

  70% {
    transform: translate3d(0, -0.2rem, 0);
  }

  90% {
    transform: translate3d(0,0,0);
  }
`
const animB = keyframes`

  25% {
    transform: rotate(7deg);
  }
  75% {
    transform: rotate(-7deg);
  }
`

const animC = keyframes`
  10% {
    transform: translate3d(0, 0, 0);
  }
  60% {
    transform: translate3d(0, -0.3rem, 0);
  }
  65% {
    transform: translate3d(0, 0, 0);
  }
`

const IconWrapper = styled(`span`)`
  display: block;
  height: ${space[9]};
  transition: 0.5s;
  width: ${space[9]};

  svg {
    color: ${colors.lilac};
    height: 100%;
    width: 100%;
  }
`

const RatingText = styled(`span`)`
  display: block;
  font-size: ${fontSizes[0]};
  font-weight: bold;
  transition: 0.5s;
  line-height: 1;
  margin-top: ${space[1]};
`

const Label = styled(`label`)`
  align-items: center;
  background: ${colors.white};
  cursor: pointer;
  display: flex;
  flex-basis: 33.33%;
  flex-direction: column;
  justify-content: center;
  height: 5.5rem;
  text-align: center;
  transition: background 0.25s;

  &.focused {
    background: ${colors.lilac};
    color: ${colors.white};

    ${IconWrapper} {
      svg {
        color: ${colors.orange[40]};
      }
    }
  }

  fieldset[disabled] & {
    cursor: not-allowed;
  }

  fieldset:not([disabled]) & {
    &:hover {
      &:nth-of-type(1) {
        ${IconWrapper} {
          transform: translateY(3.7rem);

          svg {
            animation: ${animC} 3s ease infinite;
          }
        }

        ${RatingText} {
          transform: translateY(-1.6rem);
        }
      }

      &:nth-of-type(2) {
        ${IconWrapper} {
          animation: ${animB} ease-in-out 0.8s infinite;
        }
      }

      &:nth-of-type(3) {
        ${IconWrapper} {
          animation: ${animA} 1.2s infinite;
        }
      }
    }
  }
`

const Input = styled(`input`)`
  left: 0;
  opacity: 0;
  position: absolute;
  top: 0;
`

const RatingOption = ({
  iconLabel,
  ratingText,
  ratingValue,
  checked,
  handleChange,
  icon: Icon,
}) => (
  <Label className={checked ? `focused` : null}>
    <IconWrapper>
      <Icon aria-label={iconLabel} />
    </IconWrapper>
    <RatingText className="level">{ratingText}</RatingText>
    <Input
      type="radio"
      name="feedback"
      value={ratingValue}
      id={`rating${ratingValue}`}
      checked={checked}
      onChange={handleChange}
    />
  </Label>
)

export default RatingOption
