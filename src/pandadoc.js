import _ from 'lodash'
import {wait} from './utils/wait'
import {uploadForm, getDocuments, emailDocument} from './utils/pandadocApi'
import {createForm} from './utils/createForm'

const uploadPdf = async (req, pdf, person, contractName) => {
  const form = createForm(req, pdf, person, contractName)
  try {
    return await uploadForm(form)
  } catch (e) {
    throw `Uploading contract for ${person.company.legalName} failed <br> ${e}`
  }
}

const readyToMail = async (documentIds) =>
  // need to wait to move from 'document.uploaded' to 'document.draft',
  // which should take 3-5 seconds
  new Promise(async (res, rej) => {
    await wait(5000)
    for (let i = 0; i < 10; i++) {
      try {
        const documents = (await getDocuments()).data

        const allDocumentsReadyToMail = documentIds.every((id) => {
          const doc = _.find(documents.results, (d) => d.id === id)

          return doc && doc.status === 'document.draft'
        })

        if (allDocumentsReadyToMail) {
          res(i)
        }
      } catch (e) {
        rej(`Contracts uploaded, but checking their status failed. <br> ${e}`)
      }
      await wait(2000)
    }
    rej('Documents are taking too long to move to draft.')
  })

export const emailContracts = async (req, contracts, people, contractName) => {
  const documentIds = await Promise.all(
    contracts.map(
      async (contract, i) =>
        (await uploadPdf(req, contract, people[i], contractName)).data.id,
    ),
  )

  await readyToMail(documentIds)

  const emailResponses = await Promise.all(
    documentIds.map(async (documentId) => {
      try {
        return await emailDocument(documentId, contractName)
      } catch (res) {
        console.log(res)
        return res
      }
    }),
  )

  return emailResponses
}
