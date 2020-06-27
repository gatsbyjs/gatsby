/** @jsx jsx */
import { jsx } from "theme-ui"
import { themedInput, themedInputFocus } from "../../utils/styles"
import RatingOption from "./rating-option"
import {
  MdSentimentDissatisfied,
  MdSentimentNeutral,
  MdSentimentVerySatisfied,
} from "react-icons/md"

const Rating = ({ children }) => (
  <div
    sx={{
      ...themedInput,
      px: 0,
      alignContent: `stretch`,
      display: `flex`,
      flex: `1 1 auto`,
      justifyContent: `stretch`,
      overflow: `hidden`,
      transition: `0.5s`,
      width: `99.99%`,

      "&:focus-within": {
        ...themedInputFocus,
      },

      "[disabled] &": {
        opacity: `0.5`,
      },
    }}
  >
    {children}
  </div>
)

const fieldsetStyles = {
  border: 0,
  p: 0,
  mb: 4,
}

const lengedStyles = {
  textAlign: `center`,
  fontSize: 1,
  mb: 4,
}

export default function Ratings({ rating, submitting, handleChange }) {
  return (
    <fieldset sx={fieldsetStyles} className="ratings" disabled={submitting}>
      <legend sx={lengedStyles}>Rate your experience</legend>
      <Rating>
        <RatingOption
          iconLabel="frowning face"
          icon={MdSentimentDissatisfied}
          ratingText="poor"
          ratingValue="1"
          checked={rating === 1}
          handleChange={handleChange}
        />
        <RatingOption
          iconLabel="neutral face"
          icon={MdSentimentNeutral}
          ratingText="fine"
          ratingValue="2"
          checked={rating === 2}
          handleChange={handleChange}
        />
        <RatingOption
          iconLabel="smiling face"
          icon={MdSentimentVerySatisfied}
          ratingText="great"
          ratingValue="3"
          checked={rating === 3}
          handleChange={handleChange}
        />
      </Rating>
    </fieldset>
  )
}
