export default function (this: any, source: string): string {
  return source?.replace(
    `versions = require(\`../vendor/\${versions.vips}/\${platformAndArch}/versions.json\`);`,
    ``
  )
}
