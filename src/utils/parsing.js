import _ from 'lodash'
import url from 'url'
import c from '../config'

export const getCssUrl = (req) =>
  url.format({
    protocol: req.headers['x-forwarded-proto'] || c.isHttps ? 'https' : 'https',
    host: req.headers.host,
    pathname: '/assets/contract.css',
  })

export const getParams = (req) => {
  const params = req.url.split('/').slice(2)
  const fileName = params[0]
  const date = params[1].split('?')[0]
  return {fileName, date}
}

const validateIds = (ids, emsData) => {
  if (_.isEmpty(ids)) {
    throw 'No entity id specified.'
  }

  const missingEntities = ids.filter(
    (id) => !emsData.find((e) => e.jiraId === id),
  )
  if (!_.isEmpty(missingEntities)) {
    throw 'Process stopped because some ids were not found:<br>' +
      missingEntities.join('<br>')
  }
}

export const getIds = (req, emsData) => {
  const ids = req.query.id.split(',')
  validateIds(ids, emsData)
  return ids
}

export const getSigningDates = (req) => {
  const dates = req.query.signing_date.split(',')

  if (dates[0] === '') throw 'signing_date not specified.'

  const filledDates = dates.map((date) => date || dates[0])

  return filledDates
}
