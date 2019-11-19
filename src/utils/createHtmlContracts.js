import _ from 'lodash'
import _asciidoctor from 'asciidoctor.js'
import {file} from '../api'
import evalFunction from '../evalFunction'
import {preprocessTemplate} from './preprocessTemplate'
import {getSigningDates} from './parsing'

const asciidoctor = _asciidoctor()

export const createHtmlContracts = async (req, ids, name, emsData) => {
  const template = preprocessTemplate(await file(req, `${name}.adoc`))
  const templateFunction = await file(req, `${name}.js`)

  const signingDates = getSigningDates(req)

  const htmlContracts = ids.map((id, i) => {
    const query = {...req.query, id, signing_date: signingDates[i]}
    const vars = evalFunction(templateFunction)(query, emsData)

    return asciidoctor.convert(`${vars}\n${template}`, {
      header_footer: true,
    })
  })

  return htmlContracts
}
