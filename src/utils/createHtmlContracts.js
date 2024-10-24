import _asciidoctor from 'asciidoctor.js'
import {file} from '../api'
import evalFunction from '../evalFunction'
import {preprocessTemplate} from './preprocessTemplate'
import {
  paramNames,
  getFilledParamValues,
  shouldRemovePandadocTags,
} from './parsing'
import {objToAdocVars} from './objToAdocVars'
import {loadSheetData} from './sheets'

const asciidoctor = _asciidoctor()

export const createHtmlContracts = async (req, people, contractPath) => {
  const template = preprocessTemplate(
    await file(req, `${contractPath}.adoc`),
    shouldRemovePandadocTags(req),
  )
  const templateFunction = await file(req, `${contractPath}.js`)

  const signingDates = getFilledParamValues(req, paramNames.signingDate)
  const startDates = getFilledParamValues(req, paramNames.startDate, true)
  const employers = getFilledParamValues(req, paramNames.employer, true)

  const htmlContracts = await Promise.all(
    people.map(async (person, i) => {
      const query = {
        ...req.query,
        id: person.vacuumId,
        signing_date: signingDates[i],
        start_date: startDates[i],
        employer_id: employers[i],
        loadSheetData,
      }

      const vars = await evalFunction(templateFunction)(query, person)

      const adocVars = objToAdocVars(vars, person.vacuumId)

      return asciidoctor.convert(`${adocVars}\n${template}`, {
        header_footer: true,
      })
    }),
  )

  return htmlContracts
}
