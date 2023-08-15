export const apps = {
  production: true,
  apiUrl: 'https://automation.tookey.io/api/v1',
  jwtTokenName: 'token',
  redirectUrl: 'https://automation.tookey.io',
  backendUrl: 'https://backend.apps-production.tookey.cloud',
  userPropertyNameInLocalStorage: 'currentUser',
  //You need to edit index.html manually
  websiteTitle: 'Activepieces',
  activateBeamer: true,
  showFeedbackButton: true,
  showDocsButton: true,
  showUserProfile: true,
  // BEGIN EE
  firebase: {
    apiKey: 'AIzaSyBik7RRZ6S8QIpG4GqzwoF_SCNn3Dr9PPw',
    authDomain: 'activepieces-b3803.firebaseapp.com',
    projectId: 'activepieces-b3803',
    storageBucket: 'activepieces-b3803.appspot.com',
    messagingSenderId: '89039225374',
    appId: '1:89039225374:web:7e9279293327e02123640f',
  },
  // END EE
};

const aofg = {
  production: true,
  apiUrl: 'https://automation.aofg.io/api/v1',
  jwtTokenName: 'token',
  redirectUrl: 'https://automation.aofg.io',
  backendUrl: 'https://backend.aofg-production.tookey.cloud',
  userPropertyNameInLocalStorage: 'currentUser',
  // BEGIN EE
  firebase: {
    apiKey: 'AIzaSyBik7RRZ6S8QIpG4GqzwoF_SCNn3Dr9PPw',
    authDomain: 'activepieces-b3803.firebaseapp.com',
    projectId: 'activepieces-b3803',
    storageBucket: 'activepieces-b3803.appspot.com',
    messagingSenderId: '89039225374',
    appId: '1:89039225374:web:7e9279293327e02123640f',
  },
};



export const environment = window.location.hostname.includes('aofg') ? aofg : apps;