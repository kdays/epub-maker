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