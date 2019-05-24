import React from 'react'

const HeaderSection = ({ elements }) => (
  <section id="header">
    <div className="inner">
      <span className="icon major fa-cloud" />
      <h1>{elements.primary_text.value}</h1>
      <p>{elements.secondary_text.value}</p>
      <ul className="actions">
        <li>
          <a href={elements.url.value} className="button scrolly">
            {elements.text.value}
          </a>
        </li>
      </ul>
    </div>
  </section>
)

export default HeaderSection
