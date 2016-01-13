
var helpers = {};

helpers.inputAppendValue = function(domElement, val) {
    if (document.selection) {
        domElement.focus();
        var sel = document.selection.createRange();
        sel.text = val;
        domElement.focus();
    } else if (domElement.selectionStart || domElement.selectionStart === 0) {
        var startPos = domElement.selectionStart;
        var endPos = domElement.selectionEnd;
        var scrollTop = domElement.scrollTop;
        domElement.value = domElement.value.substring(0, startPos) + val + domElement.value.substring(endPos, domElement.value.length);
        domElement.focus();
        domElement.selectionStart = startPos + val.length;
        domElement.selectionEnd = startPos + val.length;
        domElement.scrollTop = scrollTop;
    } else {
        domElement.value += val;
        domElement.focus();
    }
};

helpers.searchText = function(domElement, toFound) {
    var endPos = domElement.selectionEnd;
    if (endPos == domElement.value.length) {
        endPos = 0;
    }

    var nowRangeText = domElement.value.substring(endPos);
    var pos = nowRangeText.search(toFound);
    if (pos == -1) {
        alert("没有找到文字!");
        return;
    }

    domElement.selectionStart = endPos + pos;
    domElement.selectionEnd = endPos + pos + toFound.length;
    domElement.focus();
    //domElement.scrollIntoView();

    var sh = domElement.scrollHeight;
    var lineHeight = window.getComputedStyle(domElement).lineHeight.replace("px", "");
    if (lineHeight == "normal") {
        lineHeight = 16;
    }
    var nLines = sh / lineHeight;
    var charInLine = domElement.value.length / nLines;
    domElement.scrollTop = Math.floor( domElement.selectionEnd / charInLine ) * lineHeight;
};

module.exports = helpers;