import _ from 'lodash'
import _asciidoctor from 'asciidoctor.js'
import {file} from '../api'
import evalFunction from '../evalFunction'
import {preprocessTemplate} from './preprocessTemplate'
import {getSigningDates, shouldRemovePandadocTags} from './parsing'

const asciidoctor = _asciidoctor()

export const createHtmlContracts = async (
  req,
  people,
  contractName,
  emsData,
) => {
  const template = preprocessTemplate(
    await file(req, `${contractName}.adoc`),
    shouldRemovePandadocTags(req),
  )
  const templateFunction = await file(req, `${contractName}.js`)

  const signingDates = getSigningDates(req)

  const htmlContracts = people.map((person, i) => {
    const query = {
      ...req.query,
      id: person.jiraId,
      signing_date: signingDates[i],
    }
    const vars = evalFunction(templateFunction)(query, emsData)

    return asciidoctor.convert(`${vars}\n${template}`, {
      header_footer: true,
    })
  })

  return htmlContracts
}
