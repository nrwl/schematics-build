"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var testing_1 = require("@angular-devkit/schematics/testing");
var path = require("path");
var schematics_1 = require("@angular-devkit/schematics");
var testing_utils_1 = require("../testing-utils");
var test_1 = require("@schematics/angular/utility/test");
describe('lib', function () {
    var schematicRunner = new testing_1.SchematicTestRunner('@nrwl/schematics', path.join(__dirname, '../collection.json'));
    var appTree;
    beforeEach(function () {
        appTree = new schematics_1.VirtualTree();
        appTree = testing_utils_1.createEmptyWorkspace(appTree);
    });
    it('should update angular-cli.json', function () {
        var tree = schematicRunner.runSchematic('lib', { name: 'myLib' }, appTree);
        var updatedAngularCLIJson = JSON.parse(test_1.getFileContent(tree, '/.angular-cli.json'));
        expect(updatedAngularCLIJson.apps).toEqual([
            {
                appRoot: '',
                name: 'my-lib',
                root: 'libs/my-lib/src',
                test: '../../../test.js'
            }
        ]);
    });
    it('should generate files', function () {
        var tree = schematicRunner.runSchematic('lib', { name: 'myLib' }, appTree);
        expect(tree.exists('libs/my-lib/src/my-lib.ts')).toBeTruthy();
        expect(tree.exists('libs/my-lib/src/my-lib.spec.ts')).toBeTruthy();
        expect(tree.exists('libs/my-lib/index.ts')).toBeTruthy();
        expect(test_1.getFileContent(tree, 'libs/my-lib/src/my-lib.ts')).toContain('class MyLib');
    });
    it('should generate files (--ngmodule)', function () {
        var tree = schematicRunner.runSchematic('lib', { name: 'myLib', ngmodule: true }, appTree);
        expect(tree.exists('libs/my-lib/src/my-lib.module.ts')).toBeTruthy();
        expect(tree.exists('libs/my-lib/src/my-lib.module.spec.ts')).toBeTruthy();
        expect(tree.exists('libs/my-lib/index.ts')).toBeTruthy();
        expect(test_1.getFileContent(tree, 'libs/my-lib/src/my-lib.module.ts')).toContain('class MyLibModule');
    });
});
