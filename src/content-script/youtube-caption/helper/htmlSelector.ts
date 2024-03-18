export const getElementById = (id: string): HTMLElement => {
  const shadowHost = document.getElementById('plasmo-inline-example-unique-id').shadowRoot
  return shadowHost.getElementById(id)
}
