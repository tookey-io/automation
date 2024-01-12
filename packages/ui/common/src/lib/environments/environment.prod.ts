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
  frontendUrl: isProductionEnv() ? 'https://automation.production.tookey.cloud' : 'https://automation.develop.tookey.cloud',
  userPropertyNameInLocalStorage: 'currentUser',
  websiteTitle: 'Tookey Automation',
  activateBeamer: true,
  showFeedbackButton: true,
  showDocsButton: true,
  showUserProfile: false,

  secretsUrl: isProductionEnv() ? 'https://backend.production.tookey.cloud/api/secrets' : 'https://backend.develop.tookey.cloud/api/secrets',
  // BEGIN EE
  firebase: {
    apiKey: 'AIzaSyBik7RRZ6S8QIpG4GqzwoF_SCNn3Dr9PPw',
    authDomain: 'cloud.activepieces.com',
    projectId: 'activepieces-b3803',
    storageBucket: 'activepieces-b3803.appspot.com',
    messagingSenderId: '89039225374',
    appId: '1:89039225374:web:7e9279293327e02123640f',
  },
  // END EE
}
