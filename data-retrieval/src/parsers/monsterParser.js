import * as cheerio from "cheerio";
import { cleanText, createSlug, parseCommaList } from "../utils/text.js";

const FIELD_DEFINITIONS = [
  { key: "foundAt", aliases: ["Found at"] },
  { key: "gems", aliases: ["Gems", "Gem", "Gems Dropped"] },
  { key: "items", aliases: ["Items", "Item"] },
  { key: "weapons", aliases: ["Weapons", "Weapon"] },
  { key: "armors", aliases: ["Armor", "Armors"] },
  { key: "accessories", aliases: ["Accessories", "Accessory"] },
  { key: "bPetEq", aliases: ["Battle Pet's Equipment", "Battle Pet Equipment"] },
  { key: "pets", aliases: ["Pets", "Pet", "Drops Pet"] },
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

function buildWikiUrl(name) {
  return `https://sealonline.fandom.com/wiki/${encodeURIComponent(
    String(name || "").trim().replace(/\s+/g, "_")
  )}`;
}

function toTitleCaseToken(token) {
  const lowerCased = String(token || "").toLowerCase();
  const firstAlphaIndex = lowerCased.search(/[a-z]/i);

  if (firstAlphaIndex === -1) {
    return lowerCased;
  }

  return (
    lowerCased.slice(0, firstAlphaIndex) +
    lowerCased.charAt(firstAlphaIndex).toUpperCase() +
    lowerCased.slice(firstAlphaIndex + 1)
  );
}

function normalizeMediaDerivedName(name) {
  return cleanText(
    String(name || "")
      .split(/\s+/)
      .map((token) =>
        token
          .split("-")
          .map((part) => toTitleCaseToken(part))
          .join("-")
      )
      .join(" ")
  );
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

function extractLowestNumber(value) {
  const numbers = String(value || "").match(/\d+/g);

  if (!numbers?.length) {
    return null;
  }

  return Math.min(...numbers.map((number) => parseInt(number, 10)));
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

  const level =
    extractLowestNumber(levelFromLabel) ??
    extractLowestNumber(firstTableCells.find((cell) => /\d/.test(cell)));

  return {
    element: attributeFromLabel || firstTableCells[0] || null,
    level,
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

function extractRowEntityImageUrl(link, section) {
  const previousMedia = section(link)
    .prevAll()
    .filter('span[typeof="mw:File"], span[typeof="mw-File"]')
    .first();

  if (previousMedia.length) {
    const image = previousMedia.find("img").first();
    const imageUrl = image.attr("data-src") || image.attr("src");

    if (imageUrl && !imageUrl.startsWith("data:")) {
      return resolveImageUrl(imageUrl);
    }
  }

  return null;
}

function isMediaSpanElement(node, section) {
  const type = section(node).attr("typeof") || "";
  return type.includes("mw:File") || type.includes("mw-File");
}

function findClosestMediaSpan(node, section) {
  const closestMedia = section(node)
    .closest("span")
    .filter((_, span) => isMediaSpanElement(span, section))
    .first();

  if (closestMedia.length) {
    return closestMedia;
  }

  return section(node)
    .prevAll("span")
    .filter((_, span) => isMediaSpanElement(span, section))
    .first();
}

function extractMediaDisplayName(mediaSpan, section) {
  if (!mediaSpan?.length) {
    return null;
  }

  const image = mediaSpan.find("img").first();
  const mediaLink = mediaSpan.find("a").first();

  const rawName =
    image.attr("alt") ||
    image.attr("data-image-name") ||
    mediaLink.attr("title") ||
    mediaSpan.text();

  if (!rawName) {
    return null;
  }

  return normalizeMediaDerivedName(
    rawName
      .replace(/^File:/i, "")
      .replace(/\.[a-z0-9]+$/i, "")
      .replace(/_/g, " ")
  );
}

function extractLocationEntityImageUrl(link, section) {
  const container = section(link).closest("div");

  if (container.length) {
    const image = container.find("img").first();
    const imageUrl = image.attr("data-src") || image.attr("src");

    if (imageUrl && !imageUrl.startsWith("data:")) {
      return resolveImageUrl(imageUrl);
    }
  }

  return null;
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

function dedupeEntities(entities) {
  return entities.filter((entity, index, list) => {
    return (
      list.findIndex(
        (candidate) =>
          candidate.slug === entity.slug && candidate.sourceUrl === entity.sourceUrl
      ) === index
    );
  });
}

function isBattlePetEquipmentEntity(entity) {
  const name = entity?.name || "";
  return /\(Stage\s*\d+\)|\(Normal\)/i.test(name);
}

function normalizeBattlePetEquipmentDrops(drops) {
  const categories = ["gems", "items", "weapons", "armors", "accessories", "pets", "questItems"];
  const movedEntities = [];

  for (const category of categories) {
    const entities = drops[category] || [];
    const keptEntities = [];

    for (const entity of entities) {
      if (isBattlePetEquipmentEntity(entity)) {
        movedEntities.push(entity);
      } else {
        keptEntities.push(entity);
      }
    }

    drops[category] = keptEntities;
  }

  drops.bPetEq = dedupeEntities([...(drops.bPetEq || []), ...movedEntities]);

  return drops;
}

function parseNamedEntities(fieldText, links) {
  return dedupeEntities(
    parseCommaList(fieldText).map((name) => {
      const matchedLink = findBestLinkByName(name, links);

      return {
        slug: createSlug(name),
        name,
        sourceUrl: matchedLink?.url ?? null,
        imageUrl: null,
      };
    })
  );
}

function looksLikePetName(name) {
  return /\b(egg|seed)\b/i.test(cleanText(name));
}

function isExplicitlyEmptyField(fieldText) {
  return /^(none|no pet)$/i.test(cleanText(fieldText));
}

function findLabeledRow(section, aliases) {
  return (
    section("tr")
      .filter((_, row) => {
        const rowCells = section(row).children("td, th");
        const labelText = cleanText(
          rowCells.first().find("b, font").first().text()
        ).replace(/\s*:\s*$/, "");

        return aliases.some((alias) => labelText === alias);
      })
      .first()
  );
}

function extractLinkedEntitiesFromRow(row, section) {
  if (!row?.length) {
    return [];
  }

  const rowCells = row.children("td, th");
  const contentCell =
    rowCells.last().length > 0 ? rowCells.last() : row.find("td, th").last();

  const entities = contentCell
    .find('a[href^="/wiki/"]')
    .filter((_, link) => {
      return (
        !section(link).hasClass("mw-file-description") &&
        !findClosestMediaSpan(link, section).is(section(link).closest("span"))
      );
    })
    .map((_, link) => {
      const name = cleanText(section(link).text());
      const href = section(link).attr("href");

      if (!name || !href) return null;

      return {
        slug: createSlug(name),
        name,
        sourceUrl: `https://sealonline.fandom.com${href}`,
        imageUrl: extractRowEntityImageUrl(link, section),
      };
    })
    .get()
    .filter(Boolean);

  return dedupeEntities(entities);
}

function extractPetEntitiesFromRow(row, section) {
  if (!row?.length) {
    return [];
  }

  const rowCells = row.children("td, th");
  const contentCell =
    rowCells.last().length > 0 ? rowCells.last() : row.find("td, th").last();

  const entities = contentCell
    .find('a[href^="/wiki/"]')
    .filter((_, link) => {
      return !isMediaSpanElement(section(link).parent(), section);
    })
    .map((_, link) => {
      const href = section(link).attr("href");
      const rawName = cleanText(section(link).text());
      const mediaSpan = findClosestMediaSpan(link, section);
      const mediaName = extractMediaDisplayName(mediaSpan, section);
      const resolvedName =
        looksLikePetName(rawName) ? rawName : looksLikePetName(mediaName) ? mediaName : null;

      if (!resolvedName) {
        return null;
      }

      const canTrustSourceUrl =
        looksLikePetName(rawName) && href && !href.startsWith("/wiki/Special:");
      const sourceUrl = canTrustSourceUrl
        ? `https://sealonline.fandom.com${href}`
        : buildWikiUrl(resolvedName);

      return {
        slug: createSlug(resolvedName),
        name: resolvedName,
        sourceUrl,
        imageUrl: extractRowEntityImageUrl(link, section),
      };
    })
    .get()
    .filter(Boolean);

  return dedupeEntities(entities);
}

function findLocationCell(section) {
  return section("td")
    .filter((_, td) => {
      const style = section(td).attr("style") || "";
      return style.includes("text-align:right");
    })
    .first();
}

function extractFoundAt(section) {
  const locationCell = findLocationCell(section);

  if (!locationCell.length) {
    return [];
  }

  const locations = locationCell
    .find('div a[href^="/wiki/"]')
    .filter((_, link) => !section(link).hasClass("mw-file-description"))
    .map((_, link) => {
      const name = cleanText(section(link).text());
      const href = section(link).attr("href");

      if (!name || !href) return null;

      return {
        slug: createSlug(name),
        name,
        sourceUrl: `https://sealonline.fandom.com${href}`,
        imageUrl: extractLocationEntityImageUrl(link, section),
      };
    })
    .get()
    .filter(Boolean);

  return dedupeEntities(locations);
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
      const labeledRow = findLabeledRow(section, fieldDefinition.aliases);
      const linkedEntities =
        fieldDefinition.key === "pets"
          ? extractPetEntitiesFromRow(labeledRow, section)
          : extractLinkedEntitiesFromRow(labeledRow, section);

      if (fieldDefinition.key !== "foundAt" && linkedEntities.length > 0) {
        drops[fieldDefinition.key] = linkedEntities;
        continue;
      }

      const fieldText = extractField(sectionText, fieldDefinition.aliases);

      if (!fieldText) continue;

      if (isExplicitlyEmptyField(fieldText)) {
        continue;
      }

      if (fieldDefinition.key === "foundAt") {
        continue;
      }

      if (fieldDefinition.key === "pets" && labeledRow.length) {
        continue;
      }

      drops[fieldDefinition.key] = parseNamedEntities(fieldText, relatedLinks);
    }

    const foundAtLinked = extractFoundAt(section);
    const foundAtText = extractField(sectionText, ["Found at"]);
    const foundAt =
      foundAtLinked.length > 0
        ? foundAtLinked
        : foundAtText
          ? parseNamedEntities(foundAtText, relatedLinks)
          : [];

    normalizeBattlePetEquipmentDrops(drops);

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
