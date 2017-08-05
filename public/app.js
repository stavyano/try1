(function () {
    'use strict';
    var app = angular.module('MovieShop', ["LocalStorageModule","ngRoute"]);
    app.filter('categoryFilter', function () {
        return function (input, category) {
            if ((input)== undefined) {
                return null;
            }
            else {
                if ((category) == undefined) {
                    return input;
                }
                if ((category) == "All") {
                    return input;
                }
                var output = [];
                input.forEach(function (item) {
                    item.Categories.forEach(function (item2) {
                        if (item2==category) {
                            output.push(item);
                        }
                    })
                })
                return output;
            }
        };
    })
    app.factory('MovieModel', function(){
        function MovieModel(movie){
            if(movie)
                this.setData(movie);
        }
        MovieModel.prototype={
            setData: function (movieData) {
                angular.extend(this,movieData);
            }
        };
        return MovieModel;
    });
    app.controller('mainController', ['localStorageService','LoginService','$http','MovieModel','$location','$window' ,function (localStorageService,LoginService,$http,MovieModel,$location,$window) {
        var vm = this;
        vm.service=LoginService;
        vm.cookiemaster=localStorageService.cookie;
        vm.cartmaster=localStorageService;
        vm.movieModel=MovieModel;
        vm.Categories = [];
        vm.Categories1 = [];
        vm.Countries = [];

        vm.logout=function () {
            vm.cookiemaster.clearAll();
            vm.cartmaster.clearAll()
            &window.alert("Bye "+vm.service.user.UserName+"!\nWe hope to see you again");
            vm.service.isLoggedIn=false;
            vm.service.user.userName="guest";
            $location.path("/home");
        }
        vm.init = function () {
            var cookie= vm.cookiemaster.get("UserName");
            if(cookie){
                var p=vm.cookiemaster.get("Password");
                vm.service.login({"UserName":cookie,"Password":p},true).then(function(res){
                    vm.getcountries();
                    vm.getCategories();
                    $location.path('/logged');
                })
            }
            else{
                vm.getcountries();
                vm.getCategories();
            }
        }

        vm.selectedCountry;
        vm.currentPassword="";
        vm.currentUserName = "";
        vm.isPasswordValid = false;
        vm.hot5Movies=[];
        vm.newMovies=[];
        vm.isError = false;
        vm.getCategories = function () {
            var requestUrl = '/categories';
            $http.get(requestUrl).then(function (response) {
                angular.forEach(response.data, function (movie) {
                    vm.Categories.push(new MovieModel(movie));
                })
                vm.Categories1 = vm.Categories.slice();
                var all = {
                    CategoryID: "0",
                    CategoryName: "All"
                }
                vm.Categories1.push(all);

            }).then(vm.get5)
                .then(vm.getnew)
                .then(vm.service.cartservice.loadCart)
            };
        vm.getnew = function () {
            var requestUrl = '/logged';
            return $http.get(requestUrl).then(function (response) {
                    angular.forEach(response.data, function (movie) {
                        vm.newMovies.push(new MovieModel(movie));
                    })
                    return Promise.resolve(response.data);
                })
            };
        vm.get5 = function () {
            var requestUrl = '/home';
           return  $http.get(requestUrl).then(function (response) {
               angular.forEach(response.data, function (movie) {
                   vm.hot5Movies.push(new MovieModel(movie));
               });
                return Promise.resolve(response.data);
            })
        };

        vm.getcountries = function () {
            $http.get("countries.xml", {
                transformResponse: function (cnv) {
                    var x2js = new X2JS();
                    var aftCnv = x2js.xml_str2json(cnv);

                    return aftCnv;
                }
            })
            .then(function (response) {
                response.data.Countries.Country.forEach(function(item){
                    var name = item.Name;
                    var toADD = {
                        "Name":name
                    }
                    vm.Countries.push(toADD);
                })
            });
        };
        vm.about_f=function(){
            var modal = document.getElementById('about');
            var span = document.getElementsByClassName("close1")[0];
            modal.style.display = "block";
            span.onclick = function () {
                modal.style.display = "none";
            }
            window.onclick = function (event) {
                if (event.target == modal) {
                    modal.style.display = "none";
                }
            }
        }
        vm.movieInfo_f=function(){
            var modal = document.getElementById('movieInfoIndex');
            var span = document.getElementsByClassName("close2")[0];
            modal.style.display = "block";
            span.onclick = function () {
                modal.style.display = "none";
            }
            window.onclick = function (event) {
                if (event.target == modal) {
                    modal.style.display = "none";
                }
            }
        }
        vm.showInfo= function(movies,movieName){
            angular.forEach(movies, function (movie) {
                if(movie.MovieName==movieName) {
                    vm.movieInfo = movie;
                    vm.movieInfo_f();
                }
            })
        }
    }
    ]);

    app.config(function (localStorageServiceProvider) {
        localStorageServiceProvider
            .setStorageCookie(1, '/', false);
    });
    app.config(['$locationProvider', function ($locationProvider) {
        $locationProvider.hashPrefix('');
    }]);
    app.config(function (localStorageServiceProvider) {
        localStorageServiceProvider
            .setPrefix('MovieShop');
    });
    app.config(['$routeProvider', function ($routeProvider) {
        $routeProvider
        .when("/home", {
            templateUrl: "components/home/home.html",
            controller: "mainController",

        })
        .when("/login", {
            templateUrl: "components/login/login.html",
            controller: "loginController"
        })
        .when("/register", {
            templateUrl: "components/register/register.html",
            controller: "registerController"
        })
        .when("/movie", {
            templateUrl: "components/movie/movie.html",
            controller: "movieController"
        })
        .when("/search", {
            templateUrl: "search/search.html",
            controller: "searchController"
        })
        .when("/retrive", {
            templateUrl: "components/retrive/retrive.html",
            controller: "retriveController"
        })
            .when("/search", {
                templateUrl: "components/search/search.html",
                controller: "searchController"
            })
            .when("/orders", {
                templateUrl: "components/orders/orders.html",
                controller: "ordersController"
            })
            .when("/cart", {
                templateUrl: "components/cart/cart.html",
                controller: "cartController"
            })
        .otherwise({ redirectTo: '/home', });
    }]);

})();