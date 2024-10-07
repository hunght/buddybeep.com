import ReactGA from 'react-ga4'

const TRACKING_ID = import.meta.env.VITE_GA_TRACKING_ID

export const initGA = () => {
  if (TRACKING_ID) {
    ReactGA.initialize(TRACKING_ID)
  } else {
    console.warn('Google Analytics Tracking ID is not set')
  }
}

export const logPageView = () => {
  const page = window.location.pathname + window.location.search
  ReactGA.send({ hitType: 'pageview', page })
}

export const logEvent = (category: string, action: string) => {
  ReactGA.event({ category, action })
}
