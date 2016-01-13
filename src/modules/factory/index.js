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