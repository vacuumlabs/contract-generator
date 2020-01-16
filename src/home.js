import {authorize} from './api'

const title = 'Contract Generator'

export default async (req, res) => {
  if (!(await authorize(req, res))) return
  res.send(`
  <div>
    <link rel="stylesheet" href="/assets/app.css">
    <div className="line" />
    <div className="wrapper">
      <header className="header">
        <a href="/" className="header__logo" title="${title}">
          ${title}
        </a>
      </header>
    </div>
  </div>
   `)
}
