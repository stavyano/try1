angular.module('MovieShop').controller('movieController', ['CartService','MovieModel','MovieService','LoginService','$window','$location' ,function (CartService,MovieModel,MovieService,LoginService,$window,$location) {
    var self = this;
    self.service=LoginService;
    self.parameters=[{key:"Movie Name",value:"MovieName"},{key:"Year",value:"Year"},{key:"Director",value:"Director"}];
    self.recommended=[];
    self.allMovies=[];
    self.amounts=[];
    self.init=function(){
        if(self.service.visited==false){
            $location.path('/home');
        }
        if(LoginService.isLoggedIn) {
            MovieService.getRecommended(self.service.user.UserName).then(function (res) {
                angular.forEach(res.data, function (recMovie) {
                    self.recommended.push(new MovieModel(recMovie));
                })
            }).then(function () {
                MovieService.getMovies().then(function(res){
                    angular.forEach(res.data, function (movie) {
                        self.allMovies.push(new MovieModel(movie));
                        self.amounts[movie.MovieName]=1;
                    })
                })
            })
        }
        else{
            MovieService.getMovies().then(function(res){
                angular.forEach(res.data, function (movie) {
                    self.allMovies.push(new MovieModel(movie));
                })
            })

        }
    };
    self.movieInfo_f=function(){
        var modal = document.getElementById('movieInfo');
        var span = document.getElementsByClassName("close3")[0];
        modal.style.display = "block";
        span.onclick = function () {
            modal.style.display = "none";
        }
        window.onclick = function (event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }
    };
    self.showInfo= function(movies,movieName){
        angular.forEach(movies, function (movie) {
            if(movie.MovieName==movieName) {
                self.movieInfo = movie;
                self.movieInfo_f();
            }
        })
    };
    self.AddToCart=function(movie,amount){
        CartService.addToCart(movie,amount)
            .then(function(){
                $window.alert("Movie was successfully added to your cart!")
                })
        };
}]);