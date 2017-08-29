"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ast_utils_1 = require("@schematics/angular/utility/ast-utils");
var change_1 = require("@schematics/angular/utility/change");
var ts = require("typescript");
// This should be moved to @schematics/angular once it allows to pass custom expressions as providers
function _addSymbolToNgModuleMetadata(source, ngModulePath, metadataField, expression) {
    var nodes = ast_utils_1.getDecoratorMetadata(source, 'NgModule', '@angular/core');
    var node = nodes[0]; // tslint:disable-line:no-any
    // Find the decorator declaration.
    if (!node) {
        return [];
    }
    // Get all the children property assignment of object literals.
    var matchingProperties = node
        .properties
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
function addImportToModule(source, modulePath, symbolName) {
    return _addSymbolToNgModuleMetadata(source, modulePath, 'imports', symbolName);
}
exports.addImportToModule = addImportToModule;
function addProviderToModule(source, modulePath, symbolName) {
    return _addSymbolToNgModuleMetadata(source, modulePath, 'providers', symbolName);
}
exports.addProviderToModule = addProviderToModule;
function insert(host, modulePath, changes) {
    var recorder = host.beginUpdate(modulePath);
    for (var _i = 0, changes_1 = changes; _i < changes_1.length; _i++) {
        var change = changes_1[_i];
        if (change instanceof change_1.InsertChange) {
            recorder.insertLeft(change.pos, change.toAdd);
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
