const de = require("../locales/de.json");
const en = require("../locales/en.json");

const availableLanguages = ["en", "de"];

function translate(lang, string){
    var locale = "";

    switch (lang){
      case "en":
        locale = en[string];
        break;
      case "de":
        locale = de[string];
        break;
      default:
        break;
    }

    return locale;
}

function getLanguages(language){

  if(availableLanguages.includes(language)){
    return language;
  }

  return availableLanguages;
}

module.exports.translate = translate;
module.exports.getLanguages = getLanguages;