export function setNestedLocalStorage<T>({
  mainKey,
  subKey,
  value,
}: {
  mainKey: string
  subKey: string
  value: T
}): void {
  const storageDataStr = localStorage.getItem(mainKey)

  const storageData = storageDataStr ? JSON.parse(storageDataStr) : {}
  storageData[subKey] = value

  localStorage.setItem(mainKey, JSON.stringify(storageData))
}

export function getNestedLocalStorage<T>({ mainKey, subKey }: { mainKey: string; subKey: string }) {
  const storageData = localStorage.getItem(mainKey)

  if (!storageData) {
    return null // If main key does not exist, return null
  }

  const parsedData = JSON.parse(storageData)

  return parsedData[subKey] as T // Return the value associated with the subkey
}
