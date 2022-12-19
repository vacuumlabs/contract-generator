import express from 'express'
import config from './config'

const app = express()

const server = app.listen(config.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Main app is now running on http://localhost:${config.port}`)
  })

export default server
