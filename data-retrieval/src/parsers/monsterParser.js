import * as cheerio from "cheerio";
import { cleanText, createSlug, parseCommaList } from "../utils/text.js";

const FIELD_DEFINITIONS = [
  { key: "foundAt", aliases: ["Found at"] },
  { key: "gems", aliases: ["Gems", "Gem"] },
  { key: "items", aliases: ["Items", "Item"] },
  { key: "weapons", aliases: ["Weapons", "Weapon"] },
  { key: "armors", aliases: ["Armor", "Armors"] },
  { key: "accessories", aliases: ["Accessories", "Accessory"] },
  { key: "bPetEq", aliases: ["Battle Pet's Equipment", "Battle Pet Equipment"] },
  { key: "pets", aliases: ["Pets", "Pet"] },
  { key: "questItems", aliases: ["Quest Items", "Quest Item"] },
];

const FIELD_LABELS = FIELD_DEFINITIONS.flatMap(({ aliases }) =>
  aliases.flatMap((alias) => [`${alias}:`, `${alias} :`])
);

function resolveImageUrl(rawUrl) {
  if (!rawUrl) return null;

  if (rawUrl.startsWith("//")) {
    return `https:${rawUrl}`;
  }

  if (rawUrl.startsWith("/")) {
    return `https://sealonline.fandom.com${rawUrl}`;
  }

  return rawUrl;
}

function normalizeImageKey(text) {
  return createSlug(
    String(text || "")
      .replace(/^File:/i, "")
      .replace(/\.[a-z0-9]+$/i, "")
  );
}

function buildCandidateKeys(parts) {
  return [...new Set(parts.map((part) => normalizeImageKey(part)).filter(Boolean))];
}

function scoreCandidateMatch(monsterKey, candidateKeys) {
  if (!monsterKey || !candidateKeys.length) {
    return 0;
  }

  if (candidateKeys.includes(monsterKey)) {
    return 100;
  }

  const monsterTokens = monsterKey.split("-").filter(Boolean);
  let bestScore = 0;

  for (const candidateKey of candidateKeys) {
    const candidateTokens = candidateKey.split("-").filter(Boolean);
    const tokenMatches = monsterTokens.filter((token) =>
      candidateTokens.includes(token)
    ).length;

    if (tokenMatches === 0) continue;

    if (
      candidateKey.startsWith(`${monsterKey}-`) ||
      candidateKey.endsWith(`-${monsterKey}`)
    ) {
      bestScore = Math.max(bestScore, 90);
      continue;
    }

    if (monsterTokens.length > 1) {
      const overlapScore = Math.round((tokenMatches / monsterTokens.length) * 75);
      bestScore = Math.max(bestScore, overlapScore);
    }
  }

  return bestScore;
}

function getPresentLabel(text, aliases) {
  const candidateLabels = aliases.flatMap((alias) => [`${alias}:`, `${alias} :`]);
  return candidateLabels.find((label) => text.includes(label)) ?? null;
}

function extractField(text, aliases) {
  const label = getPresentLabel(text, aliases);

  if (!label) return null;

  const start = text.indexOf(label);

  if (start === -1) return null;

  const afterLabel = text.slice(start + label.length);

  const nextIndexes = FIELD_LABELS.map((otherLabel) => afterLabel.indexOf(otherLabel)).filter(
    (index) => index !== -1
  );

  const end =
    nextIndexes.length > 0 ? Math.min(...nextIndexes) : afterLabel.length;

  return cleanText(afterLabel.slice(0, end));
}

function findStatsTable(section) {
  return section("table")
    .filter((_, table) => {
      const tableText = cleanText(section(table).text());
      return tableText.includes("Level") && tableText.includes("Attribute");
    })
    .first();
}

function extractBasicStats(statsTable, section) {
  const firstTableCells = statsTable
    .find("td")
    .map((_, cell) => cleanText(section(cell).text()))
    .get()
    .filter(Boolean);

  const levelLabelIndex = firstTableCells.findIndex((cell) => /^level$/i.test(cell));
  const attributeLabelIndex = firstTableCells.findIndex((cell) =>
    /^attribute$/i.test(cell)
  );

  const levelFromLabel =
    levelLabelIndex >= 0 ? firstTableCells[levelLabelIndex + 1] : null;
  const attributeFromLabel =
    attributeLabelIndex >= 0 ? firstTableCells[attributeLabelIndex + 1] : null;

  const levelCell =
    levelFromLabel && /^\d+$/.test(levelFromLabel)
      ? levelFromLabel
      : firstTableCells.find((cell) => /^\d+$/.test(cell));

  return {
    element: attributeFromLabel || firstTableCells[0] || null,
    level: levelCell ? parseInt(levelCell, 10) : null,
  };
}

