"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ast_utils_1 = require("@schematics/angular/utility/ast-utils");
var change_1 = require("@schematics/angular/utility/change");
var ts = require("typescript");
var name_utils_1 = require("./name-utils");
var path = require("path");
// This should be moved to @schematics/angular once it allows to pass custom expressions as providers
function _addSymbolToNgModuleMetadata(source, ngModulePath, metadataField, expression) {
    var nodes = ast_utils_1.getDecoratorMetadata(source, 'NgModule', '@angular/core');
    var node = nodes[0]; // tslint:disable-line:no-any
    // Find the decorator declaration.
    if (!node) {
        return [];
    }
    // Get all the children property assignment of object literals.
    var matchingProperties = node.properties
        .filter(function (prop) { return prop.kind == ts.SyntaxKind.PropertyAssignment; })
        .filter(function (prop) {
        var name = prop.name;
        switch (name.kind) {
            case ts.SyntaxKind.Identifier:
                return name.getText(source) == metadataField;
            case ts.SyntaxKind.StringLiteral:
                return name.text == metadataField;
        }
        return false;
    });
    // Get the last node of the array literal.
    if (!matchingProperties) {
        return [];
    }
    if (matchingProperties.length == 0) {
        // We haven't found the field in the metadata declaration. Insert a new field.
        var expr = node;
        var position_1;
        var toInsert_1;
        if (expr.properties.length == 0) {
            position_1 = expr.getEnd() - 1;
            toInsert_1 = "  " + metadataField + ": [" + expression + "]\n";
        }
        else {
            node = expr.properties[expr.properties.length - 1];
            position_1 = node.getEnd();
            // Get the indentation of the last element, if any.
            var text = node.getFullText(source);
            if (text.match('^\r?\r?\n')) {
                toInsert_1 = "," + text.match(/^\r?\n\s+/)[0] + metadataField + ": [" + expression + "]";
            }
            else {
                toInsert_1 = ", " + metadataField + ": [" + expression + "]";
            }
        }
        var newMetadataProperty = new change_1.InsertChange(ngModulePath, position_1, toInsert_1);
        return [newMetadataProperty];
    }
    var assignment = matchingProperties[0];
    // If it's not an array, nothing we can do really.
    if (assignment.initializer.kind !== ts.SyntaxKind.ArrayLiteralExpression) {
        return [];
    }
    var arrLiteral = assignment.initializer;
    if (arrLiteral.elements.length == 0) {
        // Forward the property.
        node = arrLiteral;
    }
    else {
        node = arrLiteral.elements;
    }
    if (!node) {
        console.log('No app module found. Please add your new class to your component.');
        return [];
    }
    if (Array.isArray(node)) {
        var nodeArray = node;
        var symbolsArray = nodeArray.map(function (node) { return node.getText(); });
        if (symbolsArray.includes(expression)) {
            return [];
        }
        node = node[node.length - 1];
    }
    var toInsert;
    var position = node.getEnd();
    if (node.kind == ts.SyntaxKind.ObjectLiteralExpression) {
        // We haven't found the field in the metadata declaration. Insert a new
        // field.
        var expr = node;
        if (expr.properties.length == 0) {
            position = expr.getEnd() - 1;
            toInsert = "  " + metadataField + ": [" + expression + "]\n";
        }
        else {
            node = expr.properties[expr.properties.length - 1];
            position = node.getEnd();
            // Get the indentation of the last element, if any.
            var text = node.getFullText(source);
            if (text.match('^\r?\r?\n')) {
                toInsert = "," + text.match(/^\r?\n\s+/)[0] + metadataField + ": [" + expression + "]";
            }
            else {
                toInsert = ", " + metadataField + ": [" + expression + "]";
            }
        }
    }
    else if (node.kind == ts.SyntaxKind.ArrayLiteralExpression) {
        // We found the field but it's empty. Insert it just before the `]`.
        position--;
        toInsert = "" + expression;
    }
    else {
        // Get the indentation of the last element, if any.
        var text = node.getFullText(source);
        if (text.match(/^\r?\n/)) {
            toInsert = "," + text.match(/^\r?\n(\r?)\s+/)[0] + expression;
        }
        else {
            toInsert = ", " + expression;
        }
    }
    var insert = new change_1.InsertChange(ngModulePath, position, toInsert);
    return [insert];
}
function addParameterToConstructor(source, modulePath, opts) {
    var clazz = findClass(source, opts.className);
    var constructor = clazz.members.filter(function (m) { return m.kind === ts.SyntaxKind.Constructor; })[0];
    if (constructor) {
        throw new Error('Should be tested');
    }
    else {
        var methodHeader = "constructor(" + opts.param + ")";
        return addMethod(source, modulePath, {
            className: opts.className,
            methodHeader: methodHeader,
            body: null
        });
    }
}
exports.addParameterToConstructor = addParameterToConstructor;
function addMethod(source, modulePath, opts) {
    var clazz = findClass(source, opts.className);
    var body = opts.body
        ? "\n" + opts.methodHeader + " {\n" + offset(opts.body, 1, false) + "\n}\n"
        : "\n" + opts.methodHeader + " {}\n";
    var pos = clazz.members.length > 0 ? clazz.members.end : clazz.end - 1;
    return [new change_1.InsertChange(modulePath, clazz.end - 1, offset(body, 1, true))];
}
exports.addMethod = addMethod;
function removeFromNgModule(source, modulePath, property) {
    var nodes = ast_utils_1.getDecoratorMetadata(source, 'NgModule', '@angular/core');
    var node = nodes[0]; // tslint:disable-line:no-any
    // Find the decorator declaration.
    if (!node) {
        return [];
    }
    // Get all the children property assignment of object literals.
    var matchingProperty = getMatchingProperty(source, property);
    if (matchingProperty) {
        return [new change_1.RemoveChange(modulePath, matchingProperty.pos, matchingProperty.getFullText(source))];
    }
    else {
        return [];
    }
}
exports.removeFromNgModule = removeFromNgModule;
function findClass(source, className) {
    var nodes = ast_utils_1.getSourceNodes(source);
    var clazz = nodes.filter(function (n) { return n.kind === ts.SyntaxKind.ClassDeclaration && n.name.text === className; })[0];
    if (!clazz) {
        throw new Error("Cannot find class '" + className + "'");
    }
    return clazz;
}
function offset(text, numberOfTabs, wrap) {
    var lines = text
        .trim()
        .split('\n')
        .map(function (line) {
        var tabs = '';
        for (var c = 0; c < numberOfTabs; ++c) {
            tabs += '  ';
        }
        return "" + tabs + line;
    })
        .join('\n');
    return wrap ? "\n" + lines + "\n" : lines;
}
exports.offset = offset;
function addImportToModule(source, modulePath, symbolName) {
    return _addSymbolToNgModuleMetadata(source, modulePath, 'imports', symbolName);
}
exports.addImportToModule = addImportToModule;
function getBootstrapComponent(source, moduleClassName) {
    var bootstrap = getMatchingProperty(source, 'bootstrap');
    if (!bootstrap) {
        throw new Error("Cannot find bootstrap components in '" + moduleClassName + "'");
    }
    var c = bootstrap.getChildren();
    var nodes = c[c.length - 1].getChildren();
    var bootstrapComponent = nodes.slice(1, nodes.length - 1)[0];
    if (!bootstrapComponent) {
        throw new Error("Cannot find bootstrap components in '" + moduleClassName + "'");
    }
    return bootstrapComponent.getText();
}
exports.getBootstrapComponent = getBootstrapComponent;
function getMatchingProperty(source, property) {
    var nodes = ast_utils_1.getDecoratorMetadata(source, 'NgModule', '@angular/core');
    var node = nodes[0]; // tslint:disable-line:no-any
    if (!node)
        return null;
    // Get all the children property assignment of object literals.
    return (node.properties
        .filter(function (prop) { return prop.kind == ts.SyntaxKind.PropertyAssignment; })
        .filter(function (prop) {
        var name = prop.name;
        switch (name.kind) {
            case ts.SyntaxKind.Identifier:
                return name.getText(source) === property;
            case ts.SyntaxKind.StringLiteral:
                return name.text === property;
        }
        return false;
    })[0]);
}
function getImport(source, predicate) {
    var allImports = ast_utils_1.findNodes(source, ts.SyntaxKind.ImportDeclaration);
    var matching = allImports.filter(function (i) { return predicate(i.moduleSpecifier.getText()); });
    return matching.map(function (i) {
        var moduleSpec = i.moduleSpecifier.getText().substring(1, i.moduleSpecifier.getText().length - 1);
        var t = i.importClause.namedBindings.getText();
        var bindings = t
            .replace('{', '')
            .replace('}', '')
            .split(',')
            .map(function (q) { return q.trim(); });
        return { moduleSpec: moduleSpec, bindings: bindings };
    });
}
exports.getImport = getImport;
function addProviderToModule(source, modulePath, symbolName) {
    return _addSymbolToNgModuleMetadata(source, modulePath, 'providers', symbolName);
}
exports.addProviderToModule = addProviderToModule;
function addDeclarationToModule(source, modulePath, symbolName) {
    return _addSymbolToNgModuleMetadata(source, modulePath, 'declarations', symbolName);
}
exports.addDeclarationToModule = addDeclarationToModule;
function addEntryComponents(source, modulePath, symbolName) {
    return _addSymbolToNgModuleMetadata(source, modulePath, 'entryComponents', symbolName);
}
exports.addEntryComponents = addEntryComponents;
function insert(host, modulePath, changes) {
    var recorder = host.beginUpdate(modulePath);
    for (var _i = 0, changes_1 = changes; _i < changes_1.length; _i++) {
        var change = changes_1[_i];
        if (change instanceof change_1.InsertChange) {
            recorder.insertLeft(change.pos, change.toAdd);
        }
        else if (change instanceof change_1.RemoveChange) {
            recorder.remove(change.pos - 1, change.toRemove.length + 1);
        }
        else if (change instanceof change_1.NoopChange) {
            // do nothing
        }
        else {
            throw new Error("Unexpected Change '" + change + "'");
        }
    }
    host.commitUpdate(recorder);
}
exports.insert = insert;
function getAppConfig(host, name) {
    if (!host.exists('.angular-cli.json')) {
        throw new Error('Missing .angular-cli.json');
    }
    var angularCliJson = JSON.parse(host.read('.angular-cli.json').toString('utf-8'));
    var apps = angularCliJson.apps;
    if (!apps || apps.length === 0) {
        throw new Error("Cannot find app '" + name + "'");
    }
    if (name) {
        var appConfig = apps.filter(function (a) { return a.name === name; })[0];
        if (!appConfig) {
            throw new Error("Cannot find app '" + name + "'");
        }
        else {
            return appConfig;
        }
    }
    return apps[0];
}
exports.getAppConfig = getAppConfig;
function readBootstrapInfo(host, app) {
    var config = getAppConfig(host, app);
    var mainPath = path.join(config.root, config.main);
    if (!host.exists(mainPath)) {
        throw new Error('Main file cannot be located');
    }
    var mainSource = host.read(mainPath).toString('utf-8');
    var main = ts.createSourceFile(mainPath, mainSource, ts.ScriptTarget.Latest, true);
    var moduleImports = getImport(main, function (s) { return s.indexOf('.module') > -1; });
    if (moduleImports.length !== 1) {
        throw new Error("main.ts can only import a single module");
    }
    var moduleImport = moduleImports[0];
    var moduleClassName = moduleImport.bindings.filter(function (b) { return b.endsWith('Module'); })[0];
    var modulePath = path.join(path.dirname(mainPath), moduleImport.moduleSpec) + ".ts";
    if (!host.exists(modulePath)) {
        throw new Error("Cannot find '" + modulePath + "'");
    }
    var moduleSourceText = host.read(modulePath).toString('utf-8');
    var moduleSource = ts.createSourceFile(modulePath, moduleSourceText, ts.ScriptTarget.Latest, true);
    var bootstrapComponentClassName = getBootstrapComponent(moduleSource, moduleClassName);
    var bootstrapComponentFileName = "./" + path.join(path.dirname(moduleImport.moduleSpec), name_utils_1.toFileName(bootstrapComponentClassName.substring(0, bootstrapComponentClassName.length - 9)) + ".component");
    return {
        moduleSpec: moduleImport.moduleSpec,
        mainPath: mainPath,
        modulePath: modulePath,
        moduleSource: moduleSource,
        moduleClassName: moduleClassName,
        bootstrapComponentClassName: bootstrapComponentClassName,
        bootstrapComponentFileName: bootstrapComponentFileName
    };
}
exports.readBootstrapInfo = readBootstrapInfo;
