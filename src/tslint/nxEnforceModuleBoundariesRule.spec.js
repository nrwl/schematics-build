"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var nxEnforceModuleBoundariesRule_1 = require("./nxEnforceModuleBoundariesRule");
describe('Enforce Module Boundaries', function () {
    it('should not error when everything is in order', function () {
        var failures = runRule({ npmScope: 'mycompany' }, "\n      import '@mycompany/mylib';\n      import '../blah';\n    ");
        expect(failures.length).toEqual(0);
    });
    it('should error on a relative import of a library', function () {
        var failures = runRule({}, "import '../../../libs/mylib';");
        expect(failures.length).toEqual(1);
        expect(failures[0].getFailure()).toEqual('relative imports of libraries are forbidden');
    });
    it('should error about deep imports into libraries', function () {
        var failures = runRule({ npmScope: 'mycompany' }, "import '@mycompany/mylib/blah';");
        expect(failures.length).toEqual(1);
        expect(failures[0].getFailure()).toEqual('deep imports into libraries are forbidden');
    });
    it('should error on importing a lazy-loaded library', function () {
        var failures = runRule({ npmScope: 'mycompany', lazyLoad: ['mylib'] }, "import '@mycompany/mylib';");
        expect(failures.length).toEqual(1);
        expect(failures[0].getFailure()).toEqual('import of lazy-loaded libraries are forbidden');
    });
});
function runRule(ruleArguments, content) {
    var options = { ruleArguments: [ruleArguments], ruleSeverity: 'error', ruleName: 'enforceModuleBoundaries' };
    var sourceFile = ts.createSourceFile('proj/apps/myapp/src/main.ts', content, ts.ScriptTarget.Latest, true);
    var rule = new nxEnforceModuleBoundariesRule_1.Rule(options, 'proj');
    return rule.apply(sourceFile);
}
