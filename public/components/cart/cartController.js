angular.module('MovieShop').controller('cartController', ['CartService','MovieModel','LoginService','$window','$location', function (CartService,MovieModel,LoginService,$window,$location) {
    var self = this;
    self.service = LoginService;
    self.cart=CartService.cart;
    self.movies=CartService.allMovies;
    self.init=function () {
        if(self.service.isLoggedIn==false)
        $location.path('/home');
    }
    self.plusitem=function (moviename) {
        CartService.updateCart("plus",moviename);
        self.cart=CartService.cart;
    };
    self.minusitem=function (moviename) {
        CartService.updateCart("minus",moviename);
        self.cart=CartService.cart;
    };
    self.deleteitem=function (moviename) {
        CartService.updateCart("remove",moviename);
        self.cart=CartService.cart;
    };
    self.buy=function () {
        $window.alert('Not available due to erez shalom!');
    }
}]);
