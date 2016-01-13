var Q = require("Q");
var request = require("request");
var env = require("./env");

function _doRequest(url, query) {
    var deferred = Q.defer();
    //console.log(url, query);

    var r = request.post(url, function(err, resp, body){
        if (err)    deferred.reject(err);
        if (body) {
            body = JSON.parse(body);
        }

        deferred.resolve(body);
    });

    if (query) {
        r.form(query);
    }
    return deferred.promise;
}

var requests = {
    baseWikiApiServer: env.wikiApiServer,
    
    getWiki: function(id) {
           
    }
};

module.exports = requests;