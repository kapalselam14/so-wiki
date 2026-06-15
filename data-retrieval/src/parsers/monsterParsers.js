import * as cheerio from 'cheerio';
import { cleanText, createSlug, parseCommaList } from "../utils/text.js"

const FIELD_LABELS = [
    "Weapons :",
    "Armor :",
    "Accessories :",
    "Battle Pet's Equipment :",
    "Items :",
    "Quest Items :",
]

function extractField(text, label) {
    const start = text.indexOf(label);

    if (start === -1) return null

    const afterLabel = text.slice(start + label.length)

    const nextIndexes = FIELD_LABELS
        .filter((otherLabel) => otherLabel !== label)
        .map((otherLabel) => afterLabel.indexOf(otherLabel))
        .filter((index) => index !== -1)

    const end = nextIndexes.length > 0 ? Math.min(...nextIndexes) : afterLabel.length

    return cleanText(afterLabel.slice(0, end))
}

function extractBasicStats(section) {
    const firstTableCells = section("table")
        .first()
        .find('td')
        .map((_, cell) => cleanText(section(cell).text()))
        .get()
        .filter(Boolean)

    const attribute = firstTableCells[0]

    const levelCell = firstTableCells.find((cell) => /^\d+$/.test(cell))
    const level = levelCell ? parseInt(levelCell) : null

    return {
        attribute,
        level,
    }
}

function extractRelatedLinks(section) {
    return section("a")
        .map((_, link) => {
            const name = cleanText(section(link).text())
            const href = section(linl).attr('href')

            if (!name || !href.startWith("/wiki/")) return null

            return {
                name,
                url: `https://sealonline.fandom.com${href}`,
            }
        })
        .get()
        .filter(Boolean)
}

export function parseMonsterPage(html, levelPage) {
    const $ = cheerio.load(html)
    const monsters = []

    $("h2, h3").each((_, heading) => {
        const name =
            cleanText($(heading).find('mw-headline').text()) ||
            cleanText($(heading).text())

        if (!name) return

        let sectionHtml = "";
        let current = $(heading).next()

        while (current.length) {
            const tagName = current[0].tagName?.toLowerCase()

            if (tagName === "h2" || tagName === "h3") break

            sectionHtml += $.html(current)
            current = current.next()
        }

        const section = cheerio.load(`<section>${sectionHtml}</section>`)
        const rawText = cleanText(section.root().text())

        const looksLikeMonsterSection =
            rawText.includes("Items: ") || rawText.includes("Weapons: ")

        if (!looksLikeMonsterSection) return

        const { attribute, level } = extractBasicStats(section)

        const weapons = extractField(rawText, "Weapons :")
        const armor = extractField(rawText, "Armor :")
        const accessories = extractField(rawText, "Accessories :")
        const battlePetEquipment = extractField(rawText, "Battle Pet's Equipment :")
        const items = extractField(rawText, "Items :")
        const questItems = extractField(rawText, "Quest Items :")


        monsters.push({
            slug: createSlug(name),
            name,
            levelRange: levelPage,
            level,
            attribute,
            weapons,
            armor,
            accessories,
            battlePetEquipment,
            drops: parseCommaList(itemsText),
            questItems,
            rawText,
            relatedLinks: extractRelatedLinks(section),
            sourcePage: levelPage,
            sourceUrl: `https://sealonline.fandom.com/wiki/${encodeURIComponent(
                levelPage
            )}`,
        });
    });

    return monsters
}