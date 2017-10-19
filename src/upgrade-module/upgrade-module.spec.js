"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var testing_1 = require("@angular-devkit/schematics/testing");
var path = require("path");
var schematics_1 = require("@angular-devkit/schematics");
var testing_utils_1 = require("../testing-utils");
var test_1 = require("@schematics/angular/utility/test");
describe('upgrade-module', function () {
    var schematicRunner = new testing_1.SchematicTestRunner('@nrwl/schematics', path.join(__dirname, '../collection.json'));
    var appTree;
    beforeEach(function () {
        appTree = new schematics_1.VirtualTree();
        appTree = testing_utils_1.createEmptyWorkspace(appTree);
        appTree = testing_utils_1.createApp(appTree, 'myapp');
    });
    it('should update the bootstrap logic', function () {
        var tree = schematicRunner.runSchematic('upgrade-module', {
            name: 'legacy'
        }, appTree);
        var appModule = test_1.getFileContent(tree, '/apps/myapp/src/app/app.module.ts');
        expect(appModule).toContain("this.upgrade.bootstrap(document.body, ['downgraded', 'legacy'])");
        expect(appModule).not.toContain("bootstrap:");
        var legacySetup = test_1.getFileContent(tree, '/apps/myapp/src/legacy-setup.ts');
        expect(legacySetup).toContain("import 'legacy';");
        expect(tree.exists('/apps/myapp/src/hybrid.spec.ts')).toBeTruthy();
    });
    it('should update package.json by default', function () {
        appTree.overwrite("/package.json", JSON.stringify({
            dependencies: {
                '@angular/core': '4.4.4'
            }
        }));
        var tree = schematicRunner.runSchematic('upgrade-module', {
            name: 'legacy'
        }, appTree);
        var packageJson = JSON.parse(test_1.getFileContent(tree, '/package.json'));
        expect(packageJson.dependencies['@angular/upgrade']).toEqual('4.4.4');
        expect(packageJson.dependencies['angular']).toBeDefined();
    });
    it('should not package.json when --skipPackageJson=true', function () {
        appTree.overwrite("/package.json", JSON.stringify({
            dependencies: {
                '@angular/core': '4.4.4'
            }
        }));
        var tree = schematicRunner.runSchematic('upgrade-module', {
            name: 'legacy',
            skipPackageJson: true
        }, appTree);
        var packageJson = JSON.parse(test_1.getFileContent(tree, '/package.json'));
        expect(packageJson.dependencies['@angular/upgrade']).not.toBeDefined();
    });
    it('should add router configuration when --router=true', function () {
        var tree = schematicRunner.runSchematic('upgrade-module', {
            name: 'legacy',
            router: true
        }, appTree);
        var legacySetup = test_1.getFileContent(tree, '/apps/myapp/src/legacy-setup.ts');
        expect(legacySetup).toContain("setUpLocationSync");
    });
    it('should support custom angularJsImport', function () {
        var tree = schematicRunner.runSchematic('upgrade-module', {
            name: 'legacy',
            angularJsImport: 'legacy-app'
        }, appTree);
        var legacySetup = test_1.getFileContent(tree, '/apps/myapp/src/legacy-setup.ts');
        expect(legacySetup).toContain("import 'legacy-app';");
        expect(legacySetup).not.toContain("import 'legacy';");
    });
});
