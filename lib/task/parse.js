var taskService = window.App.task,
    utils = require("../util"),
    settings = require("../settings"),
    parseString = require('xml2js').parseString,
    bookService = require("../book");

/**
 * 
 * {
 *      epub: "",
 *      tmpDir: ""
 * }
 * 
 * @param taskInfo
 * @returns {boolean}
 */
function execute(taskInfo) {
    if (!taskInfo) {
        console.error("NO_TASK: " + taskInfo.id);
        return false;
    }

    var toDir;
    if (!('tmpDir' in taskInfo.opts)) {
        toDir = utils.make_path(settings.getValue("tmpDir"), "unepub_" + new Date().getTime()) + utils.path_sep;
        utils.mkdirs(toDir);
    } else {
        toDir = taskInfo.opts['tmpDir'];
    }

    taskService.update(taskInfo.id, {'status' : '解压中'});
    
    utils.unzip_files(taskInfo.opts['epub'], toDir, function(toDir) {
        var removeCache = function() {
            utils.rmdirs(toDir);
        };

        taskService.update(taskInfo.id, {'status' : '解析中'});

        parseString(utils.read_file(toDir + "/META-INF/container.xml"), {explicitArray : false}, function(err, result) {
            var metaPath = toDir + result['container']['rootfiles']['rootfile']['$']['full-path'];
            if (!utils.exists_file(metaPath)) {
                taskService.update(taskInfo.id, {'status' : '错误: 不是Epub'});

                removeCache();
                return false;
            };
            
            var metaDir = utils.dirname(metaPath) + utils.path_sep;
            
            parseMeta(metaPath, function(metaResult) {
                console.log(metaResult);

                var bq = bookService();
                bq.create();
                bq.updateInfo({
                    "name": metaResult['name'],
                    'author': [metaResult['author']],
                    'about': metaResult['about'],
                    'publisher': metaResult['publisher']
                });

                // 如果有图片的话
                if (utils.exists_file(toDir + "/OEBPS/attachment/cover.jpg")) {
                    bq.addImageFile(toDir + "/OEBPS/attachment/cover.jpg", "cover.jpg");
                }
                
                if (utils.exists_file(toDir + '/OPS/images/cover.jpg')) {
                    bq.addImageFile(toDir + "/OPS/images/cover.jpg", "cover.jpg");
                }
                
                var tocNcxPath = toDir + "/OEBPS/toc.ncx";
                if (!utils.exists_file(tocNcxPath)) {
                    // 测试用meta替换解析
                    tocNcxPath = metaPath.replace(".opf", ".ncx");
                    if (!utils.exists_file(tocNcxPath)) {
                        taskService.update(taskInfo.id, {'status' : '错误: 不是Epub, NCX NOT EXISTS'});

                        removeCache();
                        return false;
                    }
                }
                
                console.log("tocNcx:" + tocNcxPath);
                
                parseNavMap(tocNcxPath, function(navResult) {
                    console.log(navResult);
                    var rank = 0;
                    for (var htmlSrc in navResult) {
                        var html = utils.read_file(metaDir + htmlSrc);
                        var htmlDir = utils.dirname(metaDir + htmlSrc) + utils.path_sep;

                        var start = html.indexOf("<body>") + 6;
                        var content = html.substr(start, html.indexOf("</body>") - start);

                        content = content.split("</p><p>").join("\n");
                        content = content.split("<p>").join("").split("</p>").join("");

                        /// 图片处理 将图片转换
                        var arr = content.split("<img");
                        if (arr.length > 1) {
                            arr.shift();
                            for (var ii = 0; ii < arr.length; ii++) {
                                var q = arr[ii].split(">")[0].split(" ");
                                console.log(q);

                                var attrs = {};
                                var needAttrs = ["width", "height", "src"];
                                for (var iii = 0; iii < needAttrs.length; iii++) {
                                    for (var kkk = 0; kkk < q.length; kkk++) {
                                        if (q[kkk].indexOf(needAttrs[iii]) > -1) {
                                            attrs[needAttrs[iii]] = q[kkk];
                                        }
                                    }
                                }
                                
                                console.log(attrs);
                                
                                var tar = utils.md5_str(attrs['src']) + ".jpg";
                                
                                attrs['src'] = attrs['src'].substring(5);
                                var offset = attrs['src'].indexOf('"') != -1 ? attrs['src'].indexOf('"') : attrs['src'].indexOf("'");
                                var sFile = htmlDir + attrs['src'].substring(0, offset);
                                
                                console.log("image: " + sFile);
                                bq.addImageFile(sFile, tar);

                                var imW = 0;
                                var imH = 0;

                                if (attrs['width'] && attrs['width'].indexOf("data-width") > -1) {
                                    imW = q[2].substr(12, q[2].length - 13);
                                }

                                if (attrs['height'] && attrs['height'].indexOf("data-height") > -1) {
                                    imH = q[3].substr(13, q[3].length - 14);
                                }

                                var imS = utils.fsize(sFile);

                                content = content.replace("<img" + q.join(" ") + ">", "[[IMG," + tar + "," + imW + "," + imH + "," + imS + "]]");
                            }
                        }

                        content = utils.strip_tags(content);
                        
                        bq.setChapter(0, ++rank, navResult[htmlSrc], content);
                    }

                    // 如果处理都完成
                    taskService.update(taskInfo.id, {"status": "完成", "targetId": bq.getId()});
                })
            });

            removeCache();
        });
    });
    
}

function parseMeta(metaPath, callback) {
    parseString(utils.read_file(metaPath), {explicitArray: false}, function(err, result) {
        var meta = {};
        
        meta['name'] = result['package']['metadata']['dc:title'];
        meta['author'] = result['package']['metadata']['dc:creator']['_'];
        meta['publisher'] = result['package']['metadata']['dc:publisher'];
        meta['about'] = result['package']['metadata']['dc:description'];
        
        callback(meta);
    });
}

function parseNavMap(tocNcxPath, callback) {
    parseString(utils.read_file(tocNcxPath), {explicitArray : false}, function(err, result) {
        console.log(result);
        var points = result['ncx']['navMap']['navPoint'];
        var navMap = {};
        
        for (var i = 0; i < points.length; i++) {
            if (points[i]['$'].id == "Cover" || points[i]['$'].id == "Contents") {
                continue;
            }
            
            navMap[ points[i]['content']['$'].src ] = points[i]['navLabel'].text;
            
        }
        
        callback(navMap);
    });
}

function parseHTML(html) {
    
}

module.exports = execute;