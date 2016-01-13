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