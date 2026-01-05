export default function toString(s: any): string {
  s = s === undefined ? '' : s
  s = s === null ? '' : s
  s = s.toString()
  return s
}

