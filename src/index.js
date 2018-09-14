import path from 'path'
import express from 'express'
import favicon from 'serve-favicon'
import {expressHelpers, run} from 'yacol'
import cookieParser from 'cookie-parser'
import c from './config'
import {sendNotFound, sendNotEnoughRights} from './errorPages.js'
import {sendToLogin, login, oauth} from './authorize.js'
import {unauthorized, notFound, notEnoughRights} from './exceptions.js'
import {amICollaborator as _amICollaborator} from './ghApi.js'
import memoize from './memoize.js'
import r from './routes.js'
import home from './home.js'
import {renderToString} from 'react-dom/server';
import testDoc from './test.adoc'

require('now-logs')(c.apiKey)
const asciidoctor = require('asciidoctor.js')()

const app = express()
const {register, runApp} = expressHelpers

app.use(cookieParser())
app.use(favicon(path.join(__dirname, '../assets', 'favicon.ico')))

const amICollaborator = memoize(_amICollaborator, c.cacheMaxRecords, c.authorizationMaxAge)

function* checkRights(token, repo) {
  return repo == null || (yield run(amICollaborator, token,
                                   c.ghOrganization, repo))
}

function* index(req, res) {
  const hasRights = yield run(checkRights, req.cookies.access_token, c.ghRepo)
  if (!hasRights) throw notEnoughRights
  res.send(renderToString(home()))
}

function* contract(req, res) {
  const hasRights = yield run(checkRights, req.cookies.access_token, c.ghRepo)
  if (!hasRights) throw notEnoughRights
  res.send(asciidoctor.convert(testDoc))
}

const esc = (s) => s.replace('$', '\\$')

// Wrapper for web requests to handle exceptions from standard flow.
const web = (handler) => function* (req, res) {
  yield run(handler, req, res).catch((e) => {
    if (e === notFound) sendNotFound(res)
    else if (e === unauthorized) sendToLogin(req, res)
    else if (e === notEnoughRights) sendNotEnoughRights(res)
    else throw e
  })
}

register(app, 'get', esc(r.index), web(index))
register(app, 'get', esc(r.login), web(login))
register(app, 'get', esc(r.oauth), web(oauth))
register(app, 'get', esc(r.contract), web(contract))

run(function* () {
  run(runApp)
  app.listen(c.port, () =>
    console.log(`App started on localhost:${c.port}.`)
  )
})
