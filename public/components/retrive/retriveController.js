
angular.module('MovieShop').controller('retriveController', ['RetriveService','$location','$window', function (RetriveService,$location,$window) {
    var self=this;
    self.username='';
    self.address='';
    self.teacher='';
    self.grandmother='';

self.retrive = function () {
    var requestUrl = '/retrivePassword';
    self.retrive = function (valid) {
        if (valid) {
            var toRetrive = {
                "UserName": self.username,
                "Teacher": self.teacher,
                "GrandMother": self.grandmother,
                "Address": self.address
            };
            retriveService.retrive(toRetrive).then(function (success) {
                if (!success.equals("f")) {
                    $window.alert("your password is: " + success);
                    $location.path('/login');
                }
                else {
                    $window.alert("your answers are not good");
                }
            }, function (error) {
                self.errorMessage = error.data;
                $window.alert('retrive password is failed');
            })
        }
    };
}
}]);