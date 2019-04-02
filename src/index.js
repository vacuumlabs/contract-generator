import path from 'path'
import express from 'express'
import favicon from 'serve-favicon'
import {expressHelpers, run} from 'yacol'
import cookieParser from 'cookie-parser'
import c from './config'
import {sendNotFound, sendNotEnoughRights} from './errorPages.js'
import {sendToLogin, login, oauth} from './authorize.js'
import {unauthorized, notFound, notEnoughRights} from './exceptions.js'
import {amICollaborator as _amICollaborator, file as _file} from './ghApi.js'
import memoize from './memoize.js'
import r from './routes.js'
import home from './home.js'
import {renderToString} from 'react-dom/server'
import evalFunction from './evalFunction'
import fetch from 'node-fetch'

const asciidoctor = require('asciidoctor.js')({
  runtime: {
    platform: 'node',
  },
})

const app = express()
app.use('/assets', express.static('assets'))

const {register, runApp} = expressHelpers

app.use(cookieParser())
app.use(favicon(path.join(__dirname, '../assets', 'favicon.ico')))

const amICollaborator = memoize(
  _amICollaborator,
  c.cacheMaxRecords,
  c.authorizationMaxAge,
)

function* loadEMS(date) {
  const url = `https://ems.vacuumlabs.com/api/monthlyExport?apiKey=${
    c.emsKey
  }&date=${date}`
  return yield (yield fetch(url)).json()
}

function* checkRights(token) {
  return yield run(amICollaborator, token, c.ghOrganization, c.ghRepo)
}

function* file(token, path) {
  return yield run(_file, token, c.ghOrganization, c.ghRepo, path)
}

function* index(req, res) {
  const hasRights = yield run(checkRights, req.cookies.access_token)
  if (!hasRights) throw notEnoughRights
  res.send(renderToString(home()))
}

function preprocessTemplate(tmp) {
  const lines = tmp.split(/\r?\n/)

  let heading = 0
  let parNumber = []
  let emptyLine = true
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const isNewBlock = emptyLine
    emptyLine = line.match(/^\s*(\[\[[^\s]+\]\]\s*)?$/g)

    if (!isNewBlock) continue

    if (line.match(/^==/)) {
      heading++
      parNumber = []
      continue
    }

    if (line.match(/^:sectnums:/)) {
      heading = 0
      parNumber = []
      continue
    }

    const parRgx = /^(\.+)(\s*\[\[([^\s]+)\]\])?/
    const numberedP = line.match(parRgx)

    if (!numberedP) continue
    const level = numberedP[1].length

    parNumber = parNumber.slice(0, level)
    parNumber[level - 1] = (parNumber[level - 1] || 0) + 1

    const fullNumber = `${heading}.${parNumber.join('.')}`

    const ref =
      numberedP[3] != null ? `[[${numberedP[3]}, ${fullNumber}]]\n` : ''

    lines[i] = line.replace(
      parRgx,
      `[horizontal.level${level}]\n${ref}${fullNumber}:${':'.repeat(level)}`,
    )
  }

  return lines.join('\n')
}

function* contract(req, res) {
  const token = req.cookies.access_token
  const name = req.params.name

  const hasRights = yield run(checkRights, token)
  if (!hasRights) throw notEnoughRights

  const emsData = yield run(loadEMS, req.params.date)
  const vars = evalFunction(yield run(file, token, `${name}.js`))(
    req.query,
    emsData,
  )
  const template = preprocessTemplate(yield run(file, token, `${name}.adoc`))

  res.send(
    asciidoctor.convert(`${vars}\n${template}`, {
      header_footer: true,
      attributes: {stylesheet: '/assets/contract.css'},
    }),
  )
}

const esc = (s) => s.replace('$', '\\$')

// Wrapper for web requests to handle exceptions from standard flow.
const web = (handler) =>
  function*(req, res) {
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

run(function*() {
  run(runApp)
  app.listen(c.port, () => console.log(`App started on localhost:${c.port}.`))
})
