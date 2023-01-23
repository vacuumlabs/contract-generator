import express from 'express'
import helmet from 'helmet'
import config from './config'
import cookieParser from 'cookie-parser'
import helmetOptions from './helmetOptions'
import home from './home'
import login from './auth/login'
import callback from './auth/callback'
import contract from './contract'
import contractPandadoc from './contractPandadoc'

const app = express()

app.set('trust proxy', true)

app.use(cookieParser())
app.use(helmet(helmetOptions))
app.use(express.static('assets'))
app.disable('etag')

app.get('/', home)
app.get('/login', login)
app.get('/callback', callback)
app.get('/contract/:contractFolder/:contractName/:date', contract)
app.get('/contractPandadoc/:contractFolder/:contractName/:date', contractPandadoc)

const server = app.listen(config.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Main app is now running on http://localhost:${config.port}`)
  })

export default server