function extractImageUrl(statsTable, section, monsterName) {
  const monsterKey = normalizeImageKey(monsterName);

  const mediaCandidates = statsTable
    .find('span[typeof="mw:File"], span[typeof="mw-File"]')
    .map((_, mediaSpan) => {
      const media = section(mediaSpan);
      const link = media.find("a").first();
      const image = media.find("img").first();
      const src = image.attr("data-src") || image.attr("src");

      if (!src || src.startsWith("data:")) return null;

      const candidateKeys = buildCandidateKeys([
        image.attr("alt"),
        image.attr("resource"),
        image.attr("data-image-name"),
        image.attr("data-image-key"),
        link.attr("href"),
        link.attr("title"),
      ]);

      return {
        imageUrl: resolveImageUrl(src),
        candidateKeys,
        score: scoreCandidateMatch(monsterKey, candidateKeys),
      };
    })
    .get()
    .filter(Boolean);

  const rankedCandidates = [...mediaCandidates].sort((left, right) => {
    return right.score - left.score;
  });

  if (rankedCandidates[0]?.score > 0) {
    return rankedCandidates[0].imageUrl;
  }

  return mediaCandidates[0]?.imageUrl ?? null;
}

function extractRelatedLinks(section) {
  return section("a")
    .map((_, link) => {
      const name = cleanText(section(link).text());
      const href = section(link).attr("href");

      if (!name || !href?.startsWith("/wiki/")) return null;

      return {
        name,
        slug: createSlug(name),
        url: `https://sealonline.fandom.com${href}`,
      };
    })
    .get()
    .filter(Boolean);
}

function findBestLinkByName(name, links) {
  const slug = createSlug(name);

  return (
    links.find((link) => link.slug === slug) ||
    links.find((link) => link.name === name) ||
    null
  );
}

function parseNamedEntities(fieldText, links) {
  return parseCommaList(fieldText).map((name) => {
    const matchedLink = findBestLinkByName(name, links);

    return {
      slug: createSlug(name),
      name,
      sourceUrl: matchedLink?.url ?? null,
    };
  });
}

function emptyDrops() {
  return {
    gems: [],
    items: [],
    weapons: [],
    armors: [],
    accessories: [],
    bPetEq: [],
    pets: [],
    questItems: [],
  };
}

export function parseMonsterPage(html, levelPage) {
  const $ = cheerio.load(html);
  const monsters = [];

  $("h2, h3").each((_, heading) => {
    const name =
      cleanText($(heading).find(".mw-headline").text()) ||
      cleanText($(heading).text());

    if (!name) return;

    let sectionHtml = "";
    let current = $(heading).next();

    while (current.length) {
      const tagName = current[0].tagName?.toLowerCase();

      if (tagName === "h2" || tagName === "h3") break;

      sectionHtml += $.html(current);
      current = current.next();
    }

    const section = cheerio.load(`<section>${sectionHtml}</section>`);
    const sectionText = cleanText(section.root().text());
    const looksLikeMonsterSection = FIELD_DEFINITIONS.some(({ aliases }) =>
      aliases.some((alias) =>
        sectionText.includes(`${alias}:`) || sectionText.includes(`${alias} :`)
      )
    );

    if (!looksLikeMonsterSection) return;

    const statsTable = findStatsTable(section);

    if (!statsTable.length) return;

    const { element, level } = extractBasicStats(statsTable, section);
    const imageUrl = extractImageUrl(statsTable, section, name);
    const relatedLinks = extractRelatedLinks(section);
    const drops = emptyDrops();

    for (const fieldDefinition of FIELD_DEFINITIONS) {
      const fieldText = extractField(sectionText, fieldDefinition.aliases);

      if (!fieldText) continue;

      if (fieldDefinition.key === "foundAt") {
        continue;
      }

      drops[fieldDefinition.key] = parseNamedEntities(fieldText, relatedLinks);
    }

    const foundAtText = extractField(sectionText, ["Found at"]);
    const foundAt = foundAtText ? parseNamedEntities(foundAtText, relatedLinks) : [];

    monsters.push({
      slug: createSlug(name),
      name,
      level,
      element,
      imageUrl,
      foundAt,
      drops,
      sourcePage: levelPage,
      sourceUrl: `https://sealonline.fandom.com/wiki/${encodeURIComponent(levelPage)}`,
    });
  });

  return monsters;
}
