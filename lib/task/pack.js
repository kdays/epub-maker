var taskService = window.App.task,
    utils = require("../util"),
    getBookInfo = require("../book"),
    settings = require("../settings"),
    epubRes = require("../epubResource");

/**
 * 参数: {
 *   bookid: 书籍id
 *   tmpDir: "打包临时目录路径",
 *   outputPath: "输出Epub路径"
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
    
    taskService.update(taskInfo.id, {
        "status": "Ready"
    });
    
    var bookQuery = getBookInfo(taskInfo.opts['bookid']);
    if (!bookQuery) {
        taskService.update(taskInfo.id, {"status": "错误: 没有找到书籍"});
        return;
    }
    
    var bookInfo = bookQuery.getInfo();
    var tmpPackDir;
    if ('tmpDir' in taskInfo.opts) {
        tmpPackDir = taskInfo.opts['tmpDir'];
    } else {
        tmpPackDir = utils.make_path(settings.getValue("tmpDir"), 'pack_' + bookInfo.id) + utils.path_sep;
    }
    
    console.log("tmpDir: " + tmpPackDir);
    
    var epubUuid = "urn:" + utils.md5_str("EP_" + bookInfo.id);
    var i;
    
    // 创建目录
    var dirList = [
        'META-INF/',
        'OEBPS/',
        'OEBPS/attachment/',
        'OEBPS/html/',
        'OEBPS/styles/'
    ];
    for (i = 0; i < dirList.length; i++)    utils.mkdirs(tmpPackDir + dirList[i].replace("/", utils.path_sep));
    
    function wr(name, content) {
        utils.write_file(tmpPackDir + utils.path_sep + name, content);
    }
    
    function cp(source, target) {
        utils.copy_file(source, tmpPackDir + utils.path_sep + target);
    }
    
    wr("mimetype", "application/epub+zip");
    
    wr("META-INF/container.xml", epubRes.containerXml);
    wr("OEBPS/styles/style.css", epubRes.styleCss);
    cp(bookQuery.getCoverPath(), "OEBPS/attachment/cover.jpg");
    
    var attachments = [];
    
    for (i = 0; i < bookInfo.chapters.length; i++) {
        taskService.update(taskInfo.id, {"status": "章节:" + bookInfo.chapters[i].name});
        
        var td = utils.read_file(bookQuery.getTextPath(bookInfo.chapters[i].textPath)).toString();
        td = utils.htmlspecialchars(td);
        
        var arr = td.split("[[IMG,");
        if (arr.length > 1) {
            arr.shift();
            for (var ii = 0; ii < arr.length; ii++) {
                var q = arr[ii].split("]]")[0].split(",");
                var imf = q[0];

                cp(bookQuery.getImagePath(imf), "OEBPS/attachment/" + imf);
                attachments.push(imf);
                
                var image = '<img src="../attachment/{src}" data-width="{width}" data-height="{height}" />';
                td = td.replace("[[IMG," + q.join(",") + "]]", image.format({
                    src: imf,
                    width: q[1],
                    height: q[2]
                })); 
            }
        }
        
        wr("OEBPS/html/chapter" + i + ".html", getChapterHTML(bookInfo.chapters[i].name, td));
    }
    
    var chapterNames = utils.array_column(bookInfo['chapters'], 'name');
    wr("OEBPS/toc.ncx", buildTocNCX(epubUuid, bookInfo, chapterNames));
    wr("OEBPS/content.opf", buildOPF(epubUuid, bookInfo, attachments));
    
    var coverHtml = epubRes.coverHtml.format({
        name: utils.htmlspecialchars(bookInfo.name),
        author: utils.htmlspecialchars(bookInfo.author),
        artist: utils.htmlspecialchars(bookInfo.artist),
        publisher: utils.htmlspecialchars(bookInfo.publisher),
        about: utils.htmlspecialchars(bookInfo.about)
    });
    wr("OEBPS/html/Cover.html", coverHtml);
    wr("OEBPS/html/Contents.html", buildContentsHTML(chapterNames));

    var saveAs = taskInfo.opts['outputPath'];
    taskService.update(taskInfo.id, {"status": "打包中", "saveAs": saveAs});
    utils.zip_files(tmpPackDir, saveAs, function() {
        taskService.update(taskInfo.id, {
            "status": "完成",
            "endTime": new Date().getTime()
        });
    });
}

function getChapterHTML(title, content) {
    //var chapterTpl = utils.read_static("static/epub/BaseChapter.html");
    var chapterTpl = epubRes.baseChapterHtml;
    
    content = "<p>" + (content.split("\n").join("</p><p>")) + "</p>";
    
    return chapterTpl.format({
        title: utils.htmlspecialchars(title),
        body: content
    });
}

function buildOPF(uuid, bookInfo, attachments) {
    //var fileCont = utils.read_static("static/epub/content.opf");
    var fileCont = epubRes.contentOpf;
    var baseFieldItem = epubRes.opfFieldItemSection;
    var baseFieldSpine = epubRes.opfFieldSpineSection;
    
    //var baseFieldItem = utils.read_static("static/epub/opf_field_item.section");
    //var baseFieldSpine = utils.read_static("static/epub/opf_field_spine.section");
    
    var extraMeta = '';
    var fieldItem = '';
    var fieldSpine = '';
    var i;
    
    for (i = 0; i < bookInfo.chapters.length; i++) {
        var fn = "chapter" + i + ".html";
        
        fieldItem += baseFieldItem.format({href: "html/" + fn, id: fn, type: 'application/xhtml+xml'});
        fieldSpine += baseFieldSpine.format({ref: fn});
    }
    
    for (i = 0; i < attachments.length; i++) {
        var mediaType = "image/jpeg";
        
        fieldItem += baseFieldItem.format({
            "href": "attachment/" + attachments[i],
            "id": attachments[i],
            "type": mediaType
        });
    }
    
    extraMeta += '<meta name="{name}" content="{content}" />'.format({
        name: "ex:oper",
        content: utils.htmlspecialchars(settings.getValue("operName"))
    });
    
    return fileCont.format({
        uuid: uuid,
        "name": utils.htmlspecialchars(bookInfo.name),
        "author": utils.htmlspecialchars(bookInfo.author),
        "source": "Akari ePub Maker",
        "about" : utils.htmlspecialchars(bookInfo.about),
        "publisher": utils.htmlspecialchars(bookInfo.publisher),
        "artist": utils.htmlspecialchars(bookInfo.artist),
        "extra_meta": extraMeta,
        "createTime": utils.timestamp_format(utils.to_timestamp('now')),
        
        "field_item": fieldItem,
        "field_spine": fieldSpine
    })
}

function buildTocNCX(uuid, bookInfo, chapterNameArr) {
    
    var fileCont = epubRes.tocNcx;
    var baseNavMap = epubRes.tocNavMapSection;
    
    //var fileCont = utils.read_static("static/epub/toc.ncx");
    //var baseNavMap = utils.read_static("static/epub/toc_navMap.section");
    var navMapStr = '';
    
    var defaultNavPoint = {
        '封面': ['Cover', 'html/Cover.html'],
        '目录': ['Contents', 'html/Contents.html']
    };
    
    var point = 1;
    for (var navTitle in defaultNavPoint) {
        navMapStr += baseNavMap.format({
            order: point,
            title: utils.htmlspecialchars(navTitle),
            id: defaultNavPoint[navTitle][0],
            src: defaultNavPoint[navTitle][1]
        });
        
        point++;
    }
    
    for (var i = 0; i < chapterNameArr.length; i++) {
        var id = "chapter" + i;
        
        navMapStr += baseNavMap.format({
            order: point,
            title: utils.htmlspecialchars(chapterNameArr[i]),
            id: id,
            src: "html/" + id + ".html" 
        });
        
        point++;
    }
    
    fileCont = fileCont.format({
        uuid: uuid,
        name: utils.htmlspecialchars(bookInfo.name),
        author: utils.htmlspecialchars(bookInfo.author),
        navMap: navMapStr
    });
    
    return fileCont;
}

function buildContentsHTML(chapterNameArr) {
    var fileCont = epubRes.contentsHtml;
    var baseContentsListTpl = epubRes.contentListSection;
    //var fileCont = utils.read_static("static/epub/Contents.html");
    //var baseContentsListTpl = utils.read_static("static/epub/Contents_list.section");
    
    var body = '';
    for (var i = 0; i < chapterNameArr.length; i++) {
        body += baseContentsListTpl.format({
            "key" : i,
            "src": "html/chapter" + i + ".html",
            "title": utils.htmlspecialchars(chapterNameArr[i])
        });
    }
    
    return fileCont.format({body: body});
}

module.exports = execute;