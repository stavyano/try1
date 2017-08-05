angular.module('MovieShop').factory('OrdersService', ['LoginService','$http', function(LoginService,$http) {
    var service = {};
    service.showMyOrders=function(){
        return $http.get('/showMyLastOrders/' + LoginService.user.UserName)
            .then(function (response) {
                return Promise.resolve(response);
            })
            .catch(function (e){
                return Promise.resolve(e);
            });
    };
    return service;
}]);