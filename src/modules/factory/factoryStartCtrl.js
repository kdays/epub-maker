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