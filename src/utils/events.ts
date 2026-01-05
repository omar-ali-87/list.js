import toArray from './to-array'

const bindMethod: 'addEventListener' | 'attachEvent' = typeof window.addEventListener === 'function' ? 'addEventListener' : 'attachEvent'
const unbindMethod: 'removeEventListener' | 'detachEvent' = typeof window.removeEventListener === 'function' ? 'removeEventListener' : 'detachEvent'
const prefix = bindMethod !== 'addEventListener' ? 'on' : ''

/**
 * Bind `el` event `type` to `fn`.
 *
 * @param {Element} el, NodeList, HTMLCollection or Array
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @api public
 */

export function bind(
  el: Element | NodeList | HTMLCollection | Element[],
  type: string,
  fn: EventListener,
  capture?: boolean
): void {
  const elements = toArray<Element>(el)
  for (let i = 0, il = elements.length; i < il; i++) {
    ;(elements[i] as any)[bindMethod](prefix + type, fn, capture || false)
  }
}

/**
 * Unbind `el` event `type`'s callback `fn`.
 *
 * @param {Element} el, NodeList, HTMLCollection or Array
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @api public
 */

export function unbind(
  el: Element | NodeList | HTMLCollection | Element[],
  type: string,
  fn: EventListener,
  capture?: boolean
): void {
  const elements = toArray<Element>(el)
  for (let i = 0, il = elements.length; i < il; i++) {
    ;(elements[i] as any)[unbindMethod](prefix + type, fn, capture || false)
  }
}

/**
 * Returns a function, that, as long as it continues to be invoked, will not
 * be triggered. The function will be called after it stops being called for
 * `wait` milliseconds. If `immediate` is true, trigger the function on the
 * leading edge, instead of the trailing.
 *
 * @param {Function} fn
 * @param {Integer} wait
 * @param {Boolean} immediate
 * @api public
 */

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  wait: number,
  immediate?: boolean
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  return wait
    ? function (this: any, ...args: Parameters<T>) {
        const context = this
        const later = function () {
          timeout = null
          if (!immediate) fn.apply(context, args)
        }
        const callNow = immediate && !timeout
        if (timeout) clearTimeout(timeout)
        timeout = setTimeout(later, wait)
        if (callNow) fn.apply(context, args)
      }
    : fn
}

