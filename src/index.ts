import naturalSort from 'string-natural-compare'
import getByClass from './utils/get-by-class'
import extend from './utils/extend'
import indexOf from './utils/index-of'
import * as events from './utils/events'
import toString from './utils/to-string'
import classes from './utils/classes'
import getAttribute from './utils/get-attribute'
import toArray from './utils/to-array'
import type {
  ListOptions,
  ListItem,
  ListItemValues,
  ValueName,
  EventHandler,
  FilterFunction,
  CustomSearchFunction,
} from './types'

// Dynamic imports for modules that will be converted
let createItem: any
let createAddAsync: any
let createPagination: any
let createParse: any
let createTemplater: any
let createSearch: any
let createFilter: any
let createSort: any
let createFuzzySearch: any

export default class List {
  listClass = 'list'
  searchClass = 'search'
  sortClass = 'sort'
  page = 10000
  i = 1
  items: ListItem[] = []
  visibleItems: ListItem[] = []
  matchingItems: ListItem[] = []
  searched = false
  filtered = false
  searchColumns?: string[]
  searchDelay = 0
  handlers: { [eventName: string]: EventHandler[] } = { updated: [] }
  valueNames: ValueName[] = []
  listContainer!: HTMLElement
  list!: HTMLElement

  // Module functions (will be typed properly after conversion)
  parse: any
  templater: any
  search: any
  filter: any
  sort: any
  fuzzySearch: any

  utils = {
    getByClass,
    extend,
    indexOf,
    events,
    toString,
    naturalSort,
    classes,
    getAttribute,
    toArray,
  }

  reset = {
    filter: (): List => {
      const is = this.items
      let il = is.length
      while (il--) {
        is[il].filtered = false
      }
      return this
    },
    search: (): List => {
      const is = this.items
      let il = is.length
      while (il--) {
        is[il].found = false
      }
      return this
    },
  }

  constructor(
    id: string | HTMLElement,
    options: ListOptions = {},
    values?: ListItemValues | ListItemValues[]
  ) {
    // Lazy load modules to avoid circular dependencies
    if (!createItem) {
      createItem = require('./item').default
    }
    if (!createAddAsync) {
      createAddAsync = require('./add-async').default
    }
    if (!createPagination) {
      createPagination = require('./pagination').default
    }
    if (!createParse) {
      createParse = require('./parse').default
    }
    if (!createTemplater) {
      createTemplater = require('./templater').default
    }
    if (!createSearch) {
      createSearch = require('./search').default
    }
    if (!createFilter) {
      createFilter = require('./filter').default
    }
    if (!createSort) {
      createSort = require('./sort').default
    }
    if (!createFuzzySearch) {
      createFuzzySearch = require('./fuzzy-search').default
    }

    this.init(id, options, values)
  }

  private init(
    id: string | HTMLElement,
    options: ListOptions,
    values?: ListItemValues | ListItemValues[]
  ): void {
    // Extend this instance with options
    this.utils.extend(this, options)

    // Get container element
    this.listContainer =
      typeof id === 'string' ? document.getElementById(id)! : id
    if (!this.listContainer) {
      return
    }

    // Get list element
    const listEl = getByClass(this.listContainer, this.listClass, true)
    if (!listEl) {
      return
    }
    this.list = listEl as HTMLElement

    // Initialize modules
    const Item = createItem(this)
    const addAsync = createAddAsync(this)
    const initPagination = createPagination(this)

    this.parse = createParse(this)
    this.templater = createTemplater(this)
    this.search = createSearch(this)
    this.filter = createFilter(this)
    this.sort = createSort(this)
    this.fuzzySearch = createFuzzySearch(this, options.fuzzySearch)

    // Set up handlers
    this.setupHandlers(options)

    // Parse existing items
    this.parseItems()

    // Set up pagination
    this.setupPagination(options, initPagination)

    // Add initial values if provided
    if (values !== undefined) {
      this.add(values)
    }

    this.update()
  }

  private setupHandlers(options: ListOptions): void {
    for (const handler in this.handlers) {
      if (
        (options as any)[handler] &&
        Object.prototype.hasOwnProperty.call(this.handlers, handler)
      ) {
        this.on(handler, (options as any)[handler])
      }
    }
  }

  private parseItems(): void {
    this.parse(this.list)
  }

