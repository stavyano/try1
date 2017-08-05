function isArray(data) {
    return Object.prototype.toString.call(data)==='[object Array]';
}
angular.module('MovieShop').controller('searchController', ['SearchService','MovieModel','LoginService', function (SearchService,MovieModel,LoginService,$location,$window) {
    var self = this;
    self.service=LoginService;
    self.results=[];
    self.toSee=false;
    self.seeError=false;
    self.criterias=[{key:"Movie Name",value:"MovieName"},{key:"Year",value:"Year"},{key:"Production",value:"Production"},{key:"Price",value:"Price"}];
    self.searchMovies=function(){
        self.results=[];
        self.toSee=false;
        self.seeError=false;
        SearchService.search(self.criteria.value,self.value).then(function (res) {
            if(isArray(res.data)){
                self.toSee=true;
                angular.forEach(res.data, function (movie) {
                    self.results.push(new MovieModel(movie));
                })
            }
            else{
                self.seeError=true;
                self.error=res.data;
            }
        })
    }
}]);