export const preprocessTemplate = (tmp, removePandadocTags) => {
  const lines = tmp.split(/\r?\n/)

  let heading = 0
  let parNumber = []
  let emptyLine = true
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const isNewBlock = emptyLine
    emptyLine = line.match(/^\s*(\[\[[^\s]+\]\]\s*)?$/g)

    if (!isNewBlock) continue

    if (line.match(/^==/)) {
      heading++
      parNumber = []
      continue
    }

    if (line.match(/^:sectnums:/)) {
      heading = 0
      parNumber = []
      continue
    }

    if (line.match(/^ifeval::/) || line.match(/^ifdef::/)) {
      emptyLine = true
      continue
    }

    const parRgx = /^(\.+)(\s*\[\[([^\s]+)\]\])?/
    const numberedP = line.match(parRgx)

    if (!numberedP) continue
    const level = numberedP[1].length

    parNumber = parNumber.slice(0, level)
    parNumber[level - 1] = (parNumber[level - 1] || 0) + 1

    const fullNumber = `${heading}.${parNumber.join('.')}`

    const ref =
      numberedP[3] != null ? `[[${numberedP[3]}, ${fullNumber}]]\n` : ''

    lines[i] = line.replace(
      parRgx,
      `[horizontal.level${level}]\n${ref}${fullNumber}:${':'.repeat(level)}`,
    )
  }

  let res = lines.join('\n')

  return removePandadocTags
    ? res.replace(/\n\s?{signature:\w+}\s?\n/g, '\n')
    : res
}
