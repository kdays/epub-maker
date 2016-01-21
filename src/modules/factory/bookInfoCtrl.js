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
    
    vm.cacheTime = new Date().getTime();
    
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
            if (bq.getImagePath("cover.jpg") != vm.nowSelectedCover) {
                bq.addImageFile(vm.nowSelectedCover, "cover.jpg");
            }
            
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