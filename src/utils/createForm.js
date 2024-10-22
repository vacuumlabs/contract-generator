import FormData from 'form-data'
import fs from 'fs'
import {shouldEmailMiro, shouldEmailSpot, shouldEmailSafia} from './parsing'

const CONTRACT_GENERATOR_FOLDER_ID = 'hrfX9jC8KrnvxjDDq67wAH'

const emailCompany = (req) => {
  if (shouldEmailMiro(req)) {
    return {
      email: 'miro.skovajsa@vacuumlabs.com',
      first_name: 'Miroslav',
      last_name: 'Skovajsa',
      role: 'company',
    }
  }
  if (shouldEmailSafia(req)) {
    return {
      email: 'safia.bagin@vacuumlabs.com',
      first_name: 'Safia',
      last_name: 'Bagin',
      role: 'company',
    }
  }
  return {
    email: 'dummy.nonexistent.adress.company@vacuumlabs.com',
    first_name: 'Dummy',
    last_name: 'Nonexistent',
    role: 'company',
  }
}

const createDocumentData = (req, person) => ({
  tags: ['contract-generator'],
  folder_uuid: CONTRACT_GENERATOR_FOLDER_ID,
  recipients: [
    // creating a document fails, if any role has a missing recipient
    emailCompany(req),
    {
      email: shouldEmailSpot(req)
        ? 'michal@thespot.sk'
        : 'dummy.nonexistent.adress.spot@vacuumlabs.com',
      first_name: 'Michal',
      last_name: 'Haruštiak',
      role: 'spot',
    },
    {
      email: person.email,
      first_name: person.firstName,
      last_name: person.lastName,
      role: 'user',
    },
  ],
  parse_form_fields: false,
})

export const createForm = (req, pdf, person, contractName) => {
  // I could not find a better way, using a buffer or a stream directly did not work
  const fileName = `/tmp/contract-${
    person.vacuumId
  }-${new Date().toISOString()}.pdf`
  fs.writeFileSync(fileName, pdf)

  const form = new FormData()
  form.append('file', fs.createReadStream(fileName))
  form.append(
    'data',
    JSON.stringify({
      ...createDocumentData(req, person),
      name: `${person.company.legalName} - ${contractName}`,
    }),
  )

  return form
}
