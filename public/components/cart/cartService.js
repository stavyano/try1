angular.module('MovieShop').factory('CartService', ['MovieService','localStorageService','MovieModel', function(MovieService,localStorageService,MovieModel) {
    var service = {};
    service.cart=[];
    service.allMovies=[];
    service.tosave=false;
    service.loadCart=function(){
        MovieService.getMovies().then(function (res) {
            angular.forEach(res.data, function (recMovie) {
                service.allMovies.push(new MovieModel(recMovie));
            })
            return Promise.resolve(res);
        }).then(function(){
            var keys=localStorageService.keys();
            angular.forEach(keys,function(key){
                var moviename=key;
                var movieamount=localStorageService.get(key);
                var movieyear='';
                var movieprice='';
                angular.forEach(service.allMovies, function (movie) {
                    if(movie.MovieName==moviename){
                        movieyear=movie.Year;
                        movieprice=movie.Price;
                    }
                })
                var toAdd={
                    "MovieName":moviename,
                    "MovieYear":movieyear,
                    "MovieAmount":movieamount,
                    "MoviePrice":movieprice
                }
                service.cart.push(toAdd);
            })
        });
        return Promise.resolve(true);
    };
    service.addToCart=function(movie,amount){
        var movieamount=null;
        angular.forEach(service.cart,function(item){
            if(item.MovieName==movie){
                movieamount=item.MovieAmount;
            }
        });
        if(movieamount!=null){
            if(service.tosave) {
                localStorageService.set(movie, movieamount + amount);
            }
            angular.forEach(service.cart,function(item){
                if(item.MovieName==movie){
                    item.MovieAmount=item.MovieAmount+amount;
                }
            });
        }
        else{
            if(service.tosave) {
                localStorageService.set(movie, amount);
            }
            angular.forEach(service.allMovies,function(item){
                if(item.MovieName==movie){
                    var toAdd={
                        "MovieName":item.MovieName,
                        "MovieYear":item.Year,
                        "MovieAmount":amount,
                        "MoviePrice":item.Price
                    }
                    service.cart.push(toAdd);
                }
            });
        }
        return Promise.resolve(true);
    }
    service.updateCart=function(action,moviename){
        var movieamount;
        if(action=="plus"){
            angular.forEach(service.cart,function(item){
                if(item.MovieName==moviename){
                     movieamount=item.MovieAmount;
                    item.MovieAmount=item.MovieAmount+1;
                }
            });
            if(service.tosave){
            localStorageService.set(moviename,movieamount+1);
                }
        }
        else{
            if(action=="minus"){
                var newCart=[];
                angular.forEach(service.cart,function(item){
                    if(item.MovieName!=moviename){
                        newCart.push(item);
                    }
                    if(item.MovieName==moviename){
                        movieamount=item.MovieAmount;
                        if(item.MovieAmount==1){
                            if(service.tosave){
                                localStorageService.remove(moviename);
                            }
                        }
                        else{
                            item.MovieAmount=item.MovieAmount-1;
                            newCart.push(item);
                            if(service.tosave){
                                localStorageService.set(moviename,movieamount-1);
                            }
                        }
                    }
                });
                service.cart=newCart.slice();
            }
            else{
                if(service.tosave) {
                    localStorageService.remove(moviename);
                }
                var newCart=[];
                angular.forEach(service.cart,function(item){
                    if(item.MovieName!=moviename){
                        newCart.push(item);
                    }
                });
                service.cart=newCart.slice();
            }
        }
    }
    return service;
}]);