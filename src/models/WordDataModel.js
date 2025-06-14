import mongoose from "mongoose"

const wordDataSchema = new mongoose.Schema(
  {
    DLE: {
      word: String,
      terms: [
        {
          etymology: String,
          entries: [
            {
              POS: String,
              definition: String,
              exampleSentence: String,
              synonyms: [String],
              antonyms: [String]
            }
          ],
          phrases: [
            {
              phrase: String,
              entries: [
                {
                  POS: String,
                  definition: String,
                  exampleSentence: String
                },
              ]
            },
          ]
        }
      ],
      relatedTerms: [
        [String]
      ]
    },
    DPD: {},
    DAMER: {}
  },
{collection: "words"})

const WordData = new mongoose.model("WordData", wordDataSchema);

export default WordData;
