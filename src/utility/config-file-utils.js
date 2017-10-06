"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function addApp(apps, newApp) {
    if (!apps) {
        apps = [];
    }
    apps.push(newApp);
    apps.sort(function (a, b) {
        if (a.main && !b.main)
            return -1;
        if (!a.main && b.main)
            return 1;
        if (a.name > b.name)
            return 1;
        return -1;
    });
    return apps;
}
exports.addApp = addApp;
