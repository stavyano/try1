angular.module('MovieShop').factory('SearchService', ['$http', function($http) {
    var service = {};
    service.search=function(criteria,value){
        return $http.get('/search?category='+criteria+'&value='+value)
            .then(function (response) {
                return Promise.resolve(response);
            })
            .catch(function (e){
                return Promise.reject(e);
            });
    };
    return service;
}]);

