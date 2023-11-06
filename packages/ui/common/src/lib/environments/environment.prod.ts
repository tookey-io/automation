const isProductionEnv = () => {
  const origin = window.location.origin;
  if (origin === 'https://automation.tookey.io') {
    return true
  } else if (origin.includes('production')) {
    return true
  }

  return false
}

export const environment ={
  production: isProductionEnv(),
  apiUrl: window.location.origin + '/api/v1',
  jwtTokenName: 'token',
  redirectUrl: window.location.origin,
  backendUrl: isProductionEnv() ? 'https://backend.production.tookey.cloud' : 'https://backend.develop.tookey.cloud',
  userPropertyNameInLocalStorage: 'currentUser',
  websiteTitle: 'Tookey Automation',
  activateBeamer: true,
  showFeedbackButton: true,
  showDocsButton: true,
  showUserProfile: false,

  secretsUrl: 'https://backend.production.tookey.cloud/api/secrets'
}