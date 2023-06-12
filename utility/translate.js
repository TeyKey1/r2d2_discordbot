const de = require("../locales/de.json");
const en = require("../locales/en.json");
const _ = require("lodash");

function translate(lang, string) {
  let locale = "";

  switch (lang) {
    case "en":
      locale = _.get(en, string, "Failed to load translation");
      break;
    case "de":
      locale = _.get(de, string, "Failed to load translation");
      break;
    default:
      break;
  }

  return locale;
}

module.exports.translate = translate;
