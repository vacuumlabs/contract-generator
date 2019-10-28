import _asciidoctor from 'asciidoctor.js'
import chrome from 'chrome-aws-lambda'
import puppeteer from 'puppeteer-core'
import url from 'url'
import {file} from './api'
import c from './config'
import evalFunction from './evalFunction'

const asciidoctor = _asciidoctor()

export const htmlToPdf = async (html, cssUrl) => {
  const browser = await puppeteer.launch({
    args: chrome.args,
    executablePath: await chrome.executablePath,
    headless: chrome.headless,
  })
  const page = await browser.newPage()

  const options = {
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<div/>',
    footerTemplate: '<div/>',
    /*`
    <div class='grow'></div>
    <div class='text right'>
      <span class='pageNumber'></span>/<span class='totalPages'></span>
    </div>`*/
  }

  await page.setContent(html)
  await page.addStyleTag({url: cssUrl})

  // wait for image to load
  await new Promise((res) => {
    page.on('requestfinished', async () => res())
  })
  const pdf = await page.pdf(options)
  browser.close()
  return pdf
}

export const getParams = (req) => {
  const params = req.url.split('/').slice(2)
  const name = params[0]
  const date = params[1].split('?')[0]
  return {name, date}
}

export const getCssUrl = (req) =>
  url.format({
    protocol: req.headers['x-forwarded-proto'] || c.isHttps ? 'https' : 'https',
    host: req.headers.host,
    pathname: '/assets/contract.css',
  })

const preprocessTemplate = (tmp) => {
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

export const createHtml = async (req, name, emsData) => {
  const vars = evalFunction(await file(req, `${name}.js`))(req.query, emsData)
  const template = preprocessTemplate(await file(req, `${name}.adoc`))

  return asciidoctor.convert(`${vars}\n${template}`, {
    header_footer: true,
  })
}
