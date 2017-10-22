"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var schematics_1 = require("@angular-devkit/schematics");
var name_utils_1 = require("../utility/name-utils");
var path = require("path");
var ts = require("typescript");
var ast_utils_1 = require("../utility/ast-utils");
var route_utils_1 = require("@schematics/angular/utility/route-utils");
var lib_versions_1 = require("../utility/lib-versions");
function addImportsToModule(name, options) {
    return function (host) {
        if (options.onlyAddFiles) {
            return host;
        }
        if (!host.exists(options.module)) {
            throw new Error('Specified module does not exist');
        }
        var modulePath = options.module;
        var sourceText = host.read(modulePath).toString('utf-8');
        var source = ts.createSourceFile(modulePath, sourceText, ts.ScriptTarget.Latest, true);
        if (options.onlyEmptyRoot) {
            ast_utils_1.insert(host, modulePath, [
                route_utils_1.insertImport(source, modulePath, 'StoreModule', '@ngrx/store'),
                route_utils_1.insertImport(source, modulePath, 'EffectsModule', '@ngrx/effects'),
                route_utils_1.insertImport(source, modulePath, 'StoreDevtoolsModule', '@ngrx/store-devtools'),
                route_utils_1.insertImport(source, modulePath, 'environment', '../environments/environment')
            ].concat(ast_utils_1.addImportToModule(source, modulePath, "StoreModule.forRoot({})"), ast_utils_1.addImportToModule(source, modulePath, "EffectsModule.forRoot([])"), ast_utils_1.addImportToModule(source, modulePath, "!environment.production ? StoreDevtoolsModule.instrument() : []")));
            return host;
        }
        else {
            var reducerPath = "./+state/" + name_utils_1.toFileName(name) + ".reducer";
            var effectsPath = "./+state/" + name_utils_1.toFileName(name) + ".effects";
            var initPath = "./+state/" + name_utils_1.toFileName(name) + ".init";
            var reducerName = name_utils_1.toPropertyName(name) + "Reducer";
            var effectsName = name_utils_1.toClassName(name) + "Effects";
            var initName = name_utils_1.toPropertyName(name) + "InitialState";
            var common = [
                route_utils_1.insertImport(source, modulePath, 'StoreModule', '@ngrx/store'),
                route_utils_1.insertImport(source, modulePath, 'EffectsModule', '@ngrx/effects'),
                route_utils_1.insertImport(source, modulePath, reducerName, reducerPath),
                route_utils_1.insertImport(source, modulePath, initName, initPath),
                route_utils_1.insertImport(source, modulePath, effectsName, effectsPath)
            ].concat(ast_utils_1.addProviderToModule(source, modulePath, effectsName));
            if (options.root) {
                ast_utils_1.insert(host, modulePath, common.concat([
                    route_utils_1.insertImport(source, modulePath, 'StoreDevtoolsModule', '@ngrx/store-devtools'),
                    route_utils_1.insertImport(source, modulePath, 'environment', '../environments/environment')
                ], ast_utils_1.addImportToModule(source, modulePath, "StoreModule.forRoot({" + name_utils_1.toPropertyName(name) + ": " + reducerName + "}, {initialState: {" + name_utils_1.toPropertyName(name) + ": " + initName + "}})"), ast_utils_1.addImportToModule(source, modulePath, "EffectsModule.forRoot([" + effectsName + "])"), ast_utils_1.addImportToModule(source, modulePath, "!environment.production ? StoreDevtoolsModule.instrument() : []")));
            }
            else {
                ast_utils_1.insert(host, modulePath, common.concat(ast_utils_1.addImportToModule(source, modulePath, "StoreModule.forFeature('" + name_utils_1.toPropertyName(name) + "', " + reducerName + ", {initialState: " + initName + "})"), ast_utils_1.addImportToModule(source, modulePath, "EffectsModule.forFeature([" + effectsName + "])")));
            }
            return host;
        }
    };
}
function addNgRxToPackageJson() {
    return function (host) {
        if (!host.exists('package.json'))
            return host;
        var sourceText = host.read('package.json').toString('utf-8');
        var json = JSON.parse(sourceText);
        if (!json['dependencies']) {
            json['dependencies'] = {};
        }
        if (!json['dependencies']['@ngrx/store']) {
            json['dependencies']['@ngrx/store'] = lib_versions_1.ngrxVersion;
        }
        if (!json['dependencies']['@ngrx/router-store']) {
            json['dependencies']['@ngrx/router-store'] = lib_versions_1.ngrxVersion;
        }
        if (!json['dependencies']['@ngrx/effects']) {
            json['dependencies']['@ngrx/effects'] = lib_versions_1.ngrxVersion;
        }
        if (!json['dependencies']['@ngrx/store-devtools']) {
            json['dependencies']['@ngrx/store-devtools'] = lib_versions_1.ngrxVersion;
        }
        host.overwrite('package.json', JSON.stringify(json, null, 2));
        return host;
    };
}
function default_1(options) {
    var name = options.name;
    var moduleDir = path.dirname(options.module);
    if (options.onlyEmptyRoot) {
        return schematics_1.chain([addImportsToModule(name, options), options.skipPackageJson ? schematics_1.noop() : addNgRxToPackageJson()]);
    }
    else {
        var templateSource = schematics_1.apply(schematics_1.url('./files'), [schematics_1.template(__assign({}, options, { tmpl: '' }, name_utils_1.names(name))), schematics_1.move(moduleDir)]);
        return schematics_1.chain([
            schematics_1.branchAndMerge(schematics_1.chain([schematics_1.mergeWith(templateSource)])),
            addImportsToModule(name, options),
            options.skipPackageJson ? schematics_1.noop() : addNgRxToPackageJson()
        ]);
    }
}
exports.default = default_1;
