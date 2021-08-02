import {authorize, loadEMS} from './api'
import {getPeople, getParams} from './utils/parsing'
import {withErrorHandling} from './utils/withErrorHandling'
import {sendContracts} from './utils/sendContracts'
import {createPdfContracts} from './utils/createPdfContracts'

const contract = async (req, res) => {
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
  return sendContracts(res, people, contracts)
}

export default withErrorHandling(contract)
