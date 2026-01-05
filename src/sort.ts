import type { List, ListItem } from './types'
import * as events from './utils/events'

interface SortOptions {
  valueName: string
  order?: 'asc' | 'desc'
  insensitive?: boolean
  alphabet?: string
  sortFunction?: (itemA: ListItem, itemB: ListItem, options: SortOptions) => number
}

export default function createSort(list: List) {
  const buttons = {
    els: undefined as HTMLElement[] | undefined,
    clear(): void {
      if (!buttons.els) return
      for (let i = 0, il = buttons.els.length; i < il; i++) {
        list.utils.classes(buttons.els[i]).remove('asc')
        list.utils.classes(buttons.els[i]).remove('desc')
      }
    },
    getOrder(btn: HTMLElement): 'asc' | 'desc' {
      const predefinedOrder = list.utils.getAttribute(btn, 'data-order')
      if (predefinedOrder === 'asc' || predefinedOrder === 'desc') {
        return predefinedOrder as 'asc' | 'desc'
      } else if (list.utils.classes(btn).has('desc')) {
        return 'asc'
      } else if (list.utils.classes(btn).has('asc')) {
        return 'desc'
      } else {
        return 'asc'
      }
    },
    getInSensitive(btn: HTMLElement, options: SortOptions): void {
      const insensitive = list.utils.getAttribute(btn, 'data-insensitive')
      if (insensitive === 'false') {
        options.insensitive = false
      } else {
        options.insensitive = true
      }
    },
    setOrder(options: SortOptions): void {
      if (!buttons.els) return
      for (let i = 0, il = buttons.els.length; i < il; i++) {
        const btn = buttons.els[i]
        if (list.utils.getAttribute(btn, 'data-sort') !== options.valueName) {
          continue
        }
        const predefinedOrder = list.utils.getAttribute(btn, 'data-order')
        if (predefinedOrder === 'asc' || predefinedOrder === 'desc') {
          if (predefinedOrder === options.order) {
            list.utils.classes(btn).add(options.order!)
          }
        } else {
          list.utils.classes(btn).add(options.order!)
        }
      }
    },
  }

  const sort = function (
    valueNameOrEvent: string | Event,
    options?: SortOptions
  ): ListItem[] {
    list.trigger('sortStart')
    let sortOptions: SortOptions = {} as SortOptions

    const target =
      (valueNameOrEvent as Event).currentTarget ||
      (valueNameOrEvent as any).srcElement ||
      undefined

    if (target) {
      sortOptions.valueName = list.utils.getAttribute(
        target as HTMLElement,
        'data-sort'
      )!
      buttons.getInSensitive(target as HTMLElement, sortOptions)
      sortOptions.order = buttons.getOrder(target as HTMLElement)
    } else {
      sortOptions = options || sortOptions
      sortOptions.valueName = valueNameOrEvent as string
      sortOptions.order = sortOptions.order || 'asc'
      sortOptions.insensitive =
        typeof sortOptions.insensitive === 'undefined'
          ? true
          : sortOptions.insensitive
    }

    buttons.clear()
    buttons.setOrder(sortOptions)

    // caseInsensitive
    // alphabet
    const customSortFunction =
      sortOptions.sortFunction || (list as any).sortFunction || null
    const multi = sortOptions.order === 'desc' ? -1 : 1
    let sortFunction: (a: ListItem, b: ListItem) => number

    if (customSortFunction) {
      sortFunction = function (itemA: ListItem, itemB: ListItem) {
        return customSortFunction(itemA, itemB, sortOptions) * multi
      }
    } else {
      sortFunction = function (itemA: ListItem, itemB: ListItem) {
        let sort = list.utils.naturalSort as any
        sort.alphabet = (list as any).alphabet || sortOptions.alphabet || undefined
        if (!sort.alphabet && sortOptions.insensitive) {
          sort = list.utils.naturalSort.caseInsensitive
        }
        const itemAValues = itemA.values() as any
        const itemBValues = itemB.values() as any
        return (
          sort(itemAValues[sortOptions.valueName], itemBValues[sortOptions.valueName]) *
          multi
        )
      }
    }

    list.items.sort(sortFunction)
    list.update()
    list.trigger('sortComplete')
    return list.visibleItems
  }

  // Add handlers
  if (!list.handlers.sortStart) {
    list.handlers.sortStart = []
  }
  if (!list.handlers.sortComplete) {
    list.handlers.sortComplete = []
  }

  const sortElements = list.utils.getByClass(
    list.listContainer,
    list.sortClass
  ) as HTMLElement | HTMLElement[] | undefined

  if (sortElements) {
    buttons.els = Array.isArray(sortElements)
      ? sortElements
      : [sortElements]
    events.bind(sortElements, 'click', sort as any)
  }

  list.on('searchStart', buttons.clear)
  list.on('filterStart', buttons.clear)

  return sort
}