  private setupPagination(options: ListOptions, initPagination: any): void {
    if (options.pagination !== undefined) {
      let pagination = options.pagination
      if (pagination === true) {
        pagination = [{}]
      }
      if (!Array.isArray(pagination) || pagination[0] === undefined) {
        pagination = [pagination as any]
      }
      for (let i = 0, il = (pagination as any[]).length; i < il; i++) {
        initPagination((pagination as any[])[i])
      }
    }
  }

  /**
   * Re-parse the List, use if html have changed
   */
  reIndex(): void {
    this.items = []
    this.visibleItems = []
    this.matchingItems = []
    this.searched = false
    this.filtered = false
    this.parse(this.list)
  }

  /**
   * Convert list to JSON
   */
  toJSON(): ListItemValues[] {
    const json: ListItemValues[] = []
    for (let i = 0, il = this.items.length; i < il; i++) {
      json.push(this.items[i].values() as ListItemValues)
    }
    return json
  }

  /**
   * Add object to list
   */
  add(
    values: ListItemValues | ListItemValues[],
    callback?: (items: ListItem[]) => void
  ): ListItem[] | void {
    const valuesArray = Array.isArray(values) ? values : [values]

    if (valuesArray.length === 0) {
      return
    }

    if (callback) {
      const addAsync = require('./add-async').default(this)
      addAsync(valuesArray.slice(0), callback)
      return
    }

    const Item = require('./item').default(this)
    const added: ListItem[] = []
    const notCreate = this.items.length > this.page

    for (let i = 0, il = valuesArray.length; i < il; i++) {
      const item = new Item(valuesArray[i], undefined, notCreate)
      this.items.push(item)
      added.push(item)
    }

    this.update()
    return added
  }

  /**
   * Show items starting at index i with page size
   */
  show(i: number, page: number): List {
    this.i = i
    this.page = page
    this.update()
    return this
  }

  /**
   * Removes object from list.
   * Loops through the list and removes objects where
   * property "valuename" === value
   */
  remove(valueName: string, value: any, options?: any): number {
    let found = 0
    for (let i = 0, il = this.items.length; i < il; i++) {
      const itemValues = this.items[i].values() as ListItemValues
      if (itemValues[valueName] == value) {
        this.templater.remove(this.items[i], options)
        this.items.splice(i, 1)
        il--
        i--
        found++
      }
    }
    this.update()
    return found
  }

  /**
   * Gets the objects in the list which
   * property "valueName" === value
   */
  get(valueName: string, value: any): ListItem[] {
    const matchedItems: ListItem[] = []
    for (let i = 0, il = this.items.length; i < il; i++) {
      const item = this.items[i]
      const itemValues = item.values() as ListItemValues
      if (itemValues[valueName] == value) {
        matchedItems.push(item)
      }
    }
    return matchedItems
  }

  /**
   * Get size of the list
   */
  size(): number {
    return this.items.length
  }

  /**
   * Removes all items from the list
   */
  clear(): List {
    this.templater.clear()
    this.items = []
    return this
  }

  /**
   * Register an event handler
   */
  on(event: string, callback: EventHandler): List {
    if (!this.handlers[event]) {
      this.handlers[event] = []
    }
    this.handlers[event].push(callback)
    return this
  }

  /**
   * Unregister an event handler
   */
  off(event: string, callback: EventHandler): List {
    const e = this.handlers[event]
    if (!e) return this
    const idx = indexOf(e, callback)
    if (idx > -1) {
      e.splice(idx, 1)
    }
    return this
  }

  /**
   * Trigger an event
   */
  trigger(event: string): List {
    const handlers = this.handlers[event]
    if (!handlers) return this
    let i = handlers.length
    while (i--) {
      handlers[i](this)
    }
    return this
  }

  /**
   * Update the list display
   */
  update(): List {
    const is = this.items
    const il = is.length

    this.visibleItems = []
    this.matchingItems = []
    this.templater.clear()

    for (let i = 0; i < il; i++) {
      if (
        is[i].matching() &&
        this.matchingItems.length + 1 >= this.i &&
        this.visibleItems.length < this.page
      ) {
        is[i].show()
        this.visibleItems.push(is[i])
        this.matchingItems.push(is[i])
      } else if (is[i].matching()) {
        this.matchingItems.push(is[i])
        is[i].hide()
      } else {
        is[i].hide()
      }
    }

    this.trigger('updated')
    return this
  }
}

// Export types
export type { ListOptions, ListItem, ListItemValues, ValueName } from './types'

