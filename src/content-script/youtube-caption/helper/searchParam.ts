export function getSearchParam(str: string | null): Record<string, string> {
  const searchParam = str && str !== '' ? str : window.location.search

  if (!/\?([a-zA-Z0-9_]+)/i.exec(searchParam)) return {}

  const pl = /\+/g, // Regex for replacing addition symbol with a space
    search = /([^?&=]+)=?([^&]*)/g,
    decode = function (s: string) {
      return decodeURIComponent(s.replace(pl, ' '))
    },
    index = /\?([a-zA-Z0-9_]+)/i.exec(searchParam)?.index ?? 0 + 1,
    query = searchParam.substring(index)

  const urlParams: Record<string, string> = {}
  const matches = Array.from(query.matchAll(search)) // Convert to array

  for (const match of matches) {
    urlParams[decode(match[1])] = decode(match[2])
  }

  return urlParams
}
