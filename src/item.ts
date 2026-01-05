import type { ListItem, ListItemValues, List } from './types'

export default function createItem(list: List) {
  return class Item implements ListItem {
    _values: ListItemValues = {}
    found = false // Show if list.searched == true and this.found == true
    filtered = false // Show if list.filtered == true and this.filtered == true
    elm?: HTMLElement

    constructor(initValues?: ListItemValues, element?: HTMLElement, notCreate?: boolean) {
      this.init(initValues, element, notCreate)
    }

    init(initValues?: ListItemValues, element?: HTMLElement, notCreate?: boolean): void {
      if (element === undefined) {
        if (notCreate) {
          this.values(initValues, notCreate)
        } else {
          this.values(initValues)
        }
      } else {
        this.elm = element
        const values = (list as any).templater.get(this, initValues)
        this.values(values)
      }
    }

    values(newValues?: ListItemValues, notCreate?: boolean): ListItemValues | void {
      if (newValues !== undefined) {
        for (const name in newValues) {
          if (Object.prototype.hasOwnProperty.call(newValues, name)) {
            this._values[name] = newValues[name]
          }
        }
        if (notCreate !== true) {
          ;(list as any).templater.set(this, this.values())
        }
      } else {
        return this._values
      }
    }

    show(): void {
      ;(list as any).templater.show(this)
    }

    hide(): void {
      ;(list as any).templater.hide(this)
    }

    matching(): boolean {
      return (
        (list.filtered && list.searched && this.found && this.filtered) ||
        (list.filtered && !list.searched && this.filtered) ||
        (!list.filtered && list.searched && this.found) ||
        (!list.filtered && !list.searched)
      )
    }

    visible(): boolean {
      return !!(this.elm && this.elm.parentNode === (list as any).list)
    }
  }
}
