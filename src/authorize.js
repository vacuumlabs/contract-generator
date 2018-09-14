import {run} from 'yacol'
import c from './config'
import r from './routes.js'
import {authorizeUrl, accessToken} from './ghApi.js'

function saveCookie(res, key, value) {
  res.cookie(key, value, {httpOnly: true, secure: c.isHttps})
}

export function sendToLogin(req, res) {
  saveCookie(res, 'redirectAfterLogin', req.url)
  res.redirect(r.login)
}

export function* login(req, res) {
  res.redirect(authorizeUrl(c.ghClient))
}

export function* oauth(req, res) {
  const token = yield run(accessToken, c.ghClient, req.query.code)

  if (token) {
    saveCookie(res, 'access_token', token)
    res.redirect(req.cookies.redirectAfterLogin || r.index)
  } else {
    res.redirect(r.login)
  }
}
