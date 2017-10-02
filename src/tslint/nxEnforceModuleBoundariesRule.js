"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var Lint = require("tslint");
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule(options, path) {
        var _this = _super.call(this, options) || this;
        _this.path = path;
        if (!path) {
            _this.path = process.cwd();
        }
        return _this;
    }
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithWalker(new EnforceModuleBoundariesWalker(sourceFile, this.getOptions(), this.path));
    };
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
var EnforceModuleBoundariesWalker = (function (_super) {
    __extends(EnforceModuleBoundariesWalker, _super);
    function EnforceModuleBoundariesWalker(sourceFile, options, projectPath) {
        var _this = _super.call(this, sourceFile, options) || this;
        _this.projectPath = projectPath;
        return _this;
    }
    EnforceModuleBoundariesWalker.prototype.visitImportDeclaration = function (node) {
        var npmScope = "@" + this.getOptions()[0].npmScope;
        var lazyLoad = this.getOptions()[0].lazyLoad;
        var imp = node.moduleSpecifier.getText().substring(1, node.moduleSpecifier.getText().length - 1);
        var impParts = imp.split(path.sep);
        if (impParts[0] === npmScope && impParts.length > 2) {
            this.addFailureAt(node.getStart(), node.getWidth(), 'deep imports into libraries are forbidden');
        }
        else if (impParts[0] === npmScope && impParts.length === 2 && lazyLoad && lazyLoad.indexOf(impParts[1]) > -1) {
            this.addFailureAt(node.getStart(), node.getWidth(), 'import of lazy-loaded libraries are forbidden');
        }
        else if (this.isRelative(imp) && this.isRelativeImportIntoAnotherProject(imp)) {
            this.addFailureAt(node.getStart(), node.getWidth(), 'relative imports of libraries are forbidden');
        }
        _super.prototype.visitImportDeclaration.call(this, node);
    };
    EnforceModuleBoundariesWalker.prototype.isRelativeImportIntoAnotherProject = function (imp) {
        var sourceFile = this.getSourceFile().fileName.substring(this.projectPath.length);
        var targetFile = path.resolve(path.dirname(sourceFile), imp);
        if (this.workspacePath(sourceFile) && this.workspacePath(targetFile)) {
            if (this.parseProject(sourceFile) !== this.parseProject(targetFile)) {
                return true;
            }
        }
        return false;
    };
    EnforceModuleBoundariesWalker.prototype.workspacePath = function (s) {
        return s.startsWith('/apps/') || s.startsWith('/libs/');
    };
    EnforceModuleBoundariesWalker.prototype.parseProject = function (s) {
        var rest = s.substring(6);
        var r = rest.split(path.sep);
        return r[0];
    };
    EnforceModuleBoundariesWalker.prototype.isRelative = function (s) {
        return s.startsWith('.');
    };
    return EnforceModuleBoundariesWalker;
}(Lint.RuleWalker));
