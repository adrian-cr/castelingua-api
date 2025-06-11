import * as cheerio from "cheerio";
import  {parser}  from "./parser.js";

export const wordFetcher = async word => {
  const response = await fetch(`https://dle.rae.es/${encodeURIComponent(word)}`);
  const html = await response.text();
  if (response.status===200) {
    //console.log(parser(html));
    return html;
  }
  else {
    console.log("Resource not found");
    return null;
  }
}

wordFetcher("basto");
