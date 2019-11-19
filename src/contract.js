import {authorize, loadEMS} from './api'
import {getIds, getParams} from './utils/parsing'
import {withErrorHandling} from './utils/withErrorHandling'
import {sendContracts} from './utils/sendContracts'
import {createPdfContracts} from './utils/createPdfContracts'

const contract = async (req, res) => {
  if (!(await authorize(req, res))) return

  const {fileName, date} = getParams(req)
  const emsData = await loadEMS(date)
  const ids = getIds(req, emsData)

  const contracts = await createPdfContracts(req, ids, fileName, emsData)

  return sendContracts(res, ids, contracts)
}

export default withErrorHandling(contract)
