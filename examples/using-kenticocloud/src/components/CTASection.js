import React from 'react'

const ctaSection = ({ elements }) => {
  const buttons = elements.buttons.map(({ elements, system }) => (
    <li key={system.id}>
      <a
        href={elements.url.value}
        className={`button ${elements.special.value.map(
          isChecked => isChecked.codename
        )}`}
      >
        {elements.text.value}
      </a>
    </li>
  ))

  return (
    <section id="four" className="main style2 special">
      <div className="container">
        <header className="major">
          <h2>{elements.primary_text.value}</h2>
        </header>
        <p>{elements.secondary_text.value}</p>
        <ul className="actions uniform">{buttons}</ul>
      </div>
    </section>
  )
}
export default ctaSection
