import chrome from 'chrome-aws-lambda'
import puppeteer from 'puppeteer-core'
import {getCssUrl} from './parsing'
import {createHtmlContracts} from './createHtmlContracts'

const pdfOptions = {
  format: 'A4',
  printBackground: true,
  displayHeaderFooter: true,
  headerTemplate: '<div/>',
  footerTemplate: `
    <div class='grow'></div>
    <div class='text right'>
      <span class='pageNumber'></span>/<span class='totalPages'></span>
    </div>`,
}

const addCss = (html, cssUrl) => {
  // place inside body to make sure puppeteer waits for the css (and its images) to load
  const regex = /<body.*>/
  const match = html.match(regex)
  return html.replace(
    regex,
    `${match[0]}\n<link rel="stylesheet" href="${cssUrl}">`,
  )
}

const htmlsToPdfs = async (htmls, cssUrl) => {
  const browser = await puppeteer.launch({
    args: chrome.args,
    executablePath: await chrome.executablePath,
    headless: chrome.headless,
  })

  const pdfs = await Promise.all(
    htmls.map(async (html) => {
      const page = await browser.newPage()

      const styledHtml = addCss(html, cssUrl)
      await page.setContent(styledHtml)

      return page.pdf(pdfOptions)
    }),
  )

  browser.close()
  return pdfs
}

export const createPdfContracts = async (
  req,
  people,
  contractName,
  emsData,
  loadSheetDataCallback,
) => {
  const htmls = await createHtmlContracts(
    req,
    people,
    contractName,
    emsData,
    loadSheetDataCallback,
  )

  const cssUrl = getCssUrl(req)
  return htmlsToPdfs(htmls, cssUrl)
}
