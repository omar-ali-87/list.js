import type { List, ListItem, FilterFunction } from './types'

export default function createFilter(list: List) {
  // Add handlers
  if (!list.handlers.filterStart) {
    list.handlers.filterStart = []
  }
  if (!list.handlers.filterComplete) {
    list.handlers.filterComplete = []
  }

  return function filter(filterFunction?: FilterFunction): ListItem[] {
    list.trigger('filterStart')
    list.i = 1 // Reset paging
    list.reset.filter()

    if (filterFunction === undefined) {
      list.filtered = false
    } else {
      list.filtered = true
      const is = list.items
      for (let i = 0, il = is.length; i < il; i++) {
        const item = is[i]
        if (filterFunction(item)) {
          item.filtered = true
        } else {
          item.filtered = false
        }
      }
    }

    list.update()
    list.trigger('filterComplete')
    return list.visibleItems
  }
}
