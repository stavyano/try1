angular.module('MovieShop').factory('RetriveService', ['$http', function($http) {
    var service = {};
    service.retrive = function(toRetrive) {
        return $http.post('/retrivePassword', toRetrive)
            .then(function(response) {
                if (response.data.length == 0) {
                    return Promise.resolve("f");
                }
                else {
                    return Promise.resolve(response.data[0].Password);
                }
            })
            .catch(function (e) {
                return Promise.reject(e);
            });
    };
    return service;
}]);
