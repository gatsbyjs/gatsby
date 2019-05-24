import React from 'react'

const featuresSection = ({ elements }) => {
  const icons = elements.icons.map((icon, index) => (
    <li key={icon.system.id}>
      <span
        className={`icon style${index + 1} major ${icon.elements.code.value}`}
      />
    </li>
  ))

  return (
    <section id="two" className="main style2">
      <div className="grid-wrapper">
        <div className="col-6">
          <ul className="major-icons">{icons}</ul>
        </div>
        <div className="col-6">
          <header className="major">
            <h2>{elements.primary_text.value}</h2>
          </header>
          <div
            dangerouslySetInnerHTML={{ __html: elements.secondary_text.value }}
          />
        </div>
      </div>
    </section>
  )
}
export default featuresSection
