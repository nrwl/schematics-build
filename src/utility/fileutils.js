"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
function updateJsonFile(path, callback) {
    var json = JSON.parse(fs.readFileSync(path, 'utf-8'));
    callback(json);
    fs.writeFileSync(path, JSON.stringify(json, null, 2));
}
exports.updateJsonFile = updateJsonFile;
