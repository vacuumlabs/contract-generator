import transenv from 'transenv'

export default transenv()(({str, bool}) => {
  return {
    isHttps: bool('HTTPS'),
    port: str('PORT'),
    ghRepo: str('GH_REPO'),
    ssoUrl: str('VL_SSO_URL'),
    ssoKey: str('VL_SSO_KEY'),
    ghApiUrl: `${str('VL_SSO_URL')}/api/github`,
    emsKey: str('EMS_KEY'),
  }
})
