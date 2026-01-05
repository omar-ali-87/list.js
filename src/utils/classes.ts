/**
 * Module dependencies.
 */

import indexOf from './index-of'

/**
 * Whitespace regexp.
 */

const re = /\s+/

/**
 * toString reference.
 */

const toString = Object.prototype.toString

/**
 * Wrap `el` in a `ClassList`.
 *
 * @param {Element} el
 * @return {ClassList}
 * @api public
 */

export default function (el: HTMLElement): ClassList {
  return new ClassList(el)
}

/**
 * Initialize a new ClassList for `el`.
 *
 * @param {Element} el
 * @api private
 */

class ClassList {
  el: HTMLElement
  list: DOMTokenList | null

  constructor(el: HTMLElement) {
    if (!el || !el.nodeType) {
      throw new Error('A DOM element reference is required')
    }
    this.el = el
    this.list = el.classList || null
  }

  /**
   * Add class `name` if not already present.
   *
   * @param {String} name
   * @return {ClassList}
   * @api public
   */

  add(name: string): ClassList {
    // classList
    if (this.list) {
      this.list.add(name)
      return this
    }

    // fallback
    const arr = this.array()
    const i = indexOf(arr, name)
    if (i === -1) arr.push(name)
    this.el.className = arr.join(' ')
    return this
  }

  /**
   * Remove class `name` when present, or
   * pass a regular expression to remove
   * any which match.
   *
   * @param {String|RegExp} name
   * @return {ClassList}
   * @api public
   */

  remove(name: string | RegExp): ClassList {
    // classList
    if (this.list && typeof name === 'string') {
      this.list.remove(name)
      return this
    }

    // fallback
    const arr = this.array()
    if (typeof name === 'string') {
      const i = indexOf(arr, name)
      if (i !== -1) arr.splice(i, 1)
    } else if (name instanceof RegExp) {
      for (let i = arr.length - 1; i >= 0; i--) {
        if (name.test(arr[i])) {
          arr.splice(i, 1)
        }
      }
    }
    this.el.className = arr.join(' ')
    return this
  }

  /**
   * Toggle class `name`, can force state via `force`.
   *
   * For browsers that support classList, but do not support `force` yet,
   * the mistake will be detected and corrected.
   *
   * @param {String} name
   * @param {Boolean} force
   * @return {ClassList}
   * @api public
   */

  toggle(name: string, force?: boolean): ClassList {
    // classList
    if (this.list) {
      if (typeof force !== 'undefined') {
        if (force !== this.list.toggle(name, force)) {
          this.list.toggle(name) // toggle again to correct
        }
      } else {
        this.list.toggle(name)
      }
      return this
    }

    // fallback
    if (typeof force !== 'undefined') {
      if (!force) {
        this.remove(name)
      } else {
        this.add(name)
      }
    } else {
      if (this.has(name)) {
        this.remove(name)
      } else {
        this.add(name)
      }
    }

    return this
  }

  /**
   * Return an array of classes.
   *
   * @return {Array}
   * @api public
   */

  array(): string[] {
    const className = this.el.getAttribute('class') || ''
    const str = className.replace(/^\s+|\s+$/g, '')
    const arr = str.split(re)
    if ('' === arr[0]) arr.shift()
    return arr
  }

  /**
   * Check if class `name` is present.
   *
   * @param {String} name
   * @return {Boolean}
   * @api public
   */

  has(name: string): boolean
  contains(name: string): boolean
  has(name: string): boolean {
    return this.list ? this.list.contains(name) : indexOf(this.array(), name) !== -1
  }
}

// Alias
ClassList.prototype.contains = ClassList.prototype.has

