import {sendInvalidInput} from '../errorPages'

export const withErrorHandling = (fn) => async (req, res) => {
  try {
    return await fn(req, res)
  } catch (e) {
    return sendInvalidInput(res, e.toString())
  }
}
