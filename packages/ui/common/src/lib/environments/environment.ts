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

  secretsUrl: 'http://localhost:3001/api/secrets'
  // END EE
} as const;
