
angular.module('MovieShop').controller('loginController', ['LoginService','$location','$window', function (LoginService,$location,$window) {
    var self = this;
    self.username='';
    self.password='';
    self.cookie='';
        self.login = function(valid) {
        if (valid) {
            self.user = {"UserName": self.username, "Password":self.password};
            LoginService.login(self.user,self.cookie).then(function (success) {
                $window.alert('You are logged in');
                $location.path('/home'); //!@!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!11 logged!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            }, function (error) {
                self.errorMessage = error.data;
                $window.alert('log-in has failed');
            })
        }
    };
    self.retrive=function () {
        $location.path('/retrive');
    }
}]);