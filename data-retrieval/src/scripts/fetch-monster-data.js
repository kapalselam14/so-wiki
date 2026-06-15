import fs from 'fs/promises'
import * as cheerio from "cheerio"

const API_URL = process.env.FANDOM_WIKI_API_URL

async function fetchWikiPage(page) {
    const params = new URLSearchParams({
        action: 'parse',
        page,
        prop: 'text|links',
        format: 'json',
        origin: '*'
    })

    const url = `${API_URL}?${params.toString()}`
    const res = await fetch(url)

    if (!res.ok) {
        throw new Error(`Failed to fetch page: ${res.status}`)
    }

    return res.json()
}

async function main() {
    const data = await fetchWikiPage('1-15')

    const html = data.parse.text['*']

    await fs.mkdir('data', { recursive: true })
    await fs.writeFile("data/level-1-15.html", html)

    const $ = cheerio.load(html)

    const links = [];

    $('a').each((_, element) => {
        const text = $(element).text().trim();
        const href = $(element).attr('href');
        const title = $(element).attr('title');

        if (!href || !href.startsWith('/wiki/')) return
        if (!text) return

        links.push({
            name: text,
            title,
            href,
            url: `https://sealonline.fandom.com${href}`,
        })
    })
    
    await fs.writeFile(
        "data/level-1-15-links.json",
        JSON.stringify(links,null,2)
    )

    console.log(`Saved ${links.length} links from 1-15 page.`)
}

main().catch((error) =>{
    console.error(error)
})
