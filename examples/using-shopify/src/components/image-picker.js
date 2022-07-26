import React, { useState } from "react"
import Image from "gatsby-image"

import * as styles from "./image-picker.module.css"

function ImagePicker({ images }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const thumbnails = images.reduce((merged, image) => {
    if (image.thumbnail) {
      merged.push(image.thumbnail)
    }
    return merged
  }, [])
  return (
    <div className={styles.container}>
      <div className={styles.mainImage}>
        <Image fluid={images[activeIndex].full.fluid} />
      </div>
      {thumbnails.length > 1 && (
        <div className={styles.thumbnails}>
          {thumbnails.map((image, index) => (
            <button
              className={[styles.thumbnail]
                .concat(activeIndex === index ? styles.active : null)
                .join(` `)}
              key={image.fixed.src}
              onClick={() => setActiveIndex(index)}
            >
              <Image fixed={image.fixed} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ImagePicker
