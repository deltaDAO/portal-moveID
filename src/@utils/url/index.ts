import isUrl from 'is-url-superb'

export function sanitizeUrl(url: string) {
  const u = decodeURI(url).trim().toLowerCase()
  const isAllowedUrlScheme = u.startsWith('http://') || u.startsWith('https://')
  return isAllowedUrlScheme ? url : 'about:blank'
}

// check if the url is a google domain
export const isGoogleUrl = (url: string): boolean => {
  if (!url || !isUrl(url)) return

  const urlString = new URL(url)
  const googleUrl = urlString.hostname.endsWith('google.com')
  const isGoogleStorage = urlString.hostname.endsWith(
    'storage.cloud.google.com'
  )
  return isGoogleStorage ? false : googleUrl
}
