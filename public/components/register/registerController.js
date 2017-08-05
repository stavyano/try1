angular.module('MovieShop').controller('registerController', ['RegisterService','$location','$window', function (RegisterService,$location,$window) {
    var self = this;
    self.r1="";
    self.r2="";
    self.r3="";
    self.r4="";
    self.r5="";
    self.r6="";
    self.r7="";
    self.r8="";
    self.r9="";
    self.r10="";
    self.r11="";
    self.r12="";
    self.selectedCountry={};
    self.selectedCategory=[];
    self.confirm_password="";
    self.register = function (valid) {

        if (valid) {
            if(self.r2.equals(self.confirm_password)) {
                var toAdd = [];
                self.selectedCategory.forEach(function (item) {
                    toAdd.push(item.CategoryName);
                });
                self.newUser = {
                    "FirstName": self.r1,
                    "LastName": self.r2,
                    "Address": self.r3,
                    "City": self.r4,
                    "Country": self.selectedCountry.Name,
                    "Phone": self.r5,
                    "Cellular": self.r6,
                    "Mail": self.r7,
                    "CreditCardNumber": self.r8,
                    "GrandMother": self.r9,
                    "Teacher": self.r10,
                    "UserName": self.r11,
                    "Password": self.r12,
                    "Categories": toAdd
                }
                RegisterService.register(self.newUser).then(function (success) {
                    if (success.data) {
                        $window.alert('You are now registered');
                        $location.path('/login');
                    }
                    else {
                        $window.alert('username is already in use');
                    }
                }, function (error) {
                    self.errorMessage = error.data;
                    $window.alert('log-in has failed');
                })
            }
            else{
                $window.alert('password and confirm password are not equal');
            }
        }
    }
}]);