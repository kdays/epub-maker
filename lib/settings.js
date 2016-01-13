var env = require("./env");
var path = require("path");
var fs = require("fs");

var defaultItems = {
    'operName': '路人A',
    'tmpDir': path.join(env.rootDir, "tmp"),
    'bookRuntimePath': path.join(env.rootDir, "runtime", "books")
};
var data = {};

var jsonPath = env.settingsPath;
if (fs.existsSync(jsonPath)) {
    data = JSON.parse(fs.readFileSync(jsonPath));
}

for (var k in defaultItems) {
    if (!(k in data)) {
        data[k] = defaultItems[k];
    }
}

var Mgr = {
    
    setValue: function(key, value) {
        data[key] = value;
        console.log(jsonPath);
        fs.writeFileSync(jsonPath, JSON.stringify(data));
    },
    
    getValue: function(key) {
        return data[key];
    }
    
};

module.exports = Mgr;