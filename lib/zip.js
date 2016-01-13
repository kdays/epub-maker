/**
 * Created by kdays on 16/1/7.
 */

var fs = require("fs"),
    utils = require("./util");

function createZip(source, target, callback) {
    this.files = [];
    this.source = source;
    this.target = target;
    
    var packer = require("zip-stream");
    var archive = new packer();
    archive.pipe(fs.createWriteStream(target));
    
    this.stream = archive;
    this.finishCallback = callback;
    
    this.initFiles();
}

createZip.prototype = {
    
    addFile: function(readStream, opts) {
        this.files.push([readStream, opts]);  
    },
    
    initFiles: function() {
        var fList = utils.dir_walk(this.source);
        for (var i = 0; i < fList.length; i++) {
            var nowFile = fList[i];

            
            this.addFile(fs.createReadStream(nowFile),  {
                name: nowFile.replace(this.source, '')
            });
        }
    },
    
    execute: function() {
        this.next();
    },
    
    next: function() {
        if (this.files.length == 0) {
            this.stream.finalize();
            this.finishCallback();
            return ;
        }

        var that = this;
        this.stream.entry(this.files[0][0], this.files[0][1], function(err) {
            if (err)    console.error(err);
            that.files.shift();
            that.execute();
        });
    }
};


module.exports = createZip;