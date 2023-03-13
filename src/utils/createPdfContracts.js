import puppeteer from 'puppeteer-core'
import {getCssUrls} from './parsing'
import {createHtmlContracts} from './createHtmlContracts'
import axios from 'axios'

const pdfOptions = {
  format: 'A4',
  printBackground: true,
  displayHeaderFooter: true,
  timeout: 0,
  headerTemplate: '<div/>',
  footerTemplate: `
    <div class='grow'></div>
    <div class='text right'>
      <span class='pageNumber'></span>/<span class='totalPages'></span>
    </div>`,
}

const htmlsToPdfs = async (htmls, cssUrls) => {
  const browser = await puppeteer.launch({args: ['--no-sandbox']})
  const pdfs = await Promise.all(
    htmls.map(async (html) => {
      const page = await browser.newPage()

      await page.setContent(html)

      await Promise.all(
        cssUrls.map(async (cssUrl) => {
          const css = (await axios.get(cssUrl)).data
          await page.addStyleTag({content: css})
        }),
      )

      return page.pdf(pdfOptions)
    }),
  )

  browser.close()
  return pdfs
}

export const createPdfContracts = async (
  req,
  people,
  contractFolder,
  contractName,
  withLogo,
) => {
  const contractPath = `${contractFolder}/${contractName}`
  const htmls = await createHtmlContracts(req, people, contractPath)

  const cssUrls = getCssUrls(req, withLogo)
  return htmlsToPdfs(htmls, cssUrls)
}
