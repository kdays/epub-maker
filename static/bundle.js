(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

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
},{"./main":11}],2:[function(require,module,exports){
require("./main")
},{"./main":11}],3:[function(require,module,exports){
module.exports = ['$scope', 'appService', '$rootScope', '$state', '$stateParams', function($scope, appService, $rootScope, $state, $stateParams) {
    var vm = this;
    
    vm.nowSelectedCover = null;

    vm.bookInfo = {
        oriId: 0,
        name: "",
        publisher: "",
        author: [],
        artist: [],
        about: ""
    };
    
    if ($stateParams.id > 0) {
        var bq = appService.getBookInfo($stateParams.id);
        vm.bookInfo = bq.getInfo();
        vm.nowSelectedCover = bq.getImagePath('cover.jpg');
        
        if (!vm.bookInfo) {
            alert("没有找到书籍信息 :<");
            $state.go("init_factory");
            
            return ;
        }
    } 
    
    
    vm.setCover = function() {
        appService.getUtil().select_files(function(paths) {
            if (paths.length != 1) {
                return false;
            }
            
            vm.nowSelectedCover = paths[0];
        });
    };
    
    vm.cancelCover = function() {
        vm.nowSelectedCover = null;
    };
    
    vm.save = function() {
          if (vm.bookInfo.name.trim() == "") {
              alert("书籍名不能为空");
              return false;
          }
        
        if (vm.nowSelectedCover == null) {
            alert("封面不能为空");
            return false;
        }
        
        if ($stateParams.id > 0) {
            bq.updateInfo(vm.bookInfo);
            $state.go("chapters", {id: bq.getId()});
        } else {
            var bs = appService.getBookInfo();

            bs.create();
            bs.updateInfo(vm.bookInfo);
            bs.addImageFile(vm.nowSelectedCover, "cover.jpg");

            $state.go("chapters", {id: bs.getId()});
        }
    };
    
    vm.back = function() {
        // 如果有书籍就跳回章节列表
        if ($stateParams.id > 0) {
            $state.go("chapters", {id: $stateParams.id});
        } else {
            $state.go("init_factory");
        }
    };
    //appService.getBookInfo(2).addChapter(0, "Test Title", "Hello world");
    /*appService.getUtil().save_file(function(outputPath) {
        if (!outputPath) {
            alert("打包被取消啦");
            return ;
        }

        appService.getTask().create("pack", {
            "bookid": 2,
            "outputPath": outputPath
        }, function(result) {
            console.log(result);
        });
    });*/
}];
},{}],4:[function(require,module,exports){
module.exports = ['$scope', 'appService', 'detail', '$state', function($scope, appService, detail, $state) {
    
    var vm = this;
    
    vm.lists = detail;
    for(var k in detail) {
        detail[k]['cover'] = appService.getBookInfo(detail[k].id).getImagePath('cover.jpg');
    }
    
    vm.toChapters = function(id) {
        $state.go("chapters", {id: id});
    };
    
    vm.remove = function(id) {
        if (confirm('确定要删除么?')) {
            appService.getBookInfo(id).remove();
            
            alert("删除成功!");
            $state.go("init_factory");
        }
    };
    
    vm.back = function() {
        $state.go("init_factory");
    };
    
}];
},{}],5:[function(require,module,exports){
module.exports = ['appService', '$state', '$stateParams', 'detail', '$scope', '$rootScope', '$mdDialog', function(appService, $state, $stateParams, detail, $scope, $rootScope, $mdDialog) {
    
    var vm = this;
    vm.bookInfo = detail;
    vm.content = "";
    
    var utils = appService.getUtil();
    var q = appService.getBookInfo($stateParams.bookid);
    
    if ($stateParams.chapterid > 0) {
        var chapterInfo = null;
        for (var i = 0; i < vm.bookInfo.chapters.length; i++) {
            if (vm.bookInfo.chapters[i].id == $stateParams.chapterid) {
                chapterInfo = vm.bookInfo.chapters[i];
                break;
            }
        }
        vm.chapterInfo = chapterInfo;
        vm.content = utils.read_file(q.getTextPath(vm.chapterInfo.textPath));
    } else {
        vm.chapterInfo = {rank: 0, name: ""};
    }
    
    vm.save = function() {
        if (vm.content == "") {
            alert("内容不可以为空!");
            return false;
        }
        
        if (vm.bookInfo.name.trim() == "") {
            alert("名称不能为空");
            return false;
        }
        
        console.log(vm.content);
        q.setChapter($stateParams.chapterid, vm.chapterInfo.rank, vm.chapterInfo.name, vm.content);
        alert("保存成功");
        
        $state.go("chapters", {id: $stateParams.bookid});
    };
    
    vm.addImage = function() {
        appService.getUtil().select_files(function(files) {
            /*if (files.length > 5) {
                alert("最多一次性选5张图");
                return false;
            }*/
            
            var i;
            for (i = 0; i < files.length; i++) {
                var ext = utils.get_extname(files[i]);
                if (ext != '.png' && ext != '.jpg') {
                    alert("图片只允许png或jpg");
                    return false;
                }
            }
            
            var nextImage = function() {
                if (files.length == 0) return ;

                $rootScope.$emit("notify", "图片进行中,剩余 " + files.length, 500);
                copyImage(files.shift());
            };
            
            var copyImage = function(src) {
                var img = new Image();
                img.src = src;

                img.onload = function() {
                    var nowName = src;
                    
                    var filename = utils.md5_file(nowName) + ".jpg";
                    q.addImageFile(nowName, filename);


                    var t = "\n" + "[[IMG," + filename + "," + this.width + "," + this.height + "," + utils.fsize(nowName) + "]]" + "\n";
                    //$rootScope.$emit("add", t);

                    utils.textareaHelpers.inputAppendValue(document.getElementById("editor"), t);
                    img = null;
                    
                    vm.content = document.getElementById("editor").value; //肯定没更新啦亲

                    nextImage();
                };

                img.onerror = function() {
                    alert("发现一张不可识别的图片: " + this.src);
                }
            };

            $rootScope.$emit("notify", "图片复制中..");
            nextImage();
        })
    };
    
    vm.findContent = function($ev) {
        $mdDialog.show({
            templateUrl: "static/view/dialog_search.html",
            parent: angular.element(document.body),
            targetEvent: $ev,
            clickOutsideToClose: false,
            locals: {
                
            },
            controller: DialogController
        });

        function DialogController($scope, $mdDialog) {
            $scope.searchText = "";
            
            $scope.submitSearch = function() {
                if ($scope.searchText == "") {
                    alert("不可为空呀亲");
                    return false;
                }

                $mdDialog.hide();
                utils.textareaHelpers.searchText(document.getElementById("editor"), $scope.searchText);
            };
            
            $scope.closeDialog = function() {
                $mdDialog.hide();
            }
        }
        
    };
    
    vm.preview = function($ev) {
        var content = vm.content;
        var t = content;

        // 打包内容
        var arr = content.split("[[IMG,");
        if (arr.length > 1) {
            arr.shift();
            for (var ii = 0; ii < arr.length; ii++) {
                var imf = arr[ii].split("]]")[0].split(",")[0];
                t = t.replace("[[IMG," + arr[ii].split("]]")[0] + "]]", "<img class='illust' src='" + q.getImagePath(imf) + "' />");
            }
        }

        t = "<p>" + t.split("\n").join("</p><p>") + "</p>";
        
        $mdDialog.show({
            templateUrl: "static/view/dialog_preview.html",
            parent: angular.element(document.body),
            targetEvent: $ev,
            clickOutsideToClose: false,
            locals: {
                content: t
            },
            controller: DialogController
        });

        function DialogController($scope, $mdDialog, content) {
            $scope.content = content;
            
            $scope.closeDialog = function() {
                $mdDialog.hide();
            }
        }
    };

    vm.removeFirstTwoSpace = function() {
        var c = vm.content.split("\n");

        for (var i = 0; i < c.length; i++){
            if (c[i].substr(0, 2) == "  " || c[i].substr(0, 2) == "　　") {
                c[i] = c[i].substr(2);
            }
        }

        vm.content = c.join("\n");
    };

    vm.addFirstTwoSpace = function() {
        var c = vm.content.split("\n");

        for (var i = 0; i < c.length; i++){
            c[i] = "　　" + c[i]
        }

        vm.content = c.join("\n");
    };

    vm.clearTextSpace = function() {
        if (!confirm('你真的要清理空行么,不能反悔哦?')) {
            return false;
        }

        vm.content = vm.content.split("\n\n").join("\n");
    };


    vm.back = function() {
        if (vm.content != "") {
            if (!confirm('你当前编辑器内容非空,如果返回将会丢失编辑哦,确定么?')) {
                return false;
            }
        }
        
        $state.go("chapters", {id: $stateParams.bookid});
    }
    
}];
},{}],6:[function(require,module,exports){
module.exports = ['appService', '$scope', 'detail', '$state', '$rootScope', function(appService, $scope, detail, $state, $rootScope) {
    var vm = this;
    
    vm.bookInfo = detail;
    
    vm.addChapter = function() {
        $state.go("chapterInfo", {bookid: detail.id, chapterid: 0});
    };
    
    vm.editChapter = function(chapterId) {
        $state.go("chapterInfo", {bookid: detail.id, chapterid: chapterId});
    };
    
    vm.removeChapter = function(chapterId) {
        if (!confirm('高能警告! 你即将删除一个章节,确定么?')) {
            return false;
        }
        
        var bs = appService.getBookInfo(detail.id);
        bs.removeChapter(chapterId);
        alert("删除成功 :)");
        
        $state.reload();
    };
    
    vm.toEditInfo = function() {
        $state.go("bookInfo", {id: detail.id});
    };
    
    vm.pack = function() {
        appService.getUtil().save_file(function(outputPath) {
            if (!outputPath) {
                alert("打包被取消啦");
                return;
            }
            
            if (outputPath.toLowerCase().substr(-5) != ".epub") {
                outputPath += ".epub";
            }

            appService.getTask().create("pack", {
                "bookid": detail.id,
                "outputPath": outputPath
            }, function(result) {
                if (result.status == '完成') {
                    $rootScope.$emit("notify", "打包完毕", 1000);   
                } else {
                    $rootScope.$emit("notify", result.status);
                }
            });
        });
    };
    
    vm.back = function() {
        $state.go("init_factory");  
    };
}];
},{}],7:[function(require,module,exports){
module.exports = function($stateProvider) {
    
    $stateProvider.state('bookInfo', {
        url: '/bookInfo/:id',
        templateUrl: 'static/view/factory.bookInfo.html',
        resolve: {

        },
        controller: 'bookInfoCtrl',
        controllerAs: 'bookInfo'
    }).state('chapters', {
        url: "chapters/:id",
        templateUrl: "static/view/factory.chapters.html",
        resolve: {
            detail: function($q, $rootScope, $stateParams, appService) {
                var defer = $q.defer();
                
                var bookInfo = appService.getBookInfo($stateParams.id).getInfo();
                if (!bookInfo) {
                    defer.reject(false);
                } else {
                    defer.resolve(bookInfo);
                }
                
                return defer.promise;
            }
        },
        controller: 'chapterListCtrl',
        controllerAs: 'chapterList'
    }).state('bookList', {
        url: '/bookList/',
        templateUrl: 'static/view/factory.bookList.html',
        resolve: {
            detail: function($q, $rootScope, $stateParams, appService) {
                var defer = $q.defer();
                
                var page = parseInt($stateParams.page);
                if (isNaN(page))    page = 1;
                var pageSize = 100;
                
                var lists = appService.getBookInfo().getIndex(pageSize, (page - 1) * pageSize, true);
                defer.resolve(lists);
                
                return defer.promise;
            }
        },
        controller: 'bookListCtrl',
        controllerAs: 'bookList'
    }).state("chapterInfo", {
        url: '/chapterInfo/:bookid/:chapterid',
        templateUrl: 'static/view/factory.chapterInfo.html',
        resolve: {
            detail: function($q, $rootScope, $stateParams, appService) {
                var defer = $q.defer();

                var bookInfo = appService.getBookInfo($stateParams.bookid).getInfo();
                if (!bookInfo) {
                    defer.reject(false);
                } else {
                    defer.resolve(bookInfo);
                }

                return defer.promise;
            }
        },
        controller: 'chapterInfoCtrl',
        controllerAs: 'chapterInfo'
    })
    
};
},{}],8:[function(require,module,exports){
module.exports = ['$scope', 'appService', '$rootScope', '$state', function($scope, appService, $rootScope, $state) {
    var vm = this;
    
    vm.toCreateBook = function() {
        console.log("hello");
        $state.go("bookInfo", {id: 0});
    };
    
    vm.toHistoryList = function() {
        $state.go("bookList", {page: 1});  
    };

    vm.loadEpub = function() {
        var utils = appService.getUtil();

        utils.select_files(function(files) {

            if (files.length != 1) {
                alert("只可以选择一个Epub");
                return false;
            }
            
            appService.getTask().create("parse", {
                epub: files[0]
            }, function(result) {
                if (result.status == "完成") {
                    $state.go("chapters", {id: result.targetId});
                }
                
                $rootScope.$emit("notify", "Epub读取: " + result.status);
            });
            
        }, ['epub'])
    }
}];
},{}],9:[function(require,module,exports){
module.exports = angular.module('baka.factory', ['ui.router'])
    .config(require("./config"))
    .run(function($rootScope) {
        $rootScope.$on( '$stateChangeError',
            function ( event, toState, toParams, fromState, fromParams, error ) {
                event.preventDefault();

                console.error(error);
                console.log(toState.name);
            });
    })
    .controller("factoryStartCtrl", require("./factoryStartCtrl"))
    .controller('bookInfoCtrl', require("./bookInfoCtrl"))
    .controller("chapterListCtrl", require("./chapterListCtrl"))
    .controller("bookListCtrl", require("./bookListCtrl"))
    .controller('chapterInfoCtrl', require('./chapterInfoCtrl'));
},{"./bookInfoCtrl":3,"./bookListCtrl":4,"./chapterInfoCtrl":5,"./chapterListCtrl":6,"./config":7,"./factoryStartCtrl":8}],10:[function(require,module,exports){
var app = require("./main");

app.controller("indexController", ['$scope', 'appService', '$state', function($scope, appService, $state) {
    var vm = this;
    
    vm.tabName = "";
    
    vm.switchTab = function(tabName) {
        vm.tabName = tabName;
        
        if (tabName == 'factory') {
            $state.go("init_" + tabName.toLowerCase(), {});
        }
    };
    
    vm.switchTab("factory");
    
}]);
},{"./main":11}],11:[function(require,module,exports){
module.exports = angular.module('baka', [
    'ui.router', 
    'ngMaterial',
    require("./setting").name,
    require("./factory").name
]).config(function($stateProvider) {
    
    $stateProvider.state("init_factory", {
        url: "/init_factory",
        templateUrl: "static/view/factory.start.html",
        controller: "factoryStartCtrl"
    });
    
}).run( function($rootScope, $mdToast) {
    
    $rootScope.$on("notify", function(e, text, hideDelay) {
        text = text || '';
        hideDelay = hideDelay || 1000;
        $mdToast.show(
            $mdToast.simple()
                .content( text )
                .position( 'top left' )
                .hideDelay( hideDelay )
        );
    });
    
    $rootScope.$on("hideNotify", function(e) {
        $mdToast.hide(); 
    });
    
}).filter('to_trusted', ['$sce', function ($sce) {
    return function (text) {return $sce.trustAsHtml(text);}
}]);

require("./services");
require("./directive");
require("./indexController");
},{"./directive":1,"./factory":9,"./indexController":10,"./services":12,"./setting":13}],12:[function(require,module,exports){

var app = require("./main");
app.service("appService", ['$window', function($window) {
    
    this.quit = function() {
        $window.App.quit();
    };
    
    this.getUtil = function() {
        return $window.App.utils;
    };
    
    this.getTask = function() {
        return $window.App.task;
    };
    
    this.getBookInfo = function(id) {
        return $window.App.getBookInfo(id);
    };
    
    this.getSettings = function() {
        return $window.App.settings;  
    };
    
    this.getEnv = function(k) {
        k = k || false;

        var env = $window.App.getAppEnvInfo();
        if (k) {
            return env[k];
        }
        return env;
    };
    
    this.setValue = function(key, value) {
        $window.App.tmpValues[key] = value;  
    };
    
    this.getValue = function(key, defaultValue) {
        if (key in $window.App.tmpValues) {
            return $window.App.tmpValues[key];
        }
        return defaultValue;
    }
    
}]);
},{"./main":11}],13:[function(require,module,exports){
module.exports = angular.module('baka.setting', []).controller('SettingCtrl', require("./settingCtrl"))
},{"./settingCtrl":14}],14:[function(require,module,exports){
module.exports = ['$scope', '$window', 'appService', function($scope, $window, appService) {
    
    var vm = this;
    
    vm.openDevTools = function() {
        $window.App.openDevTools();
    };
    
    vm.bookRuntimePath = appService.getSettings().getValue("bookRuntimePath");
    vm.operName = appService.getSettings().getValue("operName");
    vm.tmpDir = appService.getSettings().getValue("tmpDir");
    
    vm.selectFolder = function(key) {
        appService.getUtil().select_folder(function(name) {
            if (!name) {
                alert("你没有选择:<");
                return false;
            }
            
            vm[key] = name[0];
            alert("选择成功.需要点击[保存]后才会生效.");
        })
    };
    
    vm.save = function() {
        var settings = appService.getSettings();
        settings.setValue("bookRuntimePath", vm.bookRuntimePath);
        settings.setValue("operName", vm.operName);
        settings.setValue("tmpDir", vm.tmpDir);
        
        alert("已保存!")
    };
    
}];
},{}]},{},[2]);
