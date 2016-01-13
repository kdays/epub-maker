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