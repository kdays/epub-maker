var path = require("path");
var fs = require("fs");
var crypto = require("crypto");
var ipc = require("ipc");
var env = require("./env");

var utils = {};

utils.zip_files = function(dirName, target, callback) {
    if (!fs.existsSync(dirName)) {
        return false;
    }
    
    /*
    var jszip = require("jszip");
    var zip = new jszip();

    var fList = utils.dir_walk(dirName);
    for (var i = 0; i < fList.length; i++) {
        var nowFile = fList[i];
        zip.file(nowFile.replace(dirName, ''), fs.readFileSync(nowFile));
    }
    var data = zip.generate({base64: false, compression: 'DEFLATE'});
    return fs.writeFileSync(target, data, 'binary');*/
    
    var zip = require("./zip");
    var packer = new zip(dirName, target, callback);
    
    packer.execute();
};

utils.unzip_files = function(zipName, targetDir, callback) {
    utils.mkdirs(targetDir);
    
    fs.readFile(zipName, function(err, data) {
        var jszip = require("jszip");
        var zip = new jszip(data);
        
        for (var k in zip.files) {
            var buffer = zip.files[k].asNodeBuffer();

            if (zip.files[k].dir == true) {
                if (!fs.existsSync(path.dirname(targetDir + utils.path_sep + k))) {
                    utils.mkdirs(path.dirname(targetDir + utils.path_sep + k));
                }
                
                continue;
            }
            
            if (k.indexOf("/") > -1) {
                console.log(k);
                utils.mkdirs(path.dirname(targetDir + utils.path_sep + k));
            }
            
            fs.writeFileSync(targetDir + utils.path_sep + k, buffer);
            ///var fd = fs.openSync(targetDir + "/" + k, "w");
            //fs.writeSync(fd, buffer);
            //fs.closeSync(fd);
        }
        
        callback(targetDir);
    });
};

utils.md5_str = function(str, type) {
    str = new Buffer(str);
    type = type || 'hex';
    var m = crypto.createHash('md5');
    m.update(str,'utf8');

    return m.digest(type);
};

utils.md5_file = function(filePath) {
    var md5 = crypto.createHash('md5');

    md5.update(fs.readFileSync(filePath));
    return md5.digest('hex');
};

utils.select_files = function(callback, types) {
    types = types || ['jpg', 'png'];
    
    var filenames = ipc.sendSync("open-filedialog", {
        "types": types
    });
    callback(filenames);
};

utils.save_file = function(callback) {
    var filename = ipc.sendSync('open-savedialog');
    callback(filename);
};

utils.select_folder = function(callback) {
    var folder = ipc.sendSync('open-folderdialog');
    callback(folder);
};

utils.copy_file = function(source, target) {
    var data = fs.readFileSync(source);
    var targetDirName = path.dirname(target);

    if (!fs.existsSync(targetDirName)) {
        console.log("auto mkdir: " + targetDirName);
        utils.mkdirs(targetDirName);
    }
    return fs.writeFileSync(target, data);
};

utils.write_file = function(p, text) {
    utils.mkdirs(path.dirname(p));
    return fs.writeFileSync(p, text);
};

utils.read_file = function(p) {
    return fs.readFileSync(p).toString();
};

utils.exists_file = function(filePath) {
    return fs.existsSync(filePath);
};

utils.remove_file = function(p) {
    return fs.unlinkSync(p);
};

utils.get_extname = function(target) {
    return path.extname(target).toLowerCase();
};

utils.fsize = function(p) {
    console.log(p);
    var d = fs.statSync(p);
    return d.size;
};

utils.rmdirs = function(dirpath) {
    return require('rimraf').sync(dirpath);
};

utils.mkdirs = function(dirpath) {
    //dirpath = path.dirname(dirpath);
    //console.log(dirpath)
    
    if (!fs.existsSync(dirpath)) {
        var pathtmp = "";

        var paths = dirpath.split(path.sep);
        for (var i = 0; i < paths.length; i++) {
            pathtmp += paths[i] + path.sep;

            if (!fs.existsSync(pathtmp)) {
                fs.mkdirSync(pathtmp);
            }
        }
    }
    return true;
};

utils.dir_walk = function(path, fileList) {
    fileList = fileList || [];
    var dirList = fs.readdirSync(path);
    var sep = "/";

    dirList.forEach(function(item){
        if(fs.statSync(path + sep+ item).isFile()){
            fileList.push(path + sep + item);
        }
    });

    dirList.forEach(function(item){
        if(fs.statSync(path + sep + item).isDirectory()){
            return utils.dir_walk(path + sep + item, fileList);
        }
    });

    return fileList
};

utils.array_has = function(value, arr) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] == value) {
            return true;
        }
    }

    return false;
};

utils.array_column = function(data, idxKey, contKey) {
    var result, k;
    
    if (!contKey) {
        result = [];
        for (k in data) {
            result.push(data[k][idxKey]);
        }
    } else {
        result = {};
        for (k in data) {
            result[ data[k][idxKey] ] = data[k][contKey];
        }
    }
    
    return result;
};

utils.to_timestamp = function(str) {
    if (str == "" || str == 0 || str == null) {
        return 0;
    }

    if (str == "now") {
        return new Date().getTime();
    }

    return new Date(str).getTime();
};

utils.timestamp_format = function(timestamp) {
    if (timestamp == 0 || timestamp == "" || timestamp  == null) {
        return "";
    }

    var d = new Date(timestamp);
    return d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate();
};

utils.copy_clipboard = function(type) {
    type = type || "text";
    return ipc.sendSync("get-clipboard", {type: type});
};

utils.seq = function(type) {
    var cache = require("./cache");
    var lastId = cache.getValue("seq." + type, 0);
    
    cache.updateValue("seq." + type, ++lastId);
    return lastId;
};

utils.dirname = function(p) {
    return path.dirname(p);
};

utils.strip_tags = function(input, allowed) {
    allowed = (((allowed || '') + '')
        .toLowerCase()
        .match(/<[a-z][a-z0-9]*>/g) || [])
        .join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
    var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
        commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
    return input.replace(commentsAndPhpTags, '')
        .replace(tags, function($0, $1) {
            return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
        });
};

utils.htmlspecialchars = function(str) {
    str = str.toString();
    
    str = str.replace(/&/g, '&amp;');
    str = str.replace(/</g, '&lt;');
    str = str.replace(/>/g, '&gt;');
    str = str.replace(/"/g, '&quot;');
    str = str.replace(/'/g, '&#039;');
    return str;
};

utils.textareaHelpers = require("./textarea");

utils.path_sep = path.sep;
utils.make_path = path.join;

module.exports = utils;