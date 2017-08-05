angular.module('MovieShop').factory('RegisterService', ['$http', function($http) {
    var service = {};
    service.register = function(toRegister) {
        return $http.post('/register', toRegister)
            .then(function(response) {
                    return Promise.resolve(response);

            })
            .catch(function (e) {
                return Promise.reject(e);
            });
    };
    return service;
}]);
