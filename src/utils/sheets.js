import c from '../config'
import {google} from 'googleapis'

// Authentication
// Google Sheet must give read permission to the service account in c.google.email
const scopes = ['https://www.googleapis.com/auth/spreadsheets.readonly']
const key = Buffer.from(c.google.key, 'base64').toString()
const auth = new google.auth.JWT(c.google.email, null, key, scopes)
const sheetsApi = google.sheets({version: 'v4', auth})

/**
 * Loads data from Google Sheets
 * Returns an array of objects (rows) indexed by column headers (first row)
 * Called from contract template
 * @param {*} person: queried EMS data
 * @param {spreadsheetId, sheetId, range, idSheetsColumn, idEMSField} sheet: Google sheet and range identifier, fields to join with EMS
 */
export const loadSheetData = async (person, sheet) => {
  const [header, ...values] = await getValues(sheet.spreadsheetId, sheet.range)

  if (!header) throw new Error(`Spreadsheet https://docs.google.com/spreadsheets/d/${sheet.spreadsheetId} is empty. Check if sheet ID ${sheet.sheetId} and range ${sheet.range} are correct.`)
  if (!header.includes(sheet.idSheetsColumn)) throw new Error(`Field ${sheet.idSheetsColumn} not in header. Check the header of spreadsheet https://docs.google.com/spreadsheets/d/${sheet.spreadsheetId} - sheet ID ${sheet.sheetId} - range ${sheet.range}.`)
  
  // Index by column headers,
  // return only the (first) row containing person
  const indexedRow = values
  .map((row) =>
  header.reduce((obj, key, col) => {
    obj[key] = row[col]
    return obj
  }, {}),
  )
  .find((row) => row[sheet.idSheetsColumn] == person[sheet.idEMSField])

  if (!indexedRow) throw new Error(`Error joining column ${sheet.idSheetsColumn} of spreadsheet https://docs.google.com/spreadsheets/d/${sheet.spreadsheetId} with column ${sheet.idEMSField} of EMS. Check if ${sheet.idEMSField} of user ID ${person.jiraId} exists in column ${sheet.idSheetsColumn}.`)
  
  return indexedRow
}

const getValues = async (spreadsheetId, range) => {
  return (
    (
      await sheetsApi.spreadsheets.values.get({
        spreadsheetId,
        valueRenderOption: 'UNFORMATTED_VALUE', // each cell returns a string
        range,
      })
    ).data.values || []
  )
}
