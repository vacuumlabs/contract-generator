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
  const contractName = params[0]
  const date = params[1].split('?')[0]
  return {contractName, date}
}

const validatePeople = (people, ids) => {
  const missingIds = people
    .map((person, i) => !person && ids[i])
    .filter((id) => !!id)

  if (!_.isEmpty(missingIds)) {
    throw 'Process stopped because some ids were not found:<br>' +
      missingIds.join('<br>')
  }
}

export const getPeople = (req, emsData) => {
  const ids = req.query.id.split(',')

  const people = ids.map((id) => emsData.find((e) => e.jiraId === id))
  validatePeople(people, ids)

  return people
}

export const getSigningDates = (req) => {
  const dates = req.query.signing_date.split(',')

  if (dates[0] === '') throw 'signing_date not specified.'

  const filledDates = dates.map((date) => date || dates[0])

  return filledDates
}

export const shouldRemovePandadocTags = (req) => {
  const endpoint = req.url.split('/')[1]
  return endpoint.match(/pandadoc/gi) ? false : true
}

export const shouldEmailCompany = (req) => {
  return !!req.query.sendEmailToCompany
}