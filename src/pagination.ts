import type { List, PaginationOptions } from './types'
import classes from './utils/classes'
import * as events from './utils/events'
import ListClass from './index'

export default function createPagination(list: List) {
  let isHidden = false

  const refresh = function (
    pagingList: ListClass,
    options: PaginationOptions
  ): void {
    if (list.page < 1) {
      list.listContainer.style.display = 'none'
      isHidden = true
      return
    } else if (isHidden) {
      list.listContainer.style.display = 'block'
    }

    const l = list.matchingItems.length
    const index = list.i
    const page = list.page
    const pages = Math.ceil(l / page)
    const currentPage = Math.ceil(index / page)
    const innerWindow = options.innerWindow || 2
    const left = options.left || options.outerWindow || 0
    const right = options.right || options.outerWindow || 0

    const rightBound = pages - right
    pagingList.clear()

    for (let i = 1; i <= pages; i++) {
      const className = currentPage === i ? 'active' : ''

      if (is.number(i, left, rightBound, currentPage, innerWindow)) {
        const item = pagingList.add({
          page: i,
          dotted: false,
        })[0]
        if (className) {
          classes(item.elm!).add(className)
        }
        if (item.elm && item.elm.firstChild) {
          ;(item.elm.firstChild as HTMLElement).setAttribute('data-i', String(i))
          ;(item.elm.firstChild as HTMLElement).setAttribute(
            'data-page',
            String(page)
          )
        }
      } else if (
        is.dotted(
          pagingList,
          i,
          left,
          rightBound,
          currentPage,
          innerWindow,
          pagingList.size()
        )
      ) {
        const item = pagingList.add({
          page: '...',
          dotted: true,
        })[0]
        classes(item.elm!).add('disabled')
      }
    }
  }

  const is = {
    number(
      i: number,
      left: number,
      right: number,
      currentPage: number,
      innerWindow: number
    ): boolean {
      return (
        this.left(i, left) ||
        this.right(i, right) ||
        this.innerWindow(i, currentPage, innerWindow)
      )
    },
    left(i: number, left: number): boolean {
      return i <= left
    },
    right(i: number, right: number): boolean {
      return i > right
    },
    innerWindow(i: number, currentPage: number, innerWindow: number): boolean {
      return i >= currentPage - innerWindow && i <= currentPage + innerWindow
    },
    dotted(
      pagingList: ListClass,
      i: number,
      left: number,
      right: number,
      currentPage: number,
      innerWindow: number,
      currentPageItem: number
    ): boolean {
      return (
        this.dottedLeft(pagingList, i, left, right, currentPage, innerWindow) ||
        this.dottedRight(
          pagingList,
          i,
          left,
          right,
          currentPage,
          innerWindow,
          currentPageItem
        )
      )
    },
    dottedLeft(
      pagingList: ListClass,
      i: number,
      left: number,
      right: number,
      currentPage: number,
      innerWindow: number
    ): boolean {
      return (
        i === left + 1 &&
        !this.innerWindow(i, currentPage, innerWindow) &&
        !this.right(i, right)
      )
    },
    dottedRight(
      pagingList: ListClass,
      i: number,
      left: number,
      right: number,
      currentPage: number,
      innerWindow: number,
      currentPageItem: number
    ): boolean {
      const lastItem = pagingList.items[currentPageItem - 1]
      if (lastItem && (lastItem.values() as any).dotted) {
        return false
      } else {
        return (
          i === right &&
          !this.innerWindow(i, currentPage, innerWindow) &&
          !this.right(i, right)
        )
      }
    },
  }

  return function (options: PaginationOptions): void {
    const pagingList = new ListClass(list.listContainer.id, {
      listClass: (options as any).paginationClass || 'pagination',
      item:
        (options as any).item ||
        "<li><a class='page' href='#'></a></li>",
      valueNames: ['page', 'dotted'],
      searchClass: 'pagination-search-that-is-not-supposed-to-exist',
      sortClass: 'pagination-sort-that-is-not-supposed-to-exist',
    })

    events.bind(pagingList.listContainer, 'click', function (e: Event) {
      const target = (e.target || (e as any).srcElement) as HTMLElement
      const page = list.utils.getAttribute(target, 'data-page')
      const i = list.utils.getAttribute(target, 'data-i')
      if (i) {
        list.show((parseInt(i, 10) - 1) * parseInt(page || '1', 10) + 1, parseInt(page || '1', 10))
      }
    })

    list.on('updated', function () {
      refresh(pagingList, options)
    })
    refresh(pagingList, options)
  }
}

