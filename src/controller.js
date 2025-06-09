import Word from "./WordModel.js"
import validateModel from "./validators.js";

export const getWord = async (req, res) => {
  try {
    const data = await Word.find();
    return res.status(200).json(data);
  } catch (e) {
    return res.status(404).json({error: e});
  }
}

export const addWord = async (req, res) => {
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
      const word = new Word({ ...body });
      await word.save();
      res.status(201).json(word);
    } catch (e) {
      res.status(401).json({ error: e });
    }
  } else {
    res.status(400).json({ error: "Request body is missing." });
  }

}

export const deleteWord = async (req, res) => {
  const {id} = req.params;
  const key = req.query.api_key;
  if (!key || key!==process.env.API_KEY) {
    return res.status(403).json({error: e});
  }
  if (!id) {
    return res.status(404).json({error: "Resource not found."});
  }
  try {
    const word = await Word.findByIdAndDelete(id);
    return res.status(204).json({message: "Item with ID " + id + " has been removed."})
  } catch (e) {
    return res.status(500).json({error: e})
  }
}

/*
export const addWordTest = (req, res) => {
  const {...body} = req.body;
  const result = validateModel(body);
  return res.status(200).json({result});

} */
