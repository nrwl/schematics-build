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
function addImportsToModule(name, options) {
    return function (host) {
        if (options.skipImport) {
            return host;
        }
        if (!host.exists(options.module)) {
            throw new Error('Specified module does not exist');
        }
        var modulePath = options.module;
        var sourceText = host.read(modulePath).toString('utf-8');
        var source = ts.createSourceFile(modulePath, sourceText, ts.ScriptTarget.Latest, true);
        if (options.emptyRoot) {
            var reducer = "StoreModule.forRoot({})";
            ast_utils_1.insert(host, modulePath, [
                route_utils_1.insertImport(source, modulePath, 'StoreModule', '@ngrx/store')
            ].concat(ast_utils_1.addImportToModule(source, modulePath, reducer)));
            return host;
        }
        else {
            var reducerPath = "./+state/" + name_utils_1.toFileName(name) + ".reducer";
            var effectsPath = "./+state/" + name_utils_1.toFileName(name) + ".effects";
            var initPath = "./+state/" + name_utils_1.toFileName(name) + ".init";
            var reducerName = name_utils_1.toPropertyName(name) + "Reducer";
            var effectsName = name_utils_1.toClassName(name) + "Effects";
            var initName = name_utils_1.toPropertyName(name) + "InitialState";
            var effects = options.root ? "EffectsModule.forRoot([" + effectsName + "])" : "EffectsModule.forFeature([" + effectsName + "])";
            var reducer = options.root ?
                "StoreModule.forRoot(" + reducerName + ", {initialState: " + initName + "})" :
                "StoreModule.forFeature('" + name_utils_1.toPropertyName(name) + "', " + reducerName + ", {initialState: " + initName + "})";
            ast_utils_1.insert(host, modulePath, [
                route_utils_1.insertImport(source, modulePath, 'StoreModule', '@ngrx/store'),
                route_utils_1.insertImport(source, modulePath, 'EffectsModule', '@ngrx/effects'),
                route_utils_1.insertImport(source, modulePath, reducerName, reducerPath),
                route_utils_1.insertImport(source, modulePath, initName, initPath),
                route_utils_1.insertImport(source, modulePath, effectsName, effectsPath)
            ].concat(ast_utils_1.addImportToModule(source, modulePath, reducer), ast_utils_1.addImportToModule(source, modulePath, effects), ast_utils_1.addProviderToModule(source, modulePath, effectsName)));
            return host;
        }
    };
}
function default_1(options) {
    var name = path.basename(options.module, '.module.ts');
    var moduleDir = path.dirname(options.module);
    if (options.emptyRoot) {
        return schematics_1.chain([addImportsToModule(name, options)]);
    }
    else {
        var templateSource = schematics_1.apply(schematics_1.url('./files'), [schematics_1.template(__assign({}, options, { tmpl: '' }, name_utils_1.names(name))), schematics_1.move(moduleDir)]);
        return schematics_1.chain([schematics_1.branchAndMerge(schematics_1.chain([schematics_1.mergeWith(templateSource)])), addImportsToModule(name, options)]);
    }
}
exports.default = default_1;
