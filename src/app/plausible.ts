export function trackEvent(name: string, props?: { [propName: string]: string | number | boolean | undefined }) {
  try {
    console.log('plausible.trackEvent', name, props)
    //  trackEvent(name, {
    //   props: {
    //     version: getVersion(),
    //     ...omitBy(props || {}, isUndefined),
    //   },
    // })
  } catch (err) {
    console.error('plausible.trackEvent error', err)
  }
}
