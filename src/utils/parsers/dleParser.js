import * as cheerio from "cheerio";

const parseEntryText = (entryHTML, $) => {
  let result = "";
  let reachedExample = false;

  $(entryHTML).contents().each((_, node) => {
    if (reachedExample) return;

    if (node.type === "tag") {
      const $node = $(node);
      const tag = node.name;
      const classAttr = $node.attr("class") || "";

      if (tag === "span" && classAttr.includes("n_acep")) {
        // Skip entry number
        return;
      }

      if (tag === "abbr") {
        // Skip POS tag
        return;
      }

      if (tag === "span" && classAttr.includes("h")) {
        // Reached example sentence — stop here
        reachedExample = true;
        return;
      }

      // For all other tags, preserve their text (e.g., <span> with content)
      result += $node.text();
    } else if (node.type === "text") {
      result += node.data;
    }
  });

  if (result.includes("Sin.")) {
    result = result.slice(0, result.indexOf("Sin."));
  }
  if (result.includes("Ant.")) {
    result = result.slice(0, result.indexOf("Ant."));
  }
  return result;
}
const extractDefObj = (target, defHTML, $) => {
  const defContainer = defHTML;
  const entryNum = defContainer.find("span.n_acep").first().text().trim();
  const allChildren = defContainer.children();
  let POS = "";
  const startAbbrs = [];
  const endAbbrs = [];
  let exampleSentence = null;
  let entryEnded = false;
  let reachedPOS = false;
  let reachedEntryText = false;
  allChildren.each((i, el) => {
    const $el = $(el);

    if (el.tagName === "abbr") {
      const abbrText = $el.text().trim();
      if (!abbrText.includes("Sin") && !abbrText.includes("Ant")) {
        if (!reachedPOS) {
          POS = abbrText;
          reachedPOS = true;
        } else if (!reachedEntryText) {
          startAbbrs.push(abbrText);
        } else if (entryEnded) {
          endAbbrs.push(abbrText);
        } else {
          entryEnded = true;
          endAbbrs.push(abbrText);
        }
      }//TODO: include "V. (ver)" abbreviations plus related term (e.g. "lo")
    } else if (el.tagName === "span") {
      const classes = $el.attr("class") || "";
      if (classes.includes("h")) {
        entryEnded = true;
        exampleSentence = $el.text();
      } else if (!classes.includes("n_acep")){
        const text = $el.text();
        reachedEntryText = true;
        if (text.trim().endsWith(".")) {
        }
      }
    } else if (el.type === "text" && reachedEntryText && !entryEnded) {
      if ($el.text().includes("Sin.")) return;
      if ($el.text().trim().endsWith(".")) {
        entryEnded = true;
      }
    }
  });
    const defObj = {
    entryNum,
    POS,
    definition: parseEntryText(defContainer, $).trim()
  };

  if (startAbbrs.length) defObj.startAbbrs = startAbbrs;
  if (endAbbrs.length) defObj.endAbbrs = endAbbrs;
  if (exampleSentence) defObj.exampleSentence = exampleSentence;
  const synonym = $(target).find('.c-word-list:has(abbr[title="Sinónimo o afín"]) .c-word-list__items li span span.sin').map((_, el) => $(el).text().trim()).get();
  const synonyms = $(target).find('.c-word-list:has(abbr[title="Sinónimos o afines"]) .c-word-list__items li span span.sin').map((_, el) => $(el).text().trim()).get();
  const antonym = $(target).find('.c-word-list:has(abbr[title="Antónimo u opuesto"]) .c-word-list__items li span span.sin').map((_, el) => $(el).text().trim()).get();
  const antonyms = $(target).find('.c-word-list:has(abbr[title="Antónimos u opuestos"]) .c-word-list__items li span span.sin').map((_, el) => $(el).text().trim()).get();
  defObj.synonyms = synonyms.length>0? synonyms : synonym.length>0? synonym : undefined;
  defObj.antonyms = antonyms.length>0? antonyms : antonym.length>0? antonym : undefined;
  return defObj;
}

const parseDefinition = defHTML => {
  const $ = cheerio.load(defHTML);
  const result = {
    word: $(".c-page-header__title").text(),
    etymology: $(".c-text-intro").first().text(),
    entries: [],
    phrases: [],
    relatedTerms: []
  };

  // 1. Extract the first <ol> as term definitions
  const firstOl = $('ol.c-definitions').first();
  firstOl.find('li').each((_, li) => {
    const defContainer = $(li).find(".c-definitions__item div");

    if (defContainer.html()) {
      const defObj = extractDefObj(li, defContainer, $);
      result.entries.push({
        ...{...defObj}
      });
    }
  });

  // 2. Extract idioms: <h3> followed by <ol> as phrases
  const idiomPairs = [];
  $('h3:has(u)').each((_, el) => {
    const $el = $(el);
    const next = $el.next();

    if (next.is('ol')) {
      idiomPairs.push({ title: $el.text().trim(), ol: next });
    }
  });

  idiomPairs.forEach(({ title, ol }) => {
    const entries = [];
    ol.find('li').each((_, li) => {
      const defContainer = $(li).find(".c-definitions__item div");
      if (defContainer.html()) {
      const defObj = extractDefObj(li, defContainer, $);
      entries.push({
        ...{...defObj}
      });
    }
    });

    result.phrases.push({
      phrase: title,
      entries
    });
  });

  // 3. Extract remaining <h3> elements as related terms
  $('h3.l').each((_, el) => {
    const $el = $(el);
    const next = $el.next();
    const hasOl = next.is('ol');
    const link = $el.find('a');

    if (!hasOl && link.length) {
      result.relatedTerms.push(link.text().trim());
    }
  });
  return result;
}


export const parseDLEdata = html => {

  const $ = cheerio.load(html);
  const headerTitle = $(".c-page-header__title").text();
  if ((headerTitle.split("«")[0] + headerTitle.split("»")[1])==="La palabra  no está en el Diccionario.") return;

  const articles = $(".o-main__article");
  const entries = [];
  if (articles.length>1) {
    articles.each((_, e) => {
      if (
        !e.attribs.id ||
          (!e.attribs.id.startsWith("sinonimos") &&
            !e.attribs.id.startsWith("antonimos"))
          ) {
            entries.push(parseDefinition(e));
          }
      }
      );
    }
    else {
        entries.push(parseDefinition(articles[0]));
      }


  return entries;

}
