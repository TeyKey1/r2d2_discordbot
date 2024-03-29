const fs = require("fs");

function saveData(data, filePath) {
    const json = JSON.stringify([...data]);
    fs.writeFile(filePath, json, "utf-8", (err) => {
        if (err) {
            throw new Error("Failed to save file: " + err);
        }
    });
}

function readDataSync(filePath) {
    let data = new Map();

    if (fs.existsSync(filePath)) {
        const json = fs.readFileSync(filePath, "utf-8");
        data = new Map(JSON.parse(json));
    }

    return data;
}

module.exports.saveData = saveData;
module.exports.readDataSync = readDataSync;