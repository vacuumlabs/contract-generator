import {authorize, loadEMS} from './api'
import {getPeople, getParams} from './utils/parsing'
import {withErrorHandling} from './utils/withErrorHandling'
import {sendContracts} from './utils/sendContracts'
import {createPdfContracts} from './utils/createPdfContracts'

const contract = async (req, res) => {
  if (!(await authorize(req, res))) return

  const {contractName, date} = getParams(req)
  const emsData = await loadEMS(date)
  const people = getPeople(req, emsData)

  const contracts = await createPdfContracts(
    req,
    people,
    contractName,
  )
  return sendContracts(res, people, contracts)
}

export default withErrorHandling(contract)
