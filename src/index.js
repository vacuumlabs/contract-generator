import path from 'path'
import express from 'express'
import favicon from 'serve-favicon'
import cookieParser from 'cookie-parser'
import c from './config'
import {sendInvalidInput, sendNotFound} from './errorPages.js'
import home from './home.js'
import {renderToString} from 'react-dom/server'
import evalFunction from './evalFunction'
import {registerAuthRoutes, authorize, file} from './api'
import axios from 'axios'
import {run} from 'yacol'

const asciidoctor = require('asciidoctor.js')({
  runtime: {
    platform: 'node',
  },
})

const app = express()
app.use('/assets', express.static('assets'))

registerAuthRoutes(app)

app.use(cookieParser())
app.use(favicon(path.join(__dirname, '../assets', 'favicon.ico')))

function* loadEMS(date) {
  const {data} = yield axios.get(
    `https://ems.vacuumlabs.com/api/monthlyExport?apiKey=${
      c.emsKey
    }&date=${date}`,
  )

  return data
}

app.get('/', authorize, (req, res) => {
  run(index, req, res)
})

app.get('/contract/:name/:date', authorize, async (req, res) => {
  run(contract, req, res)
})

app.get('/*', (req, res) => {
  sendNotFound(res)
})

function* index(req, res) {
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

    if (line.match(/^ifeval::/) || line.match(/^ifdef::/)) {
      emptyLine = true
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
  const name = req.params.name

  const emsData = yield run(loadEMS, req.params.date)
  const entity = emsData.find((e) => e.jiraId === req.query.id)

  if (!entity) {
    return sendInvalidInput(res, `Entity with id ${req.query.id} not found`)
  }

  try {
    const varsFile = yield run(file, req, `${name}.js`).catch((e) =>
      sendInvalidInput(res, e.toString()),
    )
    const templateFile = yield run(file, req, `${name}.adoc`).catch((e) =>
      sendInvalidInput(res, e.toString()),
    )

    if (!varsFile || !templateFile) return

    const vars = evalFunction(varsFile)(req.query, emsData)
    const template = preprocessTemplate(templateFile)

    res.send(
      asciidoctor.convert(`${vars}\n${template}`, {
        header_footer: true,
        attributes: {stylesheet: '/assets/contract.css'},
      }),
    )
  } catch (e) {
    return sendInvalidInput(res, `Exception in '${name}': ` + e.toString())
  }
}

app.listen(c.port, () => console.log(`App started on localhost:${c.port}.`))
