import c from '../config'
import {google} from 'googleapis'

const sheets = {
  shareTable: {
    spreadsheetId: c.google.spreadsheetId,
    sheetId: 0,
    range: 'Sheet1',
  },
}

const scopes = ['https://www.googleapis.com/auth/spreadsheets.readonly']
const key = Buffer.from(c.google.key, 'base64').toString()
const auth = new google.auth.JWT(c.google.email, null, c.google.key, scopes)
const sheetsApi = google.sheets({version: 'v4', auth: c.google.key})

// How are EMS data and google sheets data joined
const idSheetsColumn = 'Email' // google sheet column name
const idEMSField = 'emailVL'

export const loadSheetData = async (people) => {
  const sheet = sheets.shareTable
  const personIDs = people.map((person) => person[idEMSField])

  console.log('sheets_2a')
  let [header, ...values] = await getValues(sheet.spreadsheetId, sheet.range)
  console.log('sheets_2b')
  try {
    values = values
      .map((row) => {
        let obj = {}
        header.forEach((key, col) => {
          obj[key] = row[col]
        })
        return obj
      })
      .filter((row) => personIDs.includes(row[idSheetsColumn]))
  } catch (error) {
    console.log(error)
  }
  console.log('sheets_3')
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
