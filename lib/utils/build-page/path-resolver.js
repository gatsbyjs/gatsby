import slash from 'slash'
import parsePath from 'parse-filepath'
import urlResolver from './url-resolver'

export default function pathResolver (relativePath) {
  const data = {}

  data.file = parsePath(relativePath)

  // Remove the . from extname (.md -> md)
  data.file.ext = data.file.extname.slice(1)
  // Make sure slashes on parsed.dirname are correct for Windows
  data.file.dirname = slash(data.file.dirname)

  // Determine require path
  data.requirePath = slash(relativePath)

  // set the URL path (should this be renamed)
  // and now looking at it, it only needs a reference to pageData
  data.path = urlResolver(data, data.file)

  // Set the "template path"
  if (data.file.name === '_template') {
    data.templatePath = `/${data.file.dirname}/`
  }

  return data
}
