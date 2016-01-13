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