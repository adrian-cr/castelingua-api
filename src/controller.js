import WordData from "./models/WordDataModel.js"
import { fetchDLEdata, fetchDPDdata, fetchGTGdata } from "./utils/fetchers.js";
import { parseDLEdata } from "./utils/parsers/dleParser.js";
import { parseDPDdata } from "./utils/parsers/dpdParser.js";
import { parseGTGdata } from "./utils/parsers/gtgParser.js";
import { validateModel } from "./utils/validators.js";

export const getWordData = async (req, res) => {
  try {
    const data = await WordData.find();
    return res.status(200).json(data);
  } catch (e) {
    return res.status(404).json({error: e});
  }
}

export const addWordData = async (req, res) => {
  const key = req.query.api_key;
  if (!key || key!==process.env.API_KEY) {
    return res.status(403).json({error: e});
  }
  const {...body} = req.body;
  if (body) {
    try {
      if (!validateModel(body)) {
      return res.status(422).json({ error: "Invalid request body structure." });
      }
      const word = new WordData({ ...body });
      await word.save();
      res.status(201).json(word);
    } catch (e) {
      res.status(401).json({ error: e });
    }
  } else {
    res.status(400).json({ error: "Request body is missing." });
  }

}

export const deleteWordData = async (req, res) => {
  const {id} = req.params;
  const key = req.query.api_key;
  if (!key || key!==process.env.API_KEY) {
    return res.status(403).json({error: e});
  }
  if (!id) {
    return res.status(404).json({error: "Resource not found."});
  }
  try {
    const word = await WordData.findByIdAndDelete(id);
    return res.status(204).json({message: "Item with ID " + id + " has been removed."})
  } catch (e) {
    return res.status(500).json({error: e})
  }
}

export const getDLEdata = async (req, res) => {
  const {word} = req.params;
  //console.log(word);
  try {
    const html = await fetchDLEdata(word);
    if (html) {
      const parsedHTML = parseDLEdata(html);
      if (parsedHTML) {
        return res.status(200).json({data: parsedHTML})
      }
      return res.status(404).json({error: "Not found"})
    }
  } catch (e) {
    console.log(e)
    return res.status(500).json({error: e});
  }
}

export const getDPDdata = async (req, res) => {
  const {word} = req.params;
  //console.log(word);
  try {
    const html = await fetchDPDdata(word);
    if (html) {
      const parsedHTML = parseDPDdata(html);
      if (parsedHTML) {
        return res.status(200).json({data: parsedHTML})
      }
      return res.status(404).json({error: "Not found"})
    }
  } catch (e) {
    console.log(e)
    return res.status(500).json({error: e});
  }
}

export const getGTGdata = async (req, res) => {
  const {word} = req.params;
  try {
    const html = await fetchGTGdata(word);
    if (html) {
      const parsedHTML = parseGTGdata(html);
      if (parsedHTML) {
        return res.status(200).json({data: parsedHTML})
      }
      return res.status(404).json({error: "Not found"})
    }
  } catch (e) {
    console.log(e)
    return res.status(500).json({error: e});
  }
}

/*
export const addWordTest = (req, res) => {
  const {...body} = req.body;
  const result = validateModel(body);
  return res.status(200).json({result});

} */
