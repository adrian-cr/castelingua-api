import * as cheerio from "cheerio";

function parseTextWithTags($, elem) {
  const nodes = [];
  $(elem).contents().each((_, el) => {
    if (el.type === 'text') {
      nodes.push({ type: 'text', content: $(el).text()});
    } else if (el.tagName === 'i') {
      nodes.push({ type: 'em', content: $(el).text()});
    } else if (el.tagName === 'abbr') {
      nodes.push({ type: 'abbr', content: $(el).text()});
    } else if (el.tagName === 'sup') {
      nodes.push({ type: 'sup', content: $(el).text()});
    } else if (el.tagName === 'a') {
      nodes.push({
        type: 'link',
        content: $(el).text(),
        path: $(el).attr('href'),
      });
    } else if (el.tagName === 'dfn') {
      nodes.push({
        type: 'def',
        content: $(el).text(),
      });
    }
  });
  return nodes;
}

export const parseGTGdata = (html) => {
  const $ = cheerio.load(html);

  if ($("#resultados p").first().text()==="No se ha encontrado el término introducido. Por favor, seleccione una opción del autocompletado.") return;

  const baseURL = 'https://www.rae.es/gtg/';
  const baseURLrae = "https://www.rae.es";
  const result = {
    title: $("h1").text(),
    intro: [],
    body: {
      main:  [],
      complementary: [],
      fullText: [],
      graphs: [],
      tables: [],
    }
  };

  // INTRODUCTION SECTION
  $('p.ejemplos').each((_, p) => {
    const texts = [];
    $(p).find('i').text().split(',').forEach(t => {
      const word = t;
      if (word) texts.push(word);
    });
    result.intro.push({ type: 'examples', content: texts });
  });

  $('p.sinonimos').each((_, p) => {
    const text = $(p).text().replace(/Sinónimos:/i, '').replace(".", "");
    const items = text.split(',').map(t => t).filter(Boolean);
    result.intro.push({ type: 'synonyms', content: items });
  });

  $('p.relacionados').each((_, p) => {
    const related = [];
    $(p).find('a').each((_, a) => {
      related.push({
        term: $(a).text(),
        path: $(a).attr('href')
      });
    });
    result.intro.push({ type: 'relatedTerms', content: related });
  });

  $('p.esquema').each((_, p) => {
    const graphs = [];
    $(p).find('a').each((_, a) => {
      graphs.push({
        text: $(a).text(),
        path: $(a).attr('href')
      });
    });
    result.intro.push({ type: 'graphs', content: graphs });
  });

  $('p.tabla').each((_, p) => {
    const tables = [];
    $(p).find('a').each((_, a) => {
      tables.push({
        text: $(a).text(),
        path: $(a).attr('href')
      });
    });
    if (tables.length > 0) {
      result.intro.push({ type: 'tables', content: tables });
    }
  });

  $('p.referencias').each((_, p) => {
    const content = [];
    $(p).children('span').each((_, span) => {
      const resource = $(span).attr('class');
      const links = [];
      $(span).find('a').each((_, a) => {
        links.push({
          text: $(a).text(),
          url: baseURLrae + $(a).attr('href')
        });
      });
      content.push({ resource, links });
    });
    result.intro.push({ type: 'references', content });
  });

  // MAIN BODY
  $('p.main').each((_, p) => {
    const nodes = parseTextWithTags($, p);
    result.body.main.push(nodes);
    result.body.fullText.push($(p).text().trim());
  });


  // COMPLEMENTARY BODY
  $('section.infoCompl').each((_, section) => {
    const paras = [];
    $(section).find('p.adic').each((_, p) => {
      paras.push(parseTextWithTags($, p));
      result.body.fullText.push($(p).text().trim());
    });
    if (paras.length) {
      result.body.complementary.push(...paras);
    }
  });

  // GRAPHS
  $('div.esquemas > div[id^="ESQ"]').each((_, div) => {
    const id = $(div).attr('id');
    const title = $(div).find('p b').first().text();
    const img = $(div).find('img').attr('src');
    const notes = [];

    $(div).find('p').slice(1).each((_, p) => {
      notes.push(parseTextWithTags($, p));
    });

    result.body.graphs.push({
      id,
      title,
      imgURL: baseURL + img,
      notes
    });
  });

  // TABLES (if any)
  $('div.tablas > div[id^="TAB"]').each((_, div) => {
    const id = $(div).attr('id');
    const title = $(div).find('p b').first().text();
    const img = $(div).find('img').attr('src');
    const notes = [];

    $(div).find('p').slice(1).each((_, p) => {
      notes.push(parseTextWithTags($, p));
    });

    result.body.tables.push({
      id,
      title,
      imgURL: baseURL + img,
      notes
    });
  });
  return result;
  //return html;
}
