import {wait} from './wait'

export const retryOnTooManyRequests = (fn) => async (...args) => {
  try {
    const res = await fn(...args)
    return res
  } catch (res) {
    if (res.response.status === 429) {
      await wait(parseInt(res.response.headers['retry-after']) * 1000 + 2000)
      return fn(...args)
    }
    throw res
  }
}
