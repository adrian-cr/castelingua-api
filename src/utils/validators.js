export const isArr = x => Array.isArray(x);
export const isEmpty = x => x.length===0;
export const isObject = x => typeof x === "object";
export const isString = x => typeof x === "string";
export const validateEntries = (arr, isPhraseArr) => {
  if (isPhraseArr) {
    if (!isArr(arr)) return false;
    for (const entry of arr) {
      const {POS, definition, exampleSentence} = entry;
      if (
        !isString(POS) || isEmpty(POS) ||
          !isString(definition) ||  isEmpty(definition) ||
            !isString(exampleSentence)
      ) return false;
    }
    return true;
  }
  else if (isArr(arr) && !isEmpty(arr)) {
    for (const entry of arr) {
      const {POS, definition, exampleSentence, synonyms, antonyms} = entry;
      if (
      !isString(POS) || isEmpty(POS) ||
        !isString(definition) || isEmpty(definition) ||
          !isString(exampleSentence) ||
            !isArr(synonyms) ||
              !isArr(antonyms)
      ) return false;
      if (!entry.synonyms.every(s => typeof s === "string")) return false;
      if (!entry.antonyms.every(a => typeof a === "string")) return false;
    }
    return true;
  }
  return false;
}



export const validateModel = (body) => {
  const {DLE, DPD, DAMER} = body;
  if (!body || (!DLE && !DPD && !DAMER)) return false;
      if (DLE && isObject(DLE)) {
        const { word, terms, relatedTerms } = DLE;

        if (!isString(word)) return false;

        if (!Array.isArray(terms)) return false;
        for (const term of terms) {
          const {etymology, entries, phrases} = term;
          if (!isString(etymology)) return false;
          if (!validateEntries(entries, false)) return false;
          if (!isArr(phrases)) return false;
          for (const e of phrases) {
            const {phrase, entries} = e;
            if (!isString(phrase) || isEmpty(entries)) return false;
            if (!validateEntries(entries, true)) return false;
          }
      }
      if (!isArr(relatedTerms)) return false;
      for (const term of relatedTerms) {
      if (!isArr(term) || !term.every(t => isString(t))) return false;
      }
      }

      // DPD and DAMER can be empty objects or omitted (must be updated later)
      if (DPD && typeof DPD !== "object") return false;
      if (DAMER && typeof DAMER !== "object") return false;
      return true;
    };

const data = {
  intro: [
    {
      type: "examples",
      content: [String]
    },
    {
      type: "synonyms",
      content: [String]
    },
    {
      type: "relatedTerms",
      content: [
        {
          term: String,
          path: String
        }
      ]
    },
    {
      type: "graphs",
      content: [
        {
          text: String,
          path: String
        }
      ]
    },
    {
      type: "tables",
      content: [
        {
          text: String,
          path: String
        }
      ]
    },
    {
      type: "references",
      content: [
        {
          resource: String, //e.g. "NGLE"
          links: [
            {
              text: String,
              url: String
            }
          ]
        }
      ]
    }
  ],
  body: {
    main: [
      {
        type: String, // e.g. "text", "link", "em", "def"
        content: String,
        path: String // only for links
      }
    ],
    complementary: [
      [
        {
          type: String, // e.g. "text", "link", "em", "def"
          content: String,
          path: String // only for links
        }
      ]
    ],
    graphs: [
      {
        id: String, //The id is located in one of the image's parent container; it starts with "ESQ"
        title: String,
        url: String, // prepend the base url (https://www.rae.es/gtg/)
        notes: [
          {
            type: String, // e.g. "text", "link", "em", "def"
            content: String,
            path: String // only for links
          }
        ]
      }
    ],
    tables: [
      {
        id: String, id: String, //The id is located in one of the image's parent container; it starts with "TAB"
        title: String,
        url: String, // prepend the base url (https://www.rae.es/gtg/)
        notes: [
          {
            type: String, // e.g. "text", "link", "em", "def"
            content: String,
            path: String // only for links
          }
        ]
      }
    ]
  }
}
