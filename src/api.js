import axios from 'axios'
import qs from 'querystring'
import c from './config'
import url from 'url'
import {sendNotEnoughRights} from './errorPages'

const config = (req) => {
  return {
    headers: {
      Authorization: `${c.ssoKey} ${req.cookies.authToken}`,
    },
  }
}

export const file = async (req, filename) => {
  try {
    const {data} = await axios.get(
      `${c.ghApiUrl}/repos/${c.ghRepo}/contents/${filename}`,
      config(req),
    )

    const {data: text} = await axios.get(data.download_url)

    return text
  } catch (e) {
    if (e.response.status === 404) {
      throw new Error(`${filename} not found`)
    }
  }
}

export const authorize = async (req, res, next) => {
  if (!req.cookies.authToken) {
    res.redirect('/auth/login')
    return
  }

  try {
    const {data: userRepos} = await axios.get(
      `${c.ghApiUrl}/user/repos`,
      config(req),
    )

    const isAuthorized = userRepos.some((x) => x.full_name === c.ghRepo)
    if (!isAuthorized) {
      sendNotEnoughRights(res)
      return
    }
  } catch (e) {
    if (e.response.status === 401) {
      res.redirect('/auth/login')
      return
    } else {
      throw e
    }
  }

  next()
}

export const registerAuthRoutes = (app) => {
  app.get('/auth/login', (req, res) => {
    const oauthUrl = url.format({
      protocol: req.protocol,
      host: req.headers.host,
      pathname: '/auth/callback',
    })
    res.redirect(`${c.ssoUrl}/$login?${qs.stringify({url: oauthUrl})}`)
  })

  app.get('/auth/callback', (req, res) => {
    res.cookie('authToken', req.query.code, {
      httpOnly: true,
      secure: c.isHttps,
    })

    res.redirect('/')
  })
}
