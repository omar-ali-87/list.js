import type { List, ListItem, ListItemValues, ValueName, ItemTemplate } from './types'
import getByClass from './utils/get-by-class'
import getAttribute from './utils/get-attribute'

class Templater {
  private list: List
  private createItem: ((values: ListItemValues) => HTMLElement) | null = null

  constructor(list: List) {
    this.list = list
    this.init()
  }

  private init(): void {
    let itemSource: HTMLElement | null = null

    if (typeof (this.list as any).item === 'function') {
      this.createItem = (values: ListItemValues) => {
        const item = (this.list as any).item(values) as string
        return this.getItemSource(item)!
      }
      return
    }

    if (typeof (this.list as any).item === 'string') {
      const itemTemplate = (this.list as any).item as string
      if (itemTemplate.indexOf('<') === -1) {
        itemSource = document.getElementById(itemTemplate)
      } else {
        itemSource = this.getItemSource(itemTemplate)
      }
    } else {
      /* If item source does not exists, use the first item in list as
      source for new items */
      itemSource = this.getFirstListItem()
    }

    if (!itemSource) {
      throw new Error(
        "The list needs to have at least one item on init otherwise you'll have to add a template."
      )
    }

    itemSource = this.createCleanTemplateItem(itemSource, this.list.valueNames)

    this.createItem = () => {
      return itemSource!.cloneNode(true) as HTMLElement
    }
  }

  private createCleanTemplateItem(
    templateNode: HTMLElement,
    valueNames: ValueName[]
  ): HTMLElement {
    const el = templateNode.cloneNode(true) as HTMLElement
    el.removeAttribute('id')

    for (let i = 0, il = valueNames.length; i < il; i++) {
      let elm: HTMLElement | undefined
      const valueName = valueNames[i]

      if (typeof valueName === 'object' && 'data' in valueName) {
        for (let j = 0, jl = valueName.data.length; j < jl; j++) {
          el.setAttribute('data-' + valueName.data[j], '')
        }
      } else if (
        typeof valueName === 'object' &&
        'attr' in valueName &&
        'name' in valueName
      ) {
        elm = getByClass(el, valueName.name, true) as HTMLElement | undefined
        if (elm) {
          elm.setAttribute(valueName.attr, '')
        }
      } else {
        const className = typeof valueName === 'string' ? valueName : (valueName as { name: string }).name
        elm = getByClass(el, className, true) as HTMLElement | undefined
        if (elm) {
          elm.innerHTML = ''
        }
      }
    }
    return el
  }

  private getFirstListItem(): HTMLElement | null {
    const nodes = this.list.list.childNodes

    for (let i = 0, il = nodes.length; i < il; i++) {
      // Only textnodes have a data attribute
      if ((nodes[i] as any).data === undefined) {
        return nodes[i].cloneNode(true) as HTMLElement
      }
    }
    return null
  }

  private getItemSource(itemHTML: string): HTMLElement | null {
    if (typeof itemHTML !== 'string') return null
    if (/<tr[\s>]/g.exec(itemHTML)) {
      const tbody = document.createElement('tbody')
      tbody.innerHTML = itemHTML
      return (tbody.firstElementChild as HTMLElement) || null
    } else if (itemHTML.indexOf('<') !== -1) {
      const div = document.createElement('div')
      div.innerHTML = itemHTML
      return (div.firstElementChild as HTMLElement) || null
    }
    return null
  }

  private getValueName(name: string): ValueName | string | undefined {
    for (let i = 0, il = this.list.valueNames.length; i < il; i++) {
      const valueName = this.list.valueNames[i]
      if (typeof valueName === 'object' && 'data' in valueName) {
        const data = valueName.data
        for (let j = 0, jl = data.length; j < jl; j++) {
          if (data[j] === name) {
            return { data: name }
          }
        }
      } else if (
        typeof valueName === 'object' &&
        'attr' in valueName &&
        'name' in valueName &&
        valueName.name === name
      ) {
        return valueName
      } else if (valueName === name) {
        return name
      }
    }
    return undefined
  }

  private setValue(item: ListItem, name: string, value: any): void {
    if (!item.elm) return

    let elm: HTMLElement | undefined
    const valueName = this.getValueName(name)
    if (!valueName) return

    if (typeof valueName === 'object' && 'data' in valueName) {
      item.elm.setAttribute('data-' + valueName.data, String(value))
    } else if (
      typeof valueName === 'object' &&
      'attr' in valueName &&
      'name' in valueName
    ) {
      elm = getByClass(item.elm, valueName.name, true) as HTMLElement | undefined
      if (elm) {
        elm.setAttribute(valueName.attr, String(value))
      }
    } else {
        const className = typeof valueName === 'string' ? valueName : (valueName as { name: string }).name
        elm = getByClass(item.elm, className, true) as HTMLElement | undefined
        if (elm) {
          elm.innerHTML = String(value)
        }
    }
  }

  get(item: ListItem, valueNames: ValueName[]): ListItemValues {
    this.create(item)
    const values: ListItemValues = {}
    if (!item.elm) return values

    for (let i = 0, il = valueNames.length; i < il; i++) {
      let elm: HTMLElement | undefined
      const valueName = valueNames[i]

      if (typeof valueName === 'object' && 'data' in valueName) {
        for (let j = 0, jl = valueName.data.length; j < jl; j++) {
          values[valueName.data[j]] = getAttribute(
            item.elm,
            'data-' + valueName.data[j]
          )
        }
      } else if (
        typeof valueName === 'object' &&
        'attr' in valueName &&
        'name' in valueName
      ) {
        elm = getByClass(item.elm, valueName.name, true) as HTMLElement | undefined
        values[valueName.name] = elm
          ? getAttribute(elm, valueName.attr)
          : ''
      } else {
        const className = typeof valueName === 'string' ? valueName : (valueName as { name: string }).name
        elm = getByClass(item.elm, className, true) as HTMLElement | undefined
        values[className] = elm ? elm.innerHTML : ''
      }
    }
    return values
  }

  set(item: ListItem, values: ListItemValues): void {
    if (!this.create(item)) {
      for (const v in values) {
        if (Object.prototype.hasOwnProperty.call(values, v)) {
          this.setValue(item, v, values[v])
        }
      }
    }
  }

  create(item: ListItem): boolean {
    if (item.elm !== undefined) {
      return false
    }
    if (!this.createItem) {
      throw new Error('Template not initialized')
    }
    item.elm = this.createItem(item.values() as ListItemValues)
    this.set(item, item.values() as ListItemValues)
    return true
  }

  remove(item: ListItem, _options?: any): void {
    if (item.elm && item.elm.parentNode === this.list.list) {
      this.list.list.removeChild(item.elm)
    }
  }

  show(item: ListItem): void {
    this.create(item)
    if (item.elm) {
      this.list.list.appendChild(item.elm)
    }
  }

  hide(item: ListItem): void {
    if (item.elm !== undefined && item.elm.parentNode === this.list.list) {
      this.list.list.removeChild(item.elm)
    }
  }

  clear(): void {
    /* .innerHTML = ''; fucks up IE */
    if (this.list.list.hasChildNodes()) {
      while (this.list.list.childNodes.length >= 1) {
        this.list.list.removeChild(this.list.list.firstChild!)
      }
    }
  }
}

export default function createTemplater(list: List): Templater {
  return new Templater(list)
}

