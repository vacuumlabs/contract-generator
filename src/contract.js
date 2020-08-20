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

  console.log('BEFORE')
  const sheetsData = await loadSheetData(people)
  console.log('RUN ON SHEET DATA FINISHED.')
  console.log(sheetsData)
  console.log('AFTER')

  const contracts = await createPdfContracts(
    req,
    people,
    contractName,
    emsData,
    sheetsData,
  )
  return sendContracts(res, people, contracts)
}

export default withErrorHandling(contract)
