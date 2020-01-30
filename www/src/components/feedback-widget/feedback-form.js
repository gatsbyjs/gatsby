/** @jsx jsx */
import { jsx } from "theme-ui"
import styled from "@emotion/styled"
import WidgetWrapper from "./widget-wrapper"
import { SubmitButton, CloseButton } from "./buttons"
import { themedInput, themedInputFocus } from "../../utils/styles"
import { Actions, Title, ScreenReaderText } from "./styled-elements"
import RatingOption from "./rating-option"
import MdSentimentDissatisfied from "react-icons/lib/md/sentiment-dissatisfied"
import MdSentimentNeutral from "react-icons/lib/md/sentiment-neutral"
import MdSentimentVerySatisfied from "react-icons/lib/md/sentiment-very-satisfied"
import MdSend from "react-icons/lib/md/send"
import MdRefresh from "react-icons/lib/md/refresh"
import { useIntl, FormattedMessage } from "react-intl"

const Form = styled(`form`)`
  margin-bottom: 0;
`

const Fieldset = styled(`fieldset`)`
  border: 0;
  margin: 0 0 ${p => p.theme.space[4]};
  padding: 0;
`

const Legend = styled(`legend`)`
  display: inline-block;
  font-size: ${p => p.theme.fontSizes[1]};
  margin-bottom: ${p => p.theme.space[4]};
  padding: 0 ${p => p.theme.space[2]};
  text-align: center;
`

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

const TextareaLabel = styled(`label`)`
  font-size: ${p => p.theme.fontSizes[1]};
  font-weight: bold;

  span {
    font-weight: normal;
  }
`

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

const ratingOptions = [
  {
    ratingValue: 1,
    icon: MdSentimentDissatisfied,
  },
  {
    ratingValue: 2,
    icon: MdSentimentNeutral,
  },
  {
    ratingValue: 3,
    icon: MdSentimentVerySatisfied,
  },
]

const FeedbackForm = ({
  handleSubmit,
  handleClose,
  handleChange,
  handleCommentChange,
  titleRef,
  rating,
  comment,
  submitting,
}) => {
  const { formatMessage } = useIntl()

  return (
    <WidgetWrapper id="feedback-widget" handleClose={handleClose}>
      <Form
        onSubmit={handleSubmit}
        className={`${submitting ? `submitting` : ``}`}
      >
        <Title ref={titleRef} tabIndex="-1">
          <FormattedMessage id="feedback.title" />
        </Title>
        <Fieldset className="ratings" disabled={submitting}>
          <Legend>
            <FormattedMessage id="feedback.legend" />
          </Legend>
          <Rating>
            {ratingOptions.map(option => (
              <RatingOption
                {...option}
                ratingText={formatMessage({
                  id: `feedback.ratings.${option.ratingValue}.ratingText`,
                })}
                iconLabel={formatMessage({
                  id: `feedback.ratings.${option.ratingValue}.iconLabel`,
                })}
                key={option.ratingValue}
                checked={rating === option.ratingValue}
                handleChange={handleChange}
              />
            ))}
          </Rating>
        </Fieldset>
        <TextareaLabel className={`textarea ${submitting ? `disabled` : ``}`}>
          <FormattedMessage
            id="feedback.textLabel"
            values={{
              span: (...chunks) => <span>{chunks}</span>,
            }}
          />
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
            <FormattedMessage
              id="feedback.cancel"
              values={{
                sronly: (...chunks) => (
                  <ScreenReaderText className="sr-only">
                    {chunks}
                  </ScreenReaderText>
                ),
              }}
            />
          </CloseButton>
          <SubmitButton
            type="submit"
            className={submitting && `submitting`}
            disabled={submitting}
          >
            {submitting ? (
              <FormattedMessage
                id="feedback.sending"
                values={{ icon: <MdRefresh /> }}
              />
            ) : (
              <FormattedMessage
                id="feedback.send"
                values={{ icon: <MdSend /> }}
              />
            )}
          </SubmitButton>
        </Actions>
      </Form>
    </WidgetWrapper>
  )
}

export default FeedbackForm
