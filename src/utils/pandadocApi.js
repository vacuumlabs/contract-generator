import axios from 'axios'
import c from '../config'
import {retryOnTooManyRequests} from './retryOnTooManyRequests'

const config = {
  headers: {
    Authorization: `API-Key ${c.pandadocKey}`,
  },
}

export const uploadForm = retryOnTooManyRequests((form) =>
  axios.post('https://api.pandadoc.com/public/v1/documents/', form, {
    headers: {...form.getHeaders(), ...config.headers},
  }),
)

export const getDocuments = retryOnTooManyRequests(() =>
  axios.get('https://api.pandadoc.com/public/v1/documents/', config),
)

export const emailDocument = retryOnTooManyRequests((id, contractName) =>
  axios.post(
    `https://api.pandadoc.com/public/v1/documents/${id}/send`,
    {
      subject: contractName,
    },
    config,
  ),
)
