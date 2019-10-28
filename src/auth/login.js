import qs from 'qs'
import url from 'url'
import {redirect} from '../api'
import c from '../config'

export default (req, res) => {
  const oauthUrl = url.format({
    protocol: c.isHttps ? 'https' : 'http',
    host: req.headers.host,
    pathname: '/callback',
  })
  redirect(res, `${c.ssoUrl}/$login?${qs.stringify({url: oauthUrl})}`)
}
