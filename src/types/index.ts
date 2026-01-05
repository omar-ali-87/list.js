/**
 * Type definitions for List.js
 */

/**
 * Value name configuration - can be a string or an object with specific attributes
 */
export type ValueName =
  | string
  | { name: string; attr: string }
  | { data: string[] }

/**
 * Template can be a string (HTML or element ID) or a function that returns HTML
 */
export type ItemTemplate = string | ((values: Record<string, any>) => string)

/**
 * Filter function that receives an item and returns whether it should be shown
 */
export type FilterFunction = (item: ListItem) => boolean

/**
 * Custom search function
 */
export type CustomSearchFunction = (
  searchString: string,
  columns?: string[]
) => void

/**
 * Pagination configuration options
 */
export interface PaginationOptions {
  innerWindow?: number
  outerWindow?: number
  left?: number
  right?: number
  item?: string | ((page: number) => string)
}

/**
 * Fuzzy search options
 */
export interface FuzzySearchOptions {
  distance?: number
  threshold?: number
  multiSearch?: boolean
  searchFunction?: (searchString: string, columns?: string[]) => void
}

/**
 * Event handler callback
 */
export type EventHandler = (list: List) => void

/**
 * List options configuration
 */
export interface ListOptions {
  /** Array of value names (class names) for the different values of each list item */
  valueNames?: ValueName[]
  /** ID to item template element, HTML string, or function that returns HTML */
  item?: ItemTemplate
  /** Class name of the list container, default: "list" */
  listClass?: string
  /** Class name of the search field, default: "search" */
  searchClass?: string
  /** Class name of the sort buttons, default: "sort" */
  sortClass?: string
  /** Number of items per page, default: 10000 */
  page?: number
  /** Pagination configuration */
  pagination?: boolean | PaginationOptions | PaginationOptions[]
  /** Array of column names to restrict searching to */
  searchColumns?: string[]
  /** Delay in milliseconds after last keypress before search starts, default: 0 */
  searchDelay?: number
  /** If true, index existing items asynchronously (good for large lists > 500 items) */
  indexAsync?: boolean
  /** Fuzzy search options */
  fuzzySearch?: FuzzySearchOptions
  /** Event handlers */
  updated?: EventHandler
  searchStart?: EventHandler
  searchComplete?: EventHandler
  filterStart?: EventHandler
  filterComplete?: EventHandler
  sortStart?: EventHandler
  sortComplete?: EventHandler
}

/**
 * List item values - a record of string keys to any values
 */
export interface ListItemValues {
  [key: string]: any
}

/**
 * List item interface
 */
export interface ListItem {
  /** Internal values storage */
  _values: ListItemValues
  /** Whether this item was found in search */
  found: boolean
  /** Whether this item passes the current filter */
  filtered: boolean
  /** The DOM element for this item */
  elm?: HTMLElement
  /** Get or set values for this item */
  values(newValues?: ListItemValues, notCreate?: boolean): ListItemValues | void
  /** Show this item */
  show(): void
  /** Hide this item */
  hide(): void
  /** Check if this item matches current search/filter criteria */
  matching(): boolean
  /** Check if this item is currently visible in the DOM */
  visible(): boolean
}

/**
 * Main List class interface
 */
export interface List {
  /** Class name of the list container */
  listClass: string
  /** Class name of the search field */
  searchClass: string
  /** Class name of the sort buttons */
  sortClass: string
  /** Number of items per page */
  page: number
  /** Current index */
  i: number
  /** All items in the list */
  items: ListItem[]
  /** Currently visible items */
  visibleItems: ListItem[]
  /** Items matching current search/filter */
  matchingItems: ListItem[]
  /** Whether a search is active */
  searched: boolean
  /** Whether a filter is active */
  filtered: boolean
  /** Columns to search in */
  searchColumns?: string[]
  /** Search delay in milliseconds */
  searchDelay: number
  /** Event handlers */
  handlers: {
    [eventName: string]: EventHandler[]
  }
  /** Value names configuration */
  valueNames: ValueName[]
  /** The list container element */
  listContainer: HTMLElement
  /** The list element */
  list: HTMLElement

  /** Re-parse the list (use if HTML has changed) */
  reIndex(): void
  /** Convert list to JSON */
  toJSON(): ListItemValues[]
  /** Add items to the list */
  add(
    values: ListItemValues | ListItemValues[],
    callback?: (items: ListItem[]) => void
  ): ListItem[] | void
  /** Show items starting at index i with page size */
  show(i: number, page: number): List
  /** Remove items from the list */
  remove(valueName: string, value: any, options?: any): number
  /** Get items matching criteria */
  get(valueName: string, value: any): ListItem[]
  /** Get the size of the list */
  size(): number
  /** Clear all items from the list */
  clear(): List
  /** Register an event handler */
  on(event: string, callback: EventHandler): List
  /** Unregister an event handler */
  off(event: string, callback: EventHandler): List
  /** Trigger an event */
  trigger(event: string): List
  /** Reset filters */
  reset: {
    filter(): List
    search(): List
  }
  /** Update the list display */
  update(): List
  /** Search the list */
  search(
    searchString: string,
    columns?: string[] | CustomSearchFunction,
    customSearch?: CustomSearchFunction
  ): ListItem[]
  /** Filter the list */
  filter(filterFunction?: FilterFunction): ListItem[]
  /** Sort the list */
  sort(sortName: string, options?: { order?: string }): ListItem[]
  /** Fuzzy search */
  fuzzySearch(searchString: string, columns?: string[]): ListItem[]
}

