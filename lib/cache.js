var settings = require("./settings");
var fs = require("fs");

var cache = {
    
    getPath: function() {
        return settings.getValue("bookRuntimePath") + "/cache.json";
    },
    
    getAll: function() {
        var _data = {};
        if (fs.existsSync(this.getPath())) {
            _data = JSON.parse(fs.readFileSync(this.getPath()));
        }
        
        return _data;
    },
    
    getValue: function(type, defaultValue) {
        defaultValue = defaultValue || null;
        
        var all = this.getAll();
        if (type in all) {
            return all[type];
        } 
        
        return defaultValue;
    },
    
    updateValue: function(type, value) {
        var all = this.getAll();
        
        all[type] = value;
        fs.writeFileSync(this.getPath(), JSON.stringify(all));
    }
    
};

module.exports = cache;