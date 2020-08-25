import {authorize, loadEMS} from './api'
import {getPeople, getParams} from './utils/parsing'
import {withErrorHandling} from './utils/withErrorHandling'
import {sendContracts} from './utils/sendContracts'
import {createPdfContracts} from './utils/createPdfContracts'
import {loadSheetData} from './utils/sheets'

const contract = async (req, res) => {
  if (!(await authorize(req, res))) return

  const {contractName, date} = getParams(req)
  const emsData = await loadEMS(date)
  const people = getPeople(req, emsData)

  const loadSheetDataCallback = (sheet) => loadSheetData(people, sheet)

  const contracts = await createPdfContracts(
    req,
    people,
    contractName,
    emsData,
    loadSheetDataCallback,
  )
  return sendContracts(res, people, contracts)
}

export default withErrorHandling(contract)
