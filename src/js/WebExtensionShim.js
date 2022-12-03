// modified from https://github.com/Filter-Bubble/Web-Extension-Shim

var modernizr = { // see https://github.com/Modernizr/Modernizr/blob/master/feature-detects/storage/localstorage.js
    existsLocalStorage: function () {
        var test = "test";
        try {
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }
};
if (modernizr.existsLocalStorage()) {
    var shimStorage = localStorage;
} else {
    var shimStorage = {};
}

let localManifestJson = null;
if(window.manifestJson != null && window.manifestJson != undefined && typeof window.manifestJson == "object") {
    localManifestJson = window.manifestJson;
} else {
    (async function () {
        let response = await fetch("manifest-old.json");
        let json = await response.json();

        window.manifestJson = localManifestJson = await json;
        console.log(await json);
    })();
}
var chrome, browser;
chrome = browser = {
    i18n: {
        getAcceptLanguages: function (callback) {
            var languages = ["en-US", "en-GB", "en"];
            if (typeof callback !== "undefined") {
                callback(languages);
            }
        },
        getMessage: function (messageName, substitutions) {
            var messageObject = messagesJson[messageName];
            if (typeof messageObject == "undefined") {
                return "";
            }
            var message = messageObject["message"];
            if (typeof message == "undefined") {
                return "";
            }
            return message;
        },
        getUILanguage: function () {
            return "en-US";
        },
        detectLanguage: function (text, callback) {
            if (typeof callback !== "undefined") {
                callback("en-US");
            }
        }
    },
    storage: {
        local: {
            set: function (items, callback) {
                Object.entries(items).map(item => shimStorage[item[0]] = item[1]);
                if (typeof callback !== "undefined") {
                    callback();
                }
            },
            get: function (keys, callback) {
                var results = {};
                if (keys == null) {
                    results = shimStorage;
                } else if (typeof keys == "string") {
                    value = shimStorage[keys];
                    if (typeof value !== "undefined") {
                        results[keys] = value;
                    }
                } else if (Array.isArray(keys)) {
                    for (var key in keys) {
                        value = shimStorage[key];
                        if (typeof value !== "undefined") {
                            results[key] = value;
                        }
                    }
                } else if (keys instanceof Object) {
                    for (var key in keys) {
                        value = shimStorage[key];
                        if (typeof value !== "undefined") {
                            results[key] = value;
                        } else {
                            results[key] = keys[key];
                        }
                    }
                }
                callback(results);
            }
        },
        sync: {
            set: function (...params) {
                browser.storage.local.set(...params);
            },
            get: function (...params) {
                return browser.storage.local.get(...params);
            },
        },
    },
    history: {
        search: function (query, callback) {
            if ("startTime" in query) {
                var result = historyItemsJson.filter(item => !("lastVisitTime" in item) || item.lastVisitTime > query.startTime);
            } else {
                var result = historyItemsJson;
            }
            callback(result);
        },
        deleteUrl: function (details, callback) {
            if ("url" in details) {
                var itemId = historyItemsJson.find(item => "url" in item && item.url === details.url).id;
                if (itemId) {
                    historyItemsJson = historyItemsJson.filter(item => item.id !== itemId);
                    visitItemsJson = visitItemsJson.filter(item => item.id !== itemId);
                }
            }
            if (typeof callback !== "undefined") {
                callback();
            }
        },
        getVisits: function (details, callback) {
            if ("url" in details) {
                var itemId = historyItemsJson.find(item => "url" in item && item.url === details.url).id;
                if (itemId) {
                    var results = visitItemsJson.filter(item => "id" in item && item.id === itemId);
                    callback(results);
                }
            }
        }
    },
    runtime: {
        getManifest: function () {
            return localManifestJson || window.manifestJson;
        }
    },
    browserAction: {
        onClicked: {
            addListener: function (tabId, callback) {
                console.error("chrome.browserAction.onClicked.addListener not implemented");
            }
        }
    },
    extension: {
        getURL: function (path) {
            console.error("chrome.extension.getURL not implemented");
        }
    },
    tabs: {
        query: function (queryInfo, callback) {
            console.error("chrome.tabs.query not implemented");
        },
        update: function (tabId, updateProperties, callback) {
            console.error("chrome.tabs.update not implemented");
        },
        create: function (createProperties, callback) {
            console.error("chrome.tabs.update not implemented");
        }
    },
    app: {
        window: {
            current: function() {
                return {
                    fullscreen: function() {
                        let el = document.documentElement;
                        if(el.requestFullscreen == undefined) {
                            el.requestFullscreen = el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullscreen;
                        }
                        el.requestFullscreen();
                    }
                };
            }
        }
    },
    fileSystem: {
        chooseEntry: function(config, callback) {

        }
    }
};

window.launchData = {
    items: []
};
