import React from 'react'

const footerSection = ({ elements }) => {
  const icons = elements.icons.map(({ elements, system }) => (
    <li key={system.id}>
      <a
        href={elements.url.value}
        className={`icon alt ${elements.icon[0].elements.code.value}`}
      >
        <span className="label">{elements.text.value}</span>
      </a>
    </li>
  ))

  return (
    <section id="footer">
      <ul className="icons">{icons}</ul>
      <div
        className="copyright"
        dangerouslySetInnerHTML={{ __html: elements.copyright.value }}
      />
    </section>
  )
}

export default footerSection
