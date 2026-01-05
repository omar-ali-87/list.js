/*
 * Source: https://github.com/segmentio/extend
 */

export default function extend<T extends Record<string, any>>(
  object: T,
  ...sources: Array<Record<string, any> | null | undefined>
): T {
  // For each extender, copy their properties on our object.
  for (let i = 0; i < sources.length; i++) {
    const source = sources[i]
    if (!source) continue
    for (const property in source) {
      if (Object.prototype.hasOwnProperty.call(source, property)) {
        ;(object as any)[property] = source[property]
      }
    }
  }

  return object
}
