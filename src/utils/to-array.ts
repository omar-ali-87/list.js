/**
 * Source: https://github.com/timoxley/to-array
 *
 * Convert an array-like object into an `Array`.
 * If `collection` is already an `Array`, then will return a clone of `collection`.
 *
 * @param {Array | Mixed} collection An `Array` or array-like object to convert e.g. `arguments` or `NodeList`
 * @return {Array} Naive conversion of `collection` to a new `Array`.
 * @api public
 */

function isArray(arr: any): arr is any[] {
  return Object.prototype.toString.call(arr) === '[object Array]'
}

export default function toArray<T>(collection: any): T[] {
  if (typeof collection === 'undefined') return []
  if (collection === null) return [null as any]
  if (collection === window) return [window as any]
  if (typeof collection === 'string') return [collection as any]
  if (isArray(collection)) return collection as T[]
  if (typeof collection.length !== 'number') return [collection]
  if (typeof collection === 'function' && collection instanceof Function) return [collection as any]

  const arr: T[] = []
  for (let i = 0, il = collection.length; i < il; i++) {
    if (Object.prototype.hasOwnProperty.call(collection, i) || i in collection) {
      arr.push(collection[i])
    }
  }
  if (!arr.length) return []
  return arr
}
