angular.module('MovieShop').controller('ordersController', ['OrdersService','LoginService','$location' ,function (OrdersService,LoginService,$location) {
    var self = this;
    console.log("!!!");
    self.service=LoginService;
    self.orders=[];
    self.init=function(){
        console.log("!!!#@#@!#!@#!");
        if( self.service.isLoggedIn) {
            OrdersService.showMyOrders(self.service.user.UserName).then(function (res) {
                if(isArray(res.data)){
                self.orders=res.data;}
                else{
                    self.orders=[];
                }
            })
        }
        else {
            $location.path('/home');
        }
    };
    self.orderInfo_f=function(){
        var modal = document.getElementById('orderInfo');
        var span = document.getElementsByClassName("close4")[0];
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
    self.showInfo= function(orderId){
        angular.forEach(self.orders,function (order) {
            if(order.OrderID==orderId){
                self.orderInfo=order;
                self.orderInfo_f();
            }
        })
    }
}]);