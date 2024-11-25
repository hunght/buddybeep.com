import { uuid } from '~utils'

const isLocalStorageAvailable = () => {
  try {
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

export function setNestedLocalStorage<T>({
  mainKey,
  subKey,
  value,
}: {
  mainKey: string
  subKey: string
  value: T
}): void {
  if (!isLocalStorageAvailable()) return;
  
  const storageDataStr = window.localStorage.getItem(mainKey)

  const storageData = storageDataStr ? JSON.parse(storageDataStr) : {}
  storageData[subKey] = value

  window.localStorage.setItem(mainKey, JSON.stringify(storageData))
}

export function getNestedLocalStorage<T>({ mainKey, subKey }: { mainKey: string; subKey: string }) {
  if (!isLocalStorageAvailable()) return null;
  
  const storageData = window.localStorage.getItem(mainKey)

  if (!storageData) {
    return null // If main key does not exist, return null
  }

  const parsedData = JSON.parse(storageData)

  return parsedData[subKey] as T // Return the value associated with the subkey
}

export function getOrGenerateUserUUID(): string {
  if (!isLocalStorageAvailable()) return uuid();
  
  // Check if a UUID is already stored
  let userUUID = window.localStorage.getItem('userUUID')
  if (!userUUID) {
    // Generate a new UUID
    userUUID = uuid()
    // Store the UUID in localStorage
    window.localStorage.setItem('userUUID', userUUID)
  }
  return userUUID
}
