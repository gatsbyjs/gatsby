import React, { Fragment } from "react"
import PropTypes from "prop-types"

const EggheadEmbed = ({ lessonLink, lessonTitle }) => (
  <Fragment>
    <iframe
      className="egghead-video"
      width={600}
      height={348}
      src={`${lessonLink}/embed`}
      title={`Video: ${lessonTitle}`}
    />

    <p>
      <em>
        Video hosted on <a href={lessonLink}>egghead.io</a>
      </em>
      .
    </p>
  </Fragment>
)

EggheadEmbed.propTypes = {
  lessonLink: PropTypes.string.isRequired,
  lessonTitle: PropTypes.string.isRequired,
}

export default EggheadEmbed
