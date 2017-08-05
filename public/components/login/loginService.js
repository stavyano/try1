angular.module('MovieShop').factory('LoginService', ['CartService','localStorageService','$http', function(CartService,localStorageService,$http) {
    var service = {};
    service.isLoggedIn = false;
    service.lastlogin="";
    service.cookiesaved=false;
    service.cartservice=CartService;
    service.login = function(user,cookie) {
        return $http.post('/login', user)
            .then(function(response) {
                var token = response.data;
                $http.defaults.headers.common = {
                    'my-Token': token,
                    'user' : user.UserName
                };
                if(cookie){
                    CartService.tosave=true;
                    var d=localStorageService.cookie.get("Date");
                    var currDate=new Date();
                    if(d) {
                        service.lastlogin =d;
                        service.cookiesaved=true;
                    }
                    else{
                        service.cookiesaved=false;
                    }
                    localStorageService.cookie.set("UserName",user.UserName);
                    localStorageService.cookie.set("Password",user.Password);
                    localStorageService.cookie.set("Date",currDate);
                }
                service.isLoggedIn = true;
                service.user=user;

                return Promise.resolve(response);
            })
            .catch(function (e) {
                return Promise.reject(e);
            });

    };
    return service;
}]);