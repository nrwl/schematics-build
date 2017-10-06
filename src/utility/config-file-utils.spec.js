"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var config_file_utils_1 = require("./config-file-utils");
describe('configFileUtils', function () {
    describe('sortApps', function () {
        it('should handle undefined', function () {
            expect(config_file_utils_1.addApp(undefined, { name: 'a' })).toEqual([{ name: 'a' }]);
        });
        it('should handle an empty array', function () {
            expect(config_file_utils_1.addApp([], { name: 'a' })).toEqual([{ name: 'a' }]);
        });
        it('should sort apps by name', function () {
            expect(config_file_utils_1.addApp([{ name: 'a' }, { name: 'b' }], { name: 'c' })).toEqual([{ name: 'a' }, { name: 'b' }, { name: 'c' }]);
        });
        it('should prioritize apps with "main" defined', function () {
            expect(config_file_utils_1.addApp([{ name: 'c' }, { name: 'a' }, { name: 'a', main: 'a' }], { name: 'b', main: 'b' })).toEqual([
                { name: 'a', main: 'a' }, { name: 'b', main: 'b' }, { name: 'a' }, { name: 'c' }
            ]);
        });
    });
});
