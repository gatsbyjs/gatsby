import React from 'react'

const blogPostThumbnail = ({ elements, keyValue, detailValue }) => (
  <div className="col-4" key={keyValue}>
    <span className="image fit">
      <img
        src={elements.image.assets[0].url}
        alt={elements.image.assets[0].name}
      />
    </span>
    <h3>{elements.title.value}</h3>
    <p>{elements.summary.value}</p>
    <ul className="actions">
      <li>
        <a href={elements.slug.value} className="button">
          {detailValue}
        </a>
      </li>
    </ul>
  </div>
)

export default blogPostThumbnail
