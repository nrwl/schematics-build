"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function names(name) {
    return {
        name: name,
        className: toClassName(name),
        propertyName: toPropertyName(name),
        fileName: toFileName(name)
    };
}
exports.names = names;
function toClassName(str) {
    return toCapitalCase(toPropertyName(str));
}
exports.toClassName = toClassName;
function toPropertyName(s) {
    return s
        .replace(/(-|_|\.|\s)+(.)?/g, function (_, __, chr) { return (chr ? chr.toUpperCase() : ''); })
        .replace(/^([A-Z])/, function (m) { return m.toLowerCase(); });
}
exports.toPropertyName = toPropertyName;
function toFileName(s) {
    return s
        .replace(/([a-z\d])([A-Z])/g, '$1_$2')
        .toLowerCase()
        .replace(/[ _]/g, '-');
}
exports.toFileName = toFileName;
function toCapitalCase(s) {
    return s.charAt(0).toUpperCase() + s.substr(1);
}
