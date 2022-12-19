import express from 'express'
import helmet from 'helmet'
import config from './config'
import cookieParser from 'cookie-parser'
import helmetOptions from './helmetOptions'

const app = express()

app.set('trust proxy', true)

app.use(cookieParser())
app.use(helmet(helmetOptions))

app.disable('etag')

const server = app.listen(config.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Main app is now running on http://localhost:${config.port}`)
  })

export default server
