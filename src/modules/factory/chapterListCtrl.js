module.exports = ['appService', '$scope', 'detail', '$state', '$rootScope', function(appService, $scope, detail, $state, $rootScope) {
    var vm = this;
    
    vm.bookInfo = detail;
    
    vm.updateSort = function(item, $event) {
        if ($event.srcElement.value != item.rank) {
            item.rank = parseInt($event.srcElement.value);
            if (isNaN(item.rank)) {
                item.rank = 0;
            }
            appService.getBookInfo(detail.id).setChapter(item.id, item.rank, item.name, false);
            
            $state.reload();
        }
    };
    
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