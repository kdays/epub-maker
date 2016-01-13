
var app = require("./main");

app.directive("closeButton", ['appService', function(app) {
    return function ( scope, el ) {
        el.on( 'click', function () {
            app.quit();
        });
    }
}]).directive('myText', ['$rootScope', function($rootScope) {

    return {
        link: function(scope, element, attrs) {
            //console.log(scope);

            $rootScope.$on('add', function(e, val) {
                var domElement = element[0];

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
                    
                    scope.content = domElement.value; //update
                } else {
                    domElement.value += val;
                    domElement.focus();
                }
            });

            $rootScope.$on('find', function(e, toFound) {
                console.log("find:" + toFound);
                var domElement = element[0];
                
                // 先获得当前位置
                var endPos = domElement.selectionEnd;
                if (endPos == domElement.value.length) {
                    endPos = 0;
                }

                var nowRangeText = domElement.value.substring(endPos);
                var pos = nowRangeText.search(toFound);
                if (pos == -1) {
                    alert("没有找到文字!");
                    e.stopPropagation();
                    
                    return;
                }
                
                domElement.selectionStart = endPos + pos;
                domElement.selectionEnd = endPos + pos + toFound.length;
                domElement.focus();
                //domElement.scrollIntoView();

                var sh = domElement.scrollHeight;
                var line_height = window.getComputedStyle(domElement).lineHeight.replace("px", "");
                if (line_height == "normal") {
                    line_height = 16;
                }
                var n_lines = sh / line_height;
                var char_in_line = domElement.value.length / n_lines;
                domElement.scrollTop = Math.floor( domElement.selectionEnd / char_in_line ) * line_height;

                e.stopPropagation();
                
                /*
                var charsPerRow = domElement.cols;
                var selectionRow =  (newPosStart - (newPosStart % charsPerRow)) / charsPerRow;
                if (selectionRow) { // move!
                    var lineHeight = domElement.clientHeight / domElement.rows;
                    domElement.scrollTop = lineHeight * selectionRow;
                }*/
            });
        }
    }

}]);