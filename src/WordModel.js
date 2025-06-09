import mongoose from "mongoose"

const wordSchema = new mongoose.Schema(
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

const Word = new mongoose.model("Word", wordSchema);

export default Word;
