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