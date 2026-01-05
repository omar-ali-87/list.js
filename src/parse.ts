import type { List, ListItem, ValueName } from './types'

export default function createParse(list: List) {
  return function parse(): void {
    const Item = require('./item').default(list)

    const getChildren = function (parent: HTMLElement): HTMLElement[] {
      const nodes = parent.childNodes
      const items: HTMLElement[] = []
      for (let i = 0, il = nodes.length; i < il; i++) {
        // Only textnodes have a data attribute
        if ((nodes[i] as any).data === undefined) {
          items.push(nodes[i] as HTMLElement)
        }
      }
      return items
    }

    const parseItems = function (
      itemElements: HTMLElement[],
      valueNames: ValueName[]
    ): void {
      for (let i = 0, il = itemElements.length; i < il; i++) {
        const ItemClass = Item
        list.items.push(new ItemClass(valueNames, itemElements[i]))
      }
    }

    const parseAsync = function (
      itemElements: HTMLElement[],
      valueNames: ValueName[]
    ): void {
      const itemsToIndex = itemElements.splice(0, 50) // TODO: If < 100 items, what happens in IE etc?
      parseItems(itemsToIndex, valueNames)
      if (itemElements.length > 0) {
        setTimeout(() => {
          parseAsync(itemElements, valueNames)
        }, 1)
      } else {
        list.update()
        list.trigger('parseComplete')
      }
    }

    if (!list.handlers.parseComplete) {
      list.handlers.parseComplete = []
    }

    const itemsToIndex = getChildren(list.list)
    const valueNames = list.valueNames

    if ((list as any).indexAsync) {
      parseAsync(itemsToIndex, valueNames)
    } else {
      parseItems(itemsToIndex, valueNames)
    }
  }
}

