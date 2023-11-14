export const environment = {
  production: false,
  apiUrl: 'http://127.0.0.1:3000/v1',
  jwtTokenName: 'token',
  redirectUrl: 'http://127.0.0.1:4200/redirect',
  backendUrl: 'http://127.0.0.1:3001',
  userPropertyNameInLocalStorage: 'currentUser',
  activateBeamer: true,
  showDocsButton: true,
  showUserProfile: false,
  websiteTitle: 'Tookey Automation',

  secretsUrl: 'http://localhost:3001/api/secrets',
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
} as const;
