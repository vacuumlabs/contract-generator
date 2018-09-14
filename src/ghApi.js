import {run} from 'yacol'
import fetch from 'node-fetch'
import querystring from 'querystring'
import {unauthorized} from './exceptions.js'

const ghApiUrl = 'https://api.github.com'

function headers(token) {
  const h = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
  if (token) h['Authorization'] = `token ${token}`
  return h
}

export function authorizeUrl(ghClient) {
  const url = 'https://github.com/login/oauth/authorize'
  const query = {
    scope: 'repo',
    client_id: ghClient.client_id,
  }
  return `${url}?${querystring.stringify(query)}`
}

export function* accessToken(ghClient, code) {
  const url = 'https://github.com/login/oauth/access_token'
  const authParams = {...ghClient, code, accept: 'json'}
  const authResult = yield fetch(url, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(authParams),
  })

  return (yield authResult.json()).access_token
}

function* get(token, url) {
  if (token == null) throw unauthorized

  const response = yield fetch(url, {
    headers: headers(token),
    method: "GET",
  })

  if (response.status === 401) throw unauthorized

  return response
}

export function* user(token) {
  const url = `${ghApiUrl}/user`
  return yield (yield run(get, token, url)).json()
}

export function* amICollaborator(token, organization, repo) {
  const {login} = yield run(user, token)
  const url = `${ghApiUrl}/repos/${organization}/${repo}/collaborators/${login}`
  const response = yield run(get, token, url)

  if (response.status === 204) return true
  if (response.status === 404) return false

  // Unsupported HTTP code
  throw new Error(`Github returned unsupported HTTP code ${response.status}.`)
}
