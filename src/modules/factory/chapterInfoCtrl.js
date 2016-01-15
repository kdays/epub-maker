module.exports = ['appService', '$state', '$stateParams', 'detail', '$scope', '$rootScope', '$mdDialog', function(appService, $state, $stateParams, detail, $scope, $rootScope, $mdDialog) {
    
    var vm = this;
    vm.bookInfo = detail;
    vm.content = "";
    
    var utils = appService.getUtil();
    var q = appService.getBookInfo($stateParams.bookid);
    
    var oldContent = "";
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
        oldContent = vm.content;
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
        //alert("保存成功");
        
        $rootScope.$emit("notify", "保存成功", 500);
        
        $state.go("chapters", {id: $stateParams.bookid});
    };
    
    vm.addImage = function() {
        appService.getUtil().select_files(function(files) {
            /*if (files.length > 5) {
                alert("最多一次性选5张图");
                return false;
            }*/
            
            if (!files || files.length == 0) {
                return;
            }
            
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
        if (!confirm('要清理空行? Are you OK?')) {
            return false;
        }

        vm.content = vm.content.split("\n\n").join("\n");
    };


    vm.back = function() {
        if (vm.content != "" && vm.content != oldContent) {
            if (!confirm('你有过编辑内容,如果返回将会丢失编辑哦,确定返回么?')) {
                return false;
            }
        }
        
        $state.go("chapters", {id: $stateParams.bookid});
    }
    
}];