import * as cheerio from "cheerio";

export const fetchDLEdata = async word => {
  const response = await fetch(`https://dle.rae.es/${encodeURIComponent(word)}`);
  const html = await response.text();
  if (response.status===200) {
    return html;
  }
  else {
    console.log("Resource not found");
    return null;
  }
}

export const fetchDPDdata = async word => {
  const response = await fetch(`https://www.rae.es/dpd/${encodeURIComponent(word)}`);
  const html = await response.text();
  if (response.status===200) {
    return html;
  }
  else {
    console.log("Resource not found");
    return null;
  }
}

export const fetchGTGdata = async word => {
  const response = await fetch(`https://www.rae.es/gtg/${encodeURIComponent(word)}`);
  const html = await response.text();
  if (response.status===200) {
    return html;
  }
  else {
    console.log("Resource not found");
    return null;
  }
}
