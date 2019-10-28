import _xmlhttprequest from 'xmlhttprequest' // when not present, build fails
import {authorize, loadEMS} from './api'
import {sendInvalidInput, sendNotEnoughRights} from './errorPages'
import {createHtml, htmlToPdf, getCssUrl, getParams} from './utils'

export default async (req, res) => {
  if (!(await authorize(req, res))) return

  const {name, date} = getParams(req)

  const emsData = await loadEMS(date)
  if (!emsData) return sendNotEnoughRights(res)

  const entity = emsData.find((e) => e.jiraId === req.query.id)

  if (!entity) {
    return sendInvalidInput(res, `Entity with id ${req.query.id} not found`)
  }

  try {
    const html = await createHtml(req, name, emsData)
    const cssUrl = getCssUrl(req)

    const pdf = await htmlToPdf(html, cssUrl)

    res.setHeader('Content-Type', `application/pdf`)
    res.send(pdf)
  } catch (e) {
    return sendInvalidInput(res, `Exception in '${name}': ` + e.toString())
  }
}
