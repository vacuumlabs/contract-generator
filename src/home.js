import React from 'react'
import Style from './app.style'

export default () => (
  <div>
    <Style />
    <div className="line" />
    <div className="wrapper">
      <Header />
    </div>
  </div>
)

const Header = ({title = 'Contract Generator'}) => (
  <header className="header">
    <a href="/" className="header__logo" title={title}>
      {title}
    </a>
  </header>
)
