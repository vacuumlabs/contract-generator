import _asciidoctor from 'asciidoctor.js'
import {file} from '../api'
import evalFunction from '../evalFunction'
import {preprocessTemplate} from './preprocessTemplate'
import {getEmployers, getSigningDates, shouldRemovePandadocTags} from './parsing'
import {objToAdocVars} from './objToAdocVars'
import {loadSheetData} from './sheets'

const asciidoctor = _asciidoctor()

export const createHtmlContracts = async (
  req,
  people,
  contractName,
) => {
  const template = preprocessTemplate(
    await file(req, `${contractName}.adoc`),
    shouldRemovePandadocTags(req),
  )
  const templateFunction = await file(req, `${contractName}.js`)

  const signingDates = getSigningDates(req)
  const employers = getEmployers(req)

  const htmlContracts = await Promise.all(
    people.map(async (person, i) => {
      const query = {
        ...req.query,
        id: person.jiraId,
        signing_date: signingDates[i],
        employer_id: employers[i],
        loadSheetData,
      }

      const vars = await evalFunction(templateFunction)(query, person)

      const adocVars = objToAdocVars(vars, person.jiraId)

      return asciidoctor.convert(`${adocVars}\n${template}`, {
        header_footer: true,
      })
    }),
  )

  return htmlContracts
}
