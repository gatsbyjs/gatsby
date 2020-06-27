/** @jsx jsx */
import { jsx } from "theme-ui"
import { Fragment } from "react"
import WidgetWrapper from "./widget-wrapper"
import { SubmitButton, CloseButton } from "./buttons"
import { themedInput, themedInputFocus } from "../../utils/styles"
import { Actions, Title, ScreenReaderText } from "./styled-elements"
import RatingOption from "./rating-option"
import {
  MdSentimentDissatisfied,
  MdSentimentNeutral,
  MdSentimentVerySatisfied,
  MdSend,
  MdRefresh,
} from "react-icons/md"

const Form = ({ children }) => (
  <form
    sx={{
      mb: 0,
    }}
  >
    {children}
  </form>
)

const Fieldset = ({ children }) => (
  <fieldset
    sx={{
      border: 0,
      p: 0,
      mb: 4,
    }}
  >
    {children}
  </fieldset>
)

const Legend = ({ children }) => (
  <legend
    sx={{
      textAlign: `center`,
      fontSize: 1,
      mb: 4,
    }}
  >
    {children}
  </legend>
)

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

const TextareaLabel = ({ children }) => (
  <label
    sx={{
      fontSize: 1,
      fontWeight: `bold`,
      span: {
        fontWeight: `normal`,
      },
    }}
  >
    {children}
  </label>
)

const textareaStyles = {
  ...themedInput,
  height: `5.5rem`,
  mt: 1,
  mb: 4,
  px: 3,
  py: 2,
  lineHeight: `default`,
  overflowY: `scroll`,
}

export default function FeedbackForm({
  handleSubmit,
  handleClose,
  handleChange,
  handleCommentChange,
  titleRef,
  rating,
  comment,
  submitting,
}) {
  return (
    <WidgetWrapper id="feedback-widget" handleClose={handleClose}>
      <Form
        onSubmit={handleSubmit}
        className={`${submitting ? `submitting` : ``}`}
      >
        <Title ref={titleRef} tabIndex="-1">
          Was this doc helpful to you?
        </Title>
        <Fieldset className="ratings" disabled={submitting}>
          <Legend>Rate your experience</Legend>
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
        </Fieldset>
        <TextareaLabel className={`textarea ${submitting ? `disabled` : ``}`}>
          Your comments <span>(optional):</span>
          <textarea
            sx={textareaStyles}
            value={comment}
            onChange={handleCommentChange}
            disabled={submitting}
          />
        </TextareaLabel>
        <Actions>
          <CloseButton
            onClick={handleClose}
            disabled={submitting}
            type="button"
          >
            Cancel{` `}
            <ScreenReaderText className="sr-only">this widget</ScreenReaderText>
          </CloseButton>
          <SubmitButton
            type="submit"
            className={submitting && `submitting`}
            disabled={submitting}
          >
            {submitting ? (
              <Fragment>
                Sending, wait <MdRefresh />
              </Fragment>
            ) : (
              <Fragment>
                Send feedback
                <MdSend />
              </Fragment>
            )}
          </SubmitButton>
        </Actions>
      </Form>
    </WidgetWrapper>
  )
}
