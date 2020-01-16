import axios from 'axios'
import c from './config'
import {sendNotEnoughRights, notEnoughRightsMessage} from './errorPages'

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

export const loadEMS = async (date) => {
  const emsData = (
    await axios.get(
      `https://ems.vacuumlabs.com/api/monthlyExport?apiKey=${c.emsKey}&date=${date}`,
    )
  ).data

  if (!emsData) {
    throw notEnoughRightsMessage
  }

  return emsData
}

export const redirect = (res, path) => {
  res.setHeader('Location', path)
  res.status(302).end()
}

export const authorize = async (req, res) => {
  if (!req.cookies.authToken) {
    redirect(res, '/login')
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
      redirect(res, '/login')
      return
    } else {
      throw e
    }
  }
  return true
}
