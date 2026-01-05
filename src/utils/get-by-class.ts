/**
 * A cross-browser implementation of getElementsByClass.
 * Heavily based on Dustin Diaz's function: http://dustindiaz.com/getelementsbyclass.
 *
 * Find all elements with class `className` inside `container`.
 * Use `single = true` to increase performance in older browsers
 * when only one element is needed.
 *
 * @param {String} className
 * @param {Element} container
 * @param {Boolean} single
 * @api public
 */

export interface GetByClassOptions {
  test?: {
    getElementsByClassName?: boolean
    querySelector?: boolean
  }
}

const getElementsByClassName = function (
  container: Element,
  className: string,
  single: boolean
): HTMLElement | HTMLElement[] | undefined {
  if (single) {
    return (container.getElementsByClassName(className)[0] as HTMLElement) || undefined
  } else {
    return Array.from(container.getElementsByClassName(className)) as HTMLElement[]
  }
}

const querySelector = function (
  container: Element,
  className: string,
  single: boolean
): HTMLElement | HTMLElement[] | undefined {
  const selector = '.' + className
  if (single) {
    return (container.querySelector(selector) as HTMLElement) || undefined
  } else {
    return Array.from(container.querySelectorAll(selector)) as HTMLElement[]
  }
}

const polyfill = function (
  container: Element,
  className: string,
  single: boolean
): HTMLElement | HTMLElement[] | undefined {
  const classElements: HTMLElement[] = []
  const tag = '*'

  const els = container.getElementsByTagName(tag)
  const elsLen = els.length
  const pattern = new RegExp('(^|\\s)' + className + '(\\s|$)')
  for (let i = 0, j = 0; i < elsLen; i++) {
    if (pattern.test((els[i] as HTMLElement).className)) {
      if (single) {
        return els[i] as HTMLElement
      } else {
        classElements[j] = els[i] as HTMLElement
        j++
      }
    }
  }
  return single ? undefined : classElements
}

export default (function () {
  return function (
    container: Element,
    className: string,
    single?: boolean,
    options?: GetByClassOptions
  ): HTMLElement | HTMLElement[] | undefined {
    options = options || {}
    if ((options.test && options.test.getElementsByClassName) || (!options.test && document.getElementsByClassName)) {
      return getElementsByClassName(container, className, single || false)
    } else if ((options.test && options.test.querySelector) || (!options.test && document.querySelector)) {
      return querySelector(container, className, single || false)
    } else {
      return polyfill(container, className, single || false)
    }
  }
})()
