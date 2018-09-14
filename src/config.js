import transenv from 'transenv'

export default transenv()(({str, bool}) => {
  return {
    isHttps: bool('HTTPS'),
    apiKey: str('API_KEY'),
    port: str('PORT'),
    authorizationMaxAge: str('AUTHORIZATION_MAX_AGE'),
    cacheMaxRecords: 1000,
    ghClient: {
      client_id: str('GH_CLIENT_ID'),
      client_secret: str('GH_CLIENT_SECRET'),
    },
    ghOrganization: str('GH_ORGANIZATION'),
    ghRepo: str('GH_REPO'),
  }
})
