import type { List, FuzzySearchOptions, ListItemValues } from './types'
import classes from './utils/classes'
import * as events from './utils/events'
import extend from './utils/extend'
import toString from './utils/to-string'
import getByClass from './utils/get-by-class'
import fuzzy from './utils/fuzzy'

export default function createFuzzySearch(
  list: List,
  options?: FuzzySearchOptions
) {
  const fuzzyOptions = extend(
    {
      location: 0,
      distance: 100,
      threshold: 0.4,
      multiSearch: true,
      searchClass: 'fuzzy-search',
    },
    options || {}
  ) as Required<FuzzySearchOptions> & { searchClass: string }

  const fuzzySearch = {
    search(searchString: string, columns?: string[]): void {
      // Subtract arguments from the searchString or put searchString as only argument
      const searchArguments = fuzzyOptions.multiSearch
        ? searchString.replace(/ +$/, '').split(/ +/)
        : [searchString]

      for (let k = 0, kl = list.items.length; k < kl; k++) {
        fuzzySearch.item(list.items[k], columns || [], searchArguments)
      }
    },
    item(
      item: any,
      columns: string[],
      searchArguments: string[]
    ): void {
      let found = true
      for (let i = 0; i < searchArguments.length; i++) {
        let foundArgument = false
        for (let j = 0, jl = columns.length; j < jl; j++) {
          if (
            fuzzySearch.values(
              item.values() as ListItemValues,
              columns[j],
              searchArguments[i]
            )
          ) {
            foundArgument = true
          }
        }
        if (!foundArgument) {
          found = false
        }
      }
      item.found = found
    },
    values(
      values: ListItemValues,
      value: string,
      searchArgument: string
    ): boolean {
      if (Object.prototype.hasOwnProperty.call(values, value)) {
        const text = toString(values[value]).toLowerCase()

        if (fuzzy(text, searchArgument, fuzzyOptions)) {
          return true
        }
      }
      return false
    },
  }

  const searchElements = getByClass(
    list.listContainer,
    fuzzyOptions.searchClass
  ) as HTMLElement | HTMLElement[] | undefined

  if (searchElements) {
    events.bind(
      searchElements,
      'keyup',
      events.debounce(function (e: Event) {
        const target = (e.target || (e as any).srcElement) as HTMLInputElement
        ;(list as any).search(target.value, fuzzySearch.search)
      }, list.searchDelay)
    )
  }

  return function (str: string, columns?: string[]): any {
    ;(list as any).search(str, columns, fuzzySearch.search)
  }
}

