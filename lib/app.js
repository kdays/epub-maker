var ipc = require( 'ipc' );
var shell = require( 'shell' );
var inherits = require( 'util' ).inherits;
var EE = require( 'events' ).EventEmitter;
var Promise = require("bluebird");
var env = require("./env");

String.prototype.format = function(args) {
    var result = this;
    if (arguments.length > 0) {
        if (arguments.length == 1 && typeof (args) == "object") {
            for (var key in args) {
                if(args[key]!=undefined){
                    var reg = new RegExp("({" + key + "})", "g");
                    result = result.replace(reg, args[key]);
                }
            }
        }
        else {
            for (var i = 0; i < arguments.length; i++) {
                if (arguments[i] != undefined) {
                    var reg = new RegExp("({[" + i + "]})", "g");
                    result = result.replace(reg, arguments[i]);
                }
            }
        }
    }
    return result;
};

var App = function () {
    var self = this;
    if ( !( this instanceof App ) ) {
        return new App();
    }
    EE.call( this );

    // bind events' handler
    // ----------------------------------------------
    // ----------------------------------------------

    // init
    self.utils = require("./util");
    self.task = require("./task");
    self.getBookInfo = require("./book");
    self.tmpValues = {};
    
    self.settings = require("./settings");
    
    self.getAppEnvInfo = function(k) {
        return k ? env[k] : env;
    };

    // miscellaneous APIs
    // ----------------------------------------------
    self.openUrl = function ( url ) {
        shell.openExternal( url );
    };

    self.openDevTools = function () {
        ipc.sendSync( 'open-dev' );
    };
    // ----------------------------------------------

    // control APIs
    // ----------------------------------------------
    self.quit = function () {
        ipc.sendSync( 'app-quit' );
    };

    self.minimize = function () {
        ipc.sendSync( 'app-minimize' );
    };
    // ----------------------------------------------
};
inherits( App, EE );

module.exports = window.App = App();