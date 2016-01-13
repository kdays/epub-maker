
var app = require("./main");
app.service("appService", ['$window', function($window) {
    
    this.quit = function() {
        $window.App.quit();
    };
    
    this.getUtil = function() {
        return $window.App.utils;
    };
    
    this.getTask = function() {
        return $window.App.task;
    };
    
    this.getBookInfo = function(id) {
        return $window.App.getBookInfo(id);
    };
    
    this.getSettings = function() {
        return $window.App.settings;  
    };
    
    this.getEnv = function(k) {
        k = k || false;

        var env = $window.App.getAppEnvInfo();
        if (k) {
            return env[k];
        }
        return env;
    };
    
    this.setValue = function(key, value) {
        $window.App.tmpValues[key] = value;  
    };
    
    this.getValue = function(key, defaultValue) {
        if (key in $window.App.tmpValues) {
            return $window.App.tmpValues[key];
        }
        return defaultValue;
    }
    
}]);