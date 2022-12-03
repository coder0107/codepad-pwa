var chrome = {
    storage: {
        sync: {
            set: function (key, value) {
                localforage.setItem(key, value);
            },
            get: function (key, callback) {
                return localforage.getItem(key, callback);
            }
        }
    }
};
window.launchData = {
    items: []
};
