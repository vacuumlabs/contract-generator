import {authorize, loadEMS} from './api'
import {getPeople, getParams} from './utils/parsing'
import {withErrorHandling} from './utils/withErrorHandling'
import {createPdfContracts} from './utils/createPdfContracts'
import {emailContracts} from './pandadoc'
import {sendEmailResponses} from './utils/sendEmailResponses'

const contractPandadoc = async (req, res) => {
  if (!(await authorize(req, res))) return

  const {contractFolder, contractName, date, useEms, useLogo} = getParams(req)
  
  const emsData = useEms ? await loadEMS(date) : undefined
  const people = getPeople(req, emsData)

  const contracts = await createPdfContracts(
    req,
    people,
    contractFolder,
    contractName,
    useLogo
  )

  const responses = await emailContracts(req, contracts, people, contractName)

  return sendEmailResponses(res, responses)
}

export default withErrorHandling(contractPandadoc)
