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
 * @param {*} people: queried EMS data
 * @param {spreadsheetId, sheetId, range, idSheetsColumn, idEMSField} sheet: Google sheet and range identifier, fields to join with EMS
 */
export const loadSheetData = async (people, sheet) => {
  const personIDs = people.map((person) => person[sheet.idEMSField])

  const [header, ...values] = await getValues(sheet.spreadsheetId, sheet.range)

  // Index by column headers,
  // filter rows in the array people - from the original request
  const filteredValues = values
    .map((row) =>
      header.reduce((obj, key, col) => {
        obj[key] = row[col]
        return obj
      }, {}),
    )
    .filter((row) => personIDs.includes(row[sheet.idSheetsColumn]))
  return filteredValues
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
