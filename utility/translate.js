const de = require("../locales/de.json");
const en = require("../locales/en.json");

function translate(lang, string){
    var locale = "";

    switch (lang){
      case "en":
        locale = en.getValue(string);
        break;
      case "de":
        locale = de.getValue(string);
        break;
      default:
        break;
    }

    return locale;
}

module.exports.translate = translate;