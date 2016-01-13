var env = require("./env"),
    utils = require("./util"),
    settings = require("./settings");

var listIndexJsonPath = settings.getValue("bookRuntimePath") + "/index.json";
if (!utils.exists_file(listIndexJsonPath)) {
    utils.mkdirs(settings.getValue("bookRuntimePath"));
}

var baseInfo = {
    id: 0,
    name: "",
    publisher: "",
    author: "",
    artist: "",
    about: "",
    oriId: 0,
    
    chapters: []
};

function _bookCache(bookId) {
    this.setDir(bookId);   
}

_bookCache.prototype = {
    
    setDir: function(bookId) {
        this.bookId = bookId;
        
        this.baseDir =  settings.getValue("bookRuntimePath") + utils.path_sep + bookId + utils.path_sep;
        // 生成相关图片目录和文字目录
        this.imageDir = this.baseDir + "images" + utils.path_sep;
        this.textDir = this.baseDir + "texts" + utils.path_sep;

        this.infoJsonPath = this.baseDir + "info.json";
    },
    
    getId: function() {
        return this.bookId;  
    },
    
    create: function() {
        var newId = utils.seq("book");
        
        if (!utils.exists_file(this.infoJsonPath)) {
            var bookInfo = baseInfo;
            bookInfo.id = newId;
            
            this.setDir(newId);
            utils.write_file(this.infoJsonPath, JSON.stringify(bookInfo));
        }

        utils.mkdirs(this.baseDir);
        utils.mkdirs(this.imageDir);
        utils.mkdirs(this.textDir);
    },
    
    getInfo: function() {
        return JSON.parse(utils.read_file(this.infoJsonPath));
    },
    
    remove: function() {
        var index = this.getIndex();
        var r = [];
        for (var i = 0; i < index.length; i++) {
            if (index[i].id == this.bookId) {
                continue;
            }
            
            r.push(index[i]);
        }
        
        //删除缓存目录
        utils.rmdirs(this.baseDir);
        this.updateIndex(r);
    },
    
    updateInfo: function(data) {
        var t = this.getInfo();
        for (var k in data) {
            if (k == 'chapters') {
                // 索引修复
                
                var r = [];
                for (var key in data['chapters']) {
                    if (data['chapters'][key] != null) {
                        r.push(data['chapters'][key]);
                    }
                }
                
                r.sort(function(aa, bb) {
                    return parseInt(aa.rank) - parseInt(bb.rank);
                });
                
                data['chapters'] = r;
            }
            t[k] = data[k];
        }
        
        // 写入索引
        var indexes = this.getIndex();
        var _insert = true;
        
        for (var i = 0; i < indexes.length; i++) {
            if (indexes[i].id == this.bookId) {
                _insert = false;
                indexes[i] = {
                    "id": this.bookId,
                    "up": new Date().getTime(),
                    "name": t.name
                };
                
                break;
            }
        }
        
        if (_insert) {
            indexes.push({
                "id": this.bookId,
                "up": new Date().getTime(),
                "name": t.name
            });
        }
        
        this.updateIndex(indexes);
        
        utils.write_file(this.infoJsonPath, JSON.stringify(t));
        return t;
    },

    updateIndex: function(d) {
        return utils.write_file(listIndexJsonPath, JSON.stringify(d));
    },
    
    getIndex: function(limit, skip) {
        if (limit && limit > 0) {
            console.log("limit: " + limit + "," + skip);
            return this._getIndex().slice(skip, skip + limit);
        }
        return this._getIndex();
    },
    
    getIndexSize: function() {
        return this._getIndex().length;  
    },
    
    _getIndex: function() {
        if (!utils.exists_file(listIndexJsonPath)) {
            return [];
        }
        
        return JSON.parse(utils.read_file(listIndexJsonPath));
    },
    
    setChapter: function(chapterId, rank, chapterName, content) {
        var _isInsert = false;
        if (!chapterId || chapterId == 0) {
            chapterId = utils.seq("chapter");
            _isInsert = true;
        }
        
        var tName = chapterId + ".txt";
        
        var info = this.getInfo();
        
        if (_isInsert) {
            info['chapters'].push({
                id: chapterId,
                rank: rank,
                name: chapterName,
                textPath: tName,
                oper: settings.getValue("operName")
            });   
        } else {
            for (var i = 0; i < info['chapters'].length; i++) {
                if (info['chapters'][i].id == chapterId) {
                    info['chapters'][i]['name'] = chapterName;
                    info['chapters'][i]['rank'] = rank;
                    
                    break;
                }
            }
        }

        utils.write_file(this.getTextPath(tName), content);
        this.updateInfo({"chapters": info['chapters']});
    },
    
    removeChapter: function(chapterId) {
        var info = this.getInfo();
        for (var i = 0; i < info['chapters'].length; i++) {
            if (info['chapters'][i].id == chapterId) {
                delete info['chapters'][i];
            }
        }  
        
        this.updateInfo({"chapters": info['chapters']});
    },
    
    getTextPath: function(name) {
        return this.textDir + name;  
    },
    
    addImageFile: function(source, filename) {
        utils.copy_file(source, this.getImagePath(filename));
    },
    
    getImagePath: function(name) {
        return this.imageDir + name;
    },
    
    getCoverPath: function() {
        var oriPath = this.getImagePath("cover.jpg");
        return utils.exists_file(oriPath) ? oriPath : "static/epub/error.jpg";
    }
};

module.exports = function(id) {
    return new _bookCache(id);
};
