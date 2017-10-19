"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lib_versions_1 = require("./lib-versions");
function addUpgradeToPackageJson() {
    return function (host) {
        if (!host.exists('package.json'))
            return host;
        var sourceText = host.read('package.json').toString('utf-8');
        var json = JSON.parse(sourceText);
        if (!json['dependencies']) {
            json['dependencies'] = {};
        }
        if (!json['dependencies']['@angular/upgrade']) {
            json['dependencies']['@angular/upgrade'] = json['dependencies']['@angular/core'];
        }
        if (!json['dependencies']['angular']) {
            json['dependencies']['angular'] = lib_versions_1.angularJsVersion;
        }
        host.overwrite('package.json', JSON.stringify(json, null, 2));
        return host;
    };
}
exports.addUpgradeToPackageJson = addUpgradeToPackageJson;
