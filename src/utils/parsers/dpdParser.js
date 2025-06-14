import * as cheerio from "cheerio";

export const parseDPDdata = (html) => {
  const $ = cheerio.load(html);
  const headerTitle = $("#resultados span").first();
  headerTitle.find('b').remove();
  if (headerTitle.text()==="La palabra  no está en el Diccionario.") return;
  const data = {
    term: $("entry header").text(),
    entries: [],
  };
  let elNum = 1;
  $('section.BLOQUEACEPS p').each((_, el) => {
    const $el = $(el);
    const entry = {
      splitText: [],
      fullText: $el.text()
    }

    $el.contents().each((_, node) => {
      if (elNum<=2) {
        elNum++;
        return;
      }
      if (node.type === 'text') {
        entry.splitText.push({
          type: 'text',
          content: $(node).text()
        });
      } else if (node.tagName === 'dfn') {
        entry.splitText.push({
          type: 'def',
          content: $(node).text().trim()
        });
      } else if (node.tagName === 'span' && $(node).hasClass('cita')) {
        const exampleSentence = $(node).clone();
        exampleSentence.find('.bib').remove();
        entry.splitText.push({
          type: 'ex',
          content: exampleSentence.text()
        });
        const bib = $(node).find('.bib');
        if (bib.length) {
          entry.splitText.push({
            type: 'bib',
            content: bib.text()
          });
        }
      } else if (node.tagName === 'abbr') {
        entry.splitText.push({
          type: 'abbr',
          content: $(node).text()
        });
      } else if (node.tagName === 'em') {
        const ment = $(node).find('.ment').text();
        entry.splitText.push({
          type: 'em',
          content: ment
        });
      } else if (node.tagName === 'a') {
        entry.splitText.push({
          type: 'link',
          scope: $(node).hasClass('EntradaTematica') ? 'external' : 'internal',
          content: $(node).text()
        });
      } else {
        entry.splitText.push({
          type: 'text',
          content: $(node).text()
        });
      }
    });

    data.entries.push(entry);
  });

  return data;
  //return html;
}
