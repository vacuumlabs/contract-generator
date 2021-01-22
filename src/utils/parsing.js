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
  const useEms = req.query.ems !== 'false'
  return {contractName, date, useEms}
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

  let people
  if (emsData) {
    people = ids.map((id) => emsData.find((e) => e.jiraId === id))
    validatePeople(people, ids)
  } else {
    people = ids.map((id) => {return {jiraId: id}})
  }

  return people
}

export const getSigningDates = (req) => {
  const dates = req.query.signing_date.split(',')

  if (dates[0] === '') throw 'signing_date not specified.'

  const filledDates = dates.map((date) => date || dates[0])

  return filledDates
}

export const getEmployers = (req) => {
  const employerParam = req.query.employer
  if (!employerParam) return []
  
  const employers = employerParam.split(',')
  const filledEmployers = employers.map((employer) => employer || employers[0])

  return filledEmployers
}

export const shouldRemovePandadocTags = (req) => {
  const endpoint = req.url.split('/')[1]
  return endpoint.match(/pandadoc/gi) ? false : true
}

export const shouldEmailCompany = (req) => {
  return !!req.query.sendEmailToCompany
}
