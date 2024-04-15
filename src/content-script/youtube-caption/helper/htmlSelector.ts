export const getElementById = (id?: string): HTMLElement | null => {
  if (!id) return null
  const shadowHost = document.getElementById('plasmo-inline-example-unique-id')?.shadowRoot
  console.log(`==== shadowHost ===`)
  console.log(shadowHost)
  console.log('==== end log ===')

  return shadowHost?.getElementById(id) ?? null
}
