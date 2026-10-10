import * as cheerio from 'cheerio'
import { ingestText } from './ragService.js'

// Fetches a public page (Wikipedia company page, SEC EDGAR filing, a news
// article, a G2/Product Hunt listing, etc.), strips it down to readable
// text, and hands it to ragService for chunking + embedding + storage.
// 100% free — just Node's built-in fetch + cheerio, no scraping API.
export async function scrapeAndIngest({ url, category = 'general', userId = null }) {
  const res = await fetch(url, { headers: { 'User-Agent': 'StartupValidatorBot/1.0' } })
  if (!res.ok) throw Object.assign(new Error(`Failed to fetch ${url} (${res.status})`), { status: 502 })

  const html = await res.text()
  const $ = cheerio.load(html)
  $('script, style, nav, footer, header, noscript').remove()

  const title = $('title').first().text().trim() || url
  const bodyText = $('article').text() || $('main').text() || $('body').text()
  const cleanText = bodyText.replace(/\s+/g, ' ').trim().slice(0, 20000) // cap per-page text

  if (!cleanText) throw Object.assign(new Error(`No readable text found at ${url}`), { status: 422 })

  const chunkCount = await ingestText({
    text: cleanText,
    source: title,
    sourceUrl: url,
    category,
    userId,
  })

  return { title, url, chunkCount }
}
