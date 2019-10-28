import {redirect} from '../api'
import c from '../config'

export default (req, res) => {
  res.setHeader(
    'Set-cookie',
    `authToken=${req.query.code}; HttpOnly${c.isHttps ? '; Secure' : ''}`,
  )

  redirect(res, '/')
}
