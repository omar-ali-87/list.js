/*
 * Source: https://github.com/segmentio/extend
 */

export default function extend<T extends Record<string, any>>(
  object: T,
  ...sources: Array<Record<string, any> | null | undefined>
): T {
  // Takes an unlimited number of extenders.
  const args = Array.prototype.slice.call(arguments, 1) as Array<
    Record<string, any> | null | undefined
  >

  // For each extender, copy their properties on our object.
  for (let i = 0; i < args.length; i++) {
    const source = args[i]
    if (!source) continue
    for (const property in source) {
      if (Object.prototype.hasOwnProperty.call(source, property)) {
        object[property] = source[property]
      }
    }
  }

  return object
}

