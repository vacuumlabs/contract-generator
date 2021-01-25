import _ from 'lodash'
import url from 'url'
import c from '../config'

export const paramNames = {
  signingDate: 'signing_date',
  startDate: 'start_date',
  employer: 'employer',
}

export const getCssUrls = (req, withLogo) => { 
  const getCssUrl = (cssPath) => url.format({
    protocol: req.headers['x-forwarded-proto'] || c.isHttps ? 'https' : 'https',
    host: req.headers.host,
    pathname: cssPath,
  })

  const contractCssUrl = getCssUrl('/assets/contract.css')
  if (!withLogo) return [contractCssUrl]
  
  const logoCssUrl = getCssUrl('/assets/logo.css')
  return [contractCssUrl, logoCssUrl]
}

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

export const getFilledParamValues = (req, paramName, isOptional) => {
  const param = req.query[paramName]
  if (!param) {
    if (isOptional) return []
    throw `${param} not specified.`
  }
  
  const values = param.split(',')
  if (!isOptional && values[0] === '') throw `${param} not specified.`

  const filledValues = values.map((value) => value || values[0])

  return filledValues
}

export const shouldRemovePandadocTags = (req) => {
  const endpoint = req.url.split('/')[1]
  return endpoint.match(/pandadoc/gi) ? false : true
}

export const shouldEmailCompany = (req) => {
  return !!req.query.sendEmailToCompany
}
