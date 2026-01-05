import type { List, ListItem, ListItemValues, CustomSearchFunction } from './types'
import * as events from './utils/events'

export default function createSearch(list: List) {
  let columns: string[] | undefined
  let searchString = ''
  let customSearch: CustomSearchFunction | undefined

  const prepare = {
    resetList(): void {
      list.i = 1
      ;(list as any).templater.clear()
      customSearch = undefined
    },
    setOptions(args: IArguments): void {
      if (args.length === 2 && args[1] instanceof Array) {
        columns = args[1] as string[]
      } else if (args.length === 2 && typeof args[1] === 'function') {
        columns = undefined
        customSearch = args[1] as CustomSearchFunction
      } else if (args.length === 3) {
        columns = args[1] as string[]
        customSearch = args[2] as CustomSearchFunction
      } else {
        columns = undefined
      }
    },
    setColumns(): void {
      if (list.items.length === 0) return
      if (columns === undefined) {
        const firstItemValues = list.items[0].values() as ListItemValues
        columns =
          list.searchColumns === undefined
            ? prepare.toArray(firstItemValues)
            : list.searchColumns
      }
    },
    setSearchString(s: any): void {
      s = list.utils.toString(s).toLowerCase()
      s = s.replace(/[-[\]{}()*+?.,\\^$|#]/g, '\\$&') // Escape regular expression characters
      searchString = s
    },
    toArray(values: ListItemValues): string[] {
      const tmpColumn: string[] = []
      for (const name in values) {
        if (Object.prototype.hasOwnProperty.call(values, name)) {
          tmpColumn.push(name)
        }
      }
      return tmpColumn
    },
  }

  const search = {
    list(): void {
      // Extract quoted phrases "word1 word2" from original searchString
      // searchString is converted to lowercase by List.js
      const words: string[] = []
      let ss = searchString
      let phrase: RegExpMatchArray | null

      while ((phrase = ss.match(/"([^"]+)"/)) !== null) {
        words.push(phrase[1])
        ss =
          ss.substring(0, phrase.index!) +
          ss.substring(phrase.index! + phrase[0].length)
      }

      // Get remaining space-separated words (if any)
      ss = ss.trim()
      if (ss.length) words.push(...ss.split(/\s+/))

      for (let k = 0, kl = list.items.length; k < kl; k++) {
        const item = list.items[k]
        item.found = false
        if (!words.length) continue

        let wordFound = false
        for (let i = 0, il = words.length; i < il; i++) {
          wordFound = false
          if (!columns) break

          for (let j = 0, jl = columns.length; j < jl; j++) {
            const values = item.values() as ListItemValues
            const column = columns[j]
            if (
              Object.prototype.hasOwnProperty.call(values, column) &&
              values[column] !== undefined &&
              values[column] !== null
            ) {
              const text =
                typeof values[column] !== 'string'
                  ? values[column].toString()
                  : values[column]
              if (text.toLowerCase().indexOf(words[i]) !== -1) {
                // word found, so no need to check it against any other columns
                wordFound = true
                break
              }
            }
          }
          // this word not found? no need to check any other words, the item cannot match
          if (!wordFound) break
        }
        item.found = wordFound
      }
    },
    reset(): void {
      list.reset.search()
      list.searched = false
    },
  }

  const searchMethod = function (
    str: string,
    cols?: string[] | CustomSearchFunction,
    searchFn?: CustomSearchFunction
  ): ListItem[] {
    list.trigger('searchStart')

    prepare.resetList()
    prepare.setSearchString(str)

    // Handle arguments
    if (cols && typeof cols === 'function') {
      customSearch = cols
      columns = undefined
    } else if (cols && Array.isArray(cols)) {
      columns = cols
      customSearch = searchFn
    } else {
      columns = undefined
      customSearch = undefined
    }

    prepare.setColumns()

    if (searchString === '') {
      search.reset()
    } else {
      list.searched = true
      if (customSearch) {
        customSearch(searchString, columns)
      } else {
        search.list()
      }
    }

    list.update()
    list.trigger('searchComplete')
    return list.visibleItems
  }

  if (!list.handlers.searchStart) {
    list.handlers.searchStart = []
  }
  if (!list.handlers.searchComplete) {
    list.handlers.searchComplete = []
  }

  const searchElements = list.utils.getByClass(
    list.listContainer,
    list.searchClass
  ) as HTMLElement | HTMLElement[] | undefined

  if (searchElements) {
    events.bind(
      searchElements,
      'keyup',
      events.debounce(function (e: Event) {
        const target = (e.target || (e as any).srcElement) as HTMLInputElement
        const alreadyCleared = target.value === '' && !list.searched
        if (!alreadyCleared) {
          // If oninput already have resetted the list, do nothing
          searchMethod(target.value)
        }
      }, list.searchDelay)
    )

    // Used to detect click on HTML5 clear button
    events.bind(searchElements, 'input', function (e: Event) {
      const target = (e.target || (e as any).srcElement) as HTMLInputElement
      if (target.value === '') {
        searchMethod('')
      }
    })
  }

  return searchMethod
}

