import { useEffect, useState } from "react"

export const useActiveHash = (itemIds, rootMargin = undefined) => {
  const [activeHash, setActiveHash] = useState(``)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveHash(entry.target.id)
          }
        })
      },
      { rootMargin: rootMargin || `0% 0% -80% 0%` }
    )

    itemIds.forEach(id => {
      observer.observe(document.getElementById(id))
    })

    return () => {
      itemIds.forEach(id => {
        observer.unobserve(document.getElementById(id))
      })
    }
  }, [])

  return activeHash
}
