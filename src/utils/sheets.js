import c from '../config'
import {google} from 'googleapis'

const sheets = {
  shareTable: {
    spreadsheetId: c.google.spreadsheetId,
    sheetId: 0,
    range: 'Sheet1',
    idSheetsColumn: 'Email', // google sheet column name
    idEMSField: 'emailVL', // EMS field to be joined on
  },
}

const scopes = ['https://www.googleapis.com/auth/spreadsheets.readonly']
const key = Buffer.from(c.google.key, 'base64').toString()
const auth = new google.auth.JWT(c.google.email, null, key, scopes)
const sheetsApi = google.sheets({version: 'v4', auth})

export const loadSheetData = async (people, sheet=sheets.shareTable) => {
  const personIDs = people.map((person) => person[sheet.idEMSField])

  let [header, ...values] = await getValues(sheet.spreadsheetId, sheet.range)

  try {
    values = values
      .map((row) => {
        let obj = {}
        header.forEach((key, col) => {
          obj[key] = row[col]
        })
        return obj
      })
      .filter((row) => personIDs.includes(row[sheet.idSheetsColumn]))
  } catch (error) {
    console.log(`Error loading Google Sheet ID ${sheet.spreadsheetId}:\n ${error}`)
  }
  return values
}

const getValues = async (spreadsheetId, range) => {
  return (
    (
      await sheetsApi.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        valueRenderOption: 'UNFORMATTED_VALUE',
        range,
      })
    ).data.values || []
  )
}
