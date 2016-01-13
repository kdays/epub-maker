var res = {};

res.baseChapterHtml = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">\n<html xml:lang="zh-CN" xmlns="http://www.w3.org/1999/xhtml">\n<head>\n    <meta content="text/html; charset=utf-8" http-equiv="Content-Type"/>\n    <link href="../styles/style.css" rel="stylesheet" type="text/css"/>\n    <title>{title}</title>\n</head>\n\n<body>\n{body}\n</body>\n</html> ';

res.containerXml = '<?xml version="1.0" encoding="UTF-8"?>\n<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">\n    <rootfiles>\n        <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>\n    </rootfiles>\n</container>';

res.contentOpf = "<?xml version=\"1.0\" encoding=\"utf-8\" standalone=\"yes\"?>\n<package xmlns=\"http://www.idpf.org/2007/opf\" unique-identifier=\"BookId\" version=\"2.0\">\n    <metadata xmlns:dc=\"http://purl.org/dc/elements/1.1/\" xmlns:opf=\"http://www.idpf.org/2007/opf\">\n        <dc:identifier id=\"BookId\" opf:scheme=\"UUID\">{uuid}</dc:identifier>\n        <dc:title>{name}</dc:title>\n        <dc:creator opf:file-as=\"{author}\" opf:role=\"aut\">{author}</dc:creator>\n        <dc:language>zh</dc:language>\n        <dc:source>{source}</dc:source>\n        <dc:description>{about}</dc:description>\n        <dc:date>{createTime}</dc:date>\n        <dc:publisher>{publisher}</dc:publisher>\n        {extra_meta}\n\n        <meta content=\"cover-image\" name=\"cover\" />\n    </metadata>\n\n    <manifest>\n        <item href=\"toc.ncx\" id=\"ncx\" media-type=\"application/x-dtbncx+xml\" />\n        <item href=\"html/Cover.html\" id=\"Cover.html\" media-type=\"application/xhtml+xml\" />\n        <item href=\"html/Contents.html\" id=\"Contents.html\" media-type=\"application/xhtml+xml\" />\n        <item href=\"styles/style.css\" id=\"style.css\" media-type=\"text/css\" />\n        <item href=\"attachment/cover.jpg\" id=\"cover-image\" media-type=\"image/jpeg\" />\n\n        {field_item}\n    </manifest>\n\n    <spine toc=\"ncx\">\n        <itemref idref=\"Cover.html\" />\n        <itemref idref=\"Contents.html\" />\n\n        {field_spine}\n    </spine>\n\n    <guide>\n        <reference href=\"html/Cover.html\" title=\"Cover\" type=\"cover\" />\n        <reference href=\"html/Contents.html\" title=\"Table of Contents\" type=\"toc\" />\n    </guide>\n</package>    "

res.contentsHtml = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">\n<html xmlns="http://www.w3.org/1999/xhtml">\n<head>\n    <meta content="text/html; charset=utf-8" http-equiv="Content-Type"/>\n    <link href="../styles/style.css" rel="stylesheet" type="text/css"/>\n    <title>目录</title>\n</head>\n<body>\n<div class="content-entry">\n    <h1>目录</h1>\n    <ul class="chapter-list">\n        {body}\n    </ul>\n</div>\n</body>\n</html>';

res.contentListSection = '<li><a href="{src}">{title}</a></li>';

res.coverHtml = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">\n<html xmlns="http://www.w3.org/1999/xhtml">\n<head>\n    <meta content="text/html; charset=utf-8" http-equiv="Content-Type"/>\n    <link href="../styles/style.css" rel="stylesheet" type="text/css"/>\n    <title>封面</title>\n</head>\n\n<body>\n<div class="cover"><img src="../attachment/cover.jpg" /></div>\n<div id="bookInfo">\n    <h1>{name}</h1>\n\n    <p class="author">作者: <span>{author}</span></p>\n    <p class="arist">画师: <span>{artist}</span></p>\n    <p class="publisher">文库: <span>{publisher}</span></p>\n    <p class="about">{about}</p>\n</div>\n</body>\n</html>  ';

res.opfFieldItemSection = '<item href="{href}" id="{id}" media-type="{type}" />\n';

res.opfFieldSpineSection = '<itemref idref="{ref}" />\n';

res.styleCss = 'body {\n    padding: 0;\n    margin: 0 1%;\n    line-height: 130%;\n    text-align: justify;\n    color: #000;\n}\n\n.cover {\n    margin: 0;\n    padding: 0;\n    text-indent: 0;\n    text-align: center;\n}\n\nh4 {\n    font-size: 1.5em;\n    text-align: center;\n    line-height: 1.2em;\n    text-indent: 0;\n    font-weight: bold;\n    margin-top: 1em;\n    margin-bottom: 1.5em;\n    border-bottom: 2px solid #111;\n}\n\np {\n    text-indent: 2em;\n    display: block;\n    line-height: 1.3em;\n    margin-top: 0.4em;\n    margin-bottom: 0.4em;\n}'

res.tocNcx = '<?xml version="1.0" encoding="UTF-8" standalone="no" ?>\n<!DOCTYPE ncx PUBLIC "-//NISO//DTD ncx 2005-1//EN"\n"http://www.daisy.org/z3986/2005/ncx-2005-1.dtd">\n<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">\n    <head>\n        <meta content="{uuid}" name="dtb:uid" />\n        <meta content="0" name="dtb:depth" />\n        <meta content="0" name="dtb:totalPageCount" />\n        <meta content="0" name="dtb:maxPageNumber" />\n    </head>\n    <docTitle>\n        <text>{name}</text>\n    </docTitle>\n    <docAuthor>\n        <text>{author}</text>\n    </docAuthor>\n    <navMap>\n        {navMap}\n    </navMap>\n</ncx>';

res.tocNavMapSection = '<navPoint id="{id}" playOrder="{order}">\n    <navLabel>\n        <text>{title}</text> \n    </navLabel>\n    <content src="{src}" />            \n</navPoint>\n';

module.exports = res;