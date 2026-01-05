import type { List, ListItem, ListItemValues } from './types'

export default function createAddAsync(list: List) {
  return function addAsync(
    values: ListItemValues[],
    callback: (items: ListItem[]) => void,
    items: ListItem[] = []
  ): void {
    const valuesToAdd = values.splice(0, 50)
    const newItems = (list.add(valuesToAdd) as ListItem[]) || []
    const allItems = items.concat(newItems)

    if (values.length > 0) {
      setTimeout(() => {
        addAsync(values, callback, allItems)
      }, 1)
    } else {
      list.update()
      callback(allItems)
    }
  }
}
