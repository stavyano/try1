angular.module('MovieShop').factory('MovieService', ['$http', function($http) {
    var service = {};
    service.getRecommended=function(username){
        return $http.get('/recommendedMovies/' + username)
            .then(function (response) {
                return Promise.resolve(response);
            })
            .catch(function (e){
                return Promise.reject(e);
            });
    };
    service.getMovies = function(toRegister) {
        return $http.get('/showAllMovies')
            .then(function(response) {
                return Promise.resolve(response);

            })
            .catch(function (e) {
                return Promise.reject(e);
            });
    };
    return service;
}]);