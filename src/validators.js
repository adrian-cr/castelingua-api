const isArr = x => Array.isArray(x);
const isEmpty = x => x.length===0;
const isObject = x => typeof x === "object";
const isString = x => typeof x === "string";
const validateEntries = (arr, isPhraseArr) => {
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



const validateModel = (body) => {
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

export default validateModel;
