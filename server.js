/**
 * Created by Stav on 29/05/2017.
 */
var express = require('express'); // Loading the express module to the server.
var app = express(); // activating express
var cors = require('cors');
var path = require('path');
var DButils = require("./DButils.js");
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
var Connection = require('tedious').Connection;
var oxr = require('open-exchange-rates'),
    fx = require("money");
oxr.set({ app_id: 'b75fb9ee0b6c48c1b696ac50835d8554' })
app.set('port',3100);
//app.use(cors());
app.use(express.static(__dirname + '/public'));

app.locals.users={};
app.use(bodyParser.json()); // Enabling access to "req.body" as a json file.
var config = {
    userName: 'adarstav',
    password: 'VitYanovsky1',
    server: 'moviesadarstav.database.windows.net',
    requestTimeout: 30000,
    options: {encrypt: true, database: 'db_movies'}
};
var connection = new Connection(config)
connection.on('connect', function(err) {
    if (err) {
        console.error('error connecting; ' + err.stack);
        return;
    }
    console.log("connected Azure");
});
app.listen(app.get('port'), function() {
    console.log('I am listening on localhost:3100');
    // server is open and listening on port 3100, to access: localhost:3100 in any browser.
});
function checkLogin(req) {
    var token = req.headers["my-token"];
    var user = req.headers["user"];
    if (!token || !user)
        return false;
    var validToken = app.locals.users[user];
    if (validToken == token)
        return true;
    else return false;
}
var getMovies = function (oreders) {
    return new Promise(function (resolve,reject){
        var dict ={};
        oreders.forEach(function (item) {
            var key=item.MovieID.toString();
            if(!(key in dict)){
                dict[key]=item.Amount;
            }
            else {
                var num=parseInt(dict[key])+parseInt(item.Amount);
                dict[item.MovieID] = num;
            }
        });
        var sortable=[];
        for (var movieID in dict) {
            sortable.push([movieID, dict[movieID]]);
        }
        sortable.sort(function(a, b) {
            return b[1] - a[1];
        });
        var valuesArray = [];
        for (i = 0; i < 5; i++)
        {
            valuesArray.push(sortable[i][0]);
        }
        resolve(valuesArray);
    });
};
var createMovieDirector = function(movies) {
    return new Promise(function (resolve, reject) {
        var director;
        var moviesRet = [];
        var dict={};
        var query = "SELECT directorID,firstName,lastName FROM Directors;"
        var item1;
        DButils.Select(connection, query)
            .then(function (ans) {
                ans.forEach(function(item){
                    console.log(item.directorID);
                    dict[item.directorID] = ""+ item.firstName +" "+ item.lastName;
                })
                movies.forEach(function(item) {
                   item.Director=dict[item.Director]
                    moviesRet.push(item);
                })
                resolve(moviesRet);
            })
    });
};
var createMovieProduction = function(movies) {
    return new Promise(function (resolve, reject) {
        var moviesRet = [];
        var dict={};
            var query = "SELECT ProductionID,Name FROM Productions;";
            DButils.Select(connection, query)
                .then(function (ans) {
                    ans.forEach(function(item){
                        dict[item.ProductionID] = item.Name;
                    })
                    movies.forEach(function(item) {
                        var month = (item.PublishDate).getUTCMonth() + 1; //months from 1-12
                        var day = (item.PublishDate).getUTCDate();
                        var year = (item.PublishDate).getUTCFullYear();
                        if(month<10){
                            month=""+0+month;
                        }
                        if(day<10){
                            day=""+0+day;
                        }
                        var newdate = year + "-" + month + "-" + day;
                        var obj = {
                            "MovieID":item.MovieID,
                            "MovieName": item.MovieName,
                            "Year": item.Year,
                            "Description": item.Description,
                            "Director":  item.directorID,
                            "Production":  dict[item.ProductionID],
                            "PublishDate":newdate,
                            "PicturePath": item.PicturePath,
                            "Price": item.Price,
                            "Categories":[]
                        }
                        console.log(obj);
                        moviesRet.push(obj);
                    })
                    resolve(moviesRet);
                })
    });
};
var createMovieCategories = function(movies){
    var dict={};
    var toRet=[];
  return new Promise(function(resolve,reject){
      DButils.Select(connection,"SELECT * FROM MovieCategories")
          .then(function (ans)
           {
              ans.forEach(function(item){
                  var key=item.MovieID.toString();
                  if(!(key in dict)){
                      dict[key]=[];
                      dict[key].push(item.CategoryID);
                  }
                  else
                      dict[key].push(item.CategoryID);
              })
               console.log(dict);
               movies.forEach(function(item){
                   item.Categories=[];
                   item.Categories=dict[item.MovieID].slice();
                   delete item.MovieID;
                   toRet.push(item);
           })
               resolve(toRet);
          })

  });
};
var getHotFive = function (movies) {
    return new Promise(function (resolve, reject) {
        var hot5Movies=[];
        DButils.Select(connection, 'Select * from Movies')
            .then(function (ans) {
                ans.forEach(function(item){
                    var id=""+item.MovieID;
                    if(movies.indexOf(id)!=-1){
                        hot5Movies.push(item);
                    }
                })
                resolve(hot5Movies);
            })
    });
};
var createCategoryName = function(movies){
    return new Promise(function(resolve,reject){
        var dict={};
        var toRet=[];
        DButils.Select(connection,"SELECT * FROM Categories")
            .then(function(ans){
                ans.forEach(function(item){
                    dict[item.CategoryID]=item.CategoryName;
                })
                movies.forEach(function(item){
                    var arr=[]
                      arr=item.Categories.slice();
                    for(i=0;i<arr.length;i++){
                        arr[i]=dict[arr[i]];
                    }
                    item.Categories=arr.slice();
                    toRet.push(item);
                })
                resolve(toRet);
            })
    });
};
app.get('/home', function (req,res){
        DButils.Select(connection,'Select * from  MoviesInOrders')
            .then(getMovies)
            .then(getHotFive)
            .then(createMovieProduction)
            .then(createMovieCategories)
            .then(createCategoryName)
            .then(createMovieDirector)
            .then(function(ans){
                res.send(ans);
            })
            .catch(function (err){
                res.status(400).send(err);
            })
})
function currentdate(){
    var today = new Date();
    var month = today.getUTCMonth() + 1; //months from 1-12
    var day = today.getUTCDate();
    var year = today.getUTCFullYear();
    if(month<10){
        month=""+0+month;
    }
    if(day<10){
        day=""+0+day;
    }
    var newdate = year + "-" + month + "-" + day;
    return newdate;
}
function datebeforemonth(today){
    var res;
    var date=today.split("-");
    if(date[1]=="01"){
        var year=parseInt(date[0])-1;
        res=""+year+"-12-"+date[2];
        return res;
    }
    var month=date[1]-1;
    if(date[2]<10){
        date[2]=""+0+date[2];
    }
    if (month<10){
        return ""+date[0]+"-0"+month+"-"+date[2];
    }
    else
        return ""+date[0]+"-"+month+"-"+date[2];
}
var getNewest = function (movies) {
    return new Promise(function(resolve,reject){
        var toRet=[];
        var today=currentdate();
        var monthBefore=datebeforemonth(today);
        movies.forEach(function(item){
            var d1=new Date(item.PublishDate);
            var d2=new Date(monthBefore);
            if(+(d1)>=+d2)
                toRet.push(item);
        })
        resolve(toRet)
    });
};
app.get('/logged', function(req,res){
    var query="SELECT * FROM MOVIES"
    DButils.Select(connection,query)
        .then(createMovieProduction)
        .then(createMovieCategories)
        .then(createCategoryName)
        .then(createMovieDirector)
        .then(getNewest)
        .then(function(ans){
            res.send(ans);
        })
        .catch(function(err){
            res.status(400).send(err.message);
        })
})
var findMovieWithProdName=function(prodID){
    return new Promise(function(resolve,reject){
        if(prodID.length==0){
            resolve(prodID);
        }
            var query="SELECT * FROM MOVIES WHERE ProductionID='"+prodID[0].ProductionID+"';";
            DButils.Select(connection,query)
                .then(function(ans){
                    resolve(ans);
        })

    });
};
app.get('/search', function(req, res) {
    var cat=req.query.category;
    var value=req.query.value;
    switch(cat) {
        case 'MovieName':
            var query="SELECT * FROM MOVIES WHERE MovieName='"+value+"';";
            DButils.Select(connection,query)
                .then(createMovieProduction)
                .then(createMovieCategories)
                .then(createCategoryName)
                .then(createMovieDirector)
                .then(function(ans) {
                    if (ans.length == 0) {
                        res.status(200).send("there is no movie with this name")
                    }
                    else
                        res.send(ans)
                })
                    .catch(function(err){
                        res.status(400).send(err.message);
                    })
            break;
        case 'Year':
            var query="SELECT * FROM MOVIES WHERE Year='"+value+"';";
            DButils.Select(connection,query)
                .then(createMovieProduction)
                .then(createMovieCategories)
                .then(createCategoryName)
                .then(createMovieDirector)
                .then(function(ans) {
                    if (ans.length == 0) {
                        res.status(200).send("there is no movie at this year")
                    }
                    else
                        res.send(ans)
                })
                .catch(function(err){
                    res.status(400).send(err.message);
                })
            break;
        case 'Production':
            var query="SELECT ProductionID FROM Productions WHERE Name='"+value+"';";
            DButils.Select(connection,query)
                .then(findMovieWithProdName)
                .then(createMovieProduction)
                .then(createMovieCategories)
                .then(createCategoryName)
                .then(createMovieDirector)
                .then(function(ans) {
                    if (ans.length == 0) {
                        res.status(200).send("there is no movie with this production")
                    }
                    else
                        res.send(ans)
                })
                .catch(function(err){
                    res.status(400).send(err.message);
                })
            break
        case 'Price':
            var query="SELECT * FROM MOVIES WHERE Price<='"+value+"';";
            DButils.Select(connection,query)
                .then(createMovieProduction)
                .then(createMovieCategories)
                .then(createCategoryName)
                .then(createMovieDirector)
                .then(function(ans) {
                    if (ans.length == 0) {
                        res.status(200).send("there is no movie at this price")
                    }
                    else
                        res.send(ans)
                })
                .catch(function(err){
                    res.status(400).send(err.message);
                })
            break;
        default:
            res.send("category value is not known")
            break;
    }
})
app.get('/showAllMovies',function(req,res){
    var query="SELECT * FROM MOVIES"
    DButils.Select(connection,query)
        .then(createMovieProduction)
        .then(createMovieCategories)
        .then(createCategoryName)
        .then(createMovieDirector)
        .then(function (ans) {
            res.send(ans);
        })
        .catch(function(err){
            res.status(400).send(err.message);
        })
})
app.post('/retrivePassword',function(req,res){
    var userName=req.body.UserName;
    var grandMother=req.body.GrandMother;
    var address=req.body.Address;
    var teacher=req.body.Teacher;
    var query="SELECT Password FROM Clients WHERE UserName='"+userName+"' AND GrandMother='"+grandMother+"' AND Address='"+address+"' AND Teacher='"+teacher+"';";
    console.log(query);
    DButils.Select(connection,query).then(function(ans){
        if(ans.length==0)
            res.send(ans);
        else
            res.send(ans);
    })
        .catch(function(err){
            res.status(400).send(err.message);
        })
})
app.put('/updateAmount',function(req,res){
    var query="UPDATE Movies SET StokAmount="+req.body.StokAmount+" WHERE MovieName='"+req.body.MovieName+"';";
    DButils.Update(connection,query)
        .then(function(ans){
            res.send(ans);
        })
        .catch(function (err){
            res.status(400).send(err);
        })
})
app.delete('/deleteClient',function (req,res){
    var query="DELETE FROM Clients WHERE UserName='"+req.body.UserName+"';";
    var query2="SELECT ClientID FROM Clients WHERE UserName='"+req.body.UserName+"';";
    DButils.Select(connection,query2)
        .then(function(ans){
            if(ans.length==0){
                res.send("there is nothing to delete");
            }
            else {
                var query3 = "DELETE FROM ClientCategory WHERE ClientID=" + ans[0].ClientID + ";";
                DButils.Delete(connection, query3)
                    .then(function (ans) {
                        DButils.Delete(connection, query)
                            .then(function (ans) {
                                res.send(ans)
                            })
                    })
            }
        })
        .catch(function (err){
            res.status(400).send(err);
            })
})
app.delete('/deleteMovie',function (req,res){
    var query="DELETE FROM Movies WHERE MovieName='"+req.body.MovieName+"';";
    var query2="SELECT MovieID FROM Movies WHERE MovieName='"+req.body.MovieName+"';";
    DButils.Select(connection,query2)
        .then(function(ans){
            if(ans.length==0){
                res.send("there is nothing to delete");
            }
            else {
                var query3 = "DELETE FROM MovieCategories WHERE MovieID=" + ans[0].MovieID + ";";
                DButils.Delete(connection, query3)
                    .then(function (ans) {
                        DButils.Delete(connection, query)
                            .then(function (ans) {
                                res.send(ans)
                            })
                    })
            }
        })
        .catch(function (err){
            res.status(400).send(err);
        })
})
app.get('/showAllOrders',function (req,res) {
    DButils.Select(connection,"SELECT * FROM Orders")
        .then(getUserNameOfUserId)
        .then(getMoviesByMoviesId)
        .then(buildOrders)
        .then(function (ans){
            res.send(ans);
        })
        .catch(function (err){
            res.status(400).send(err);
        })
})
app.get('/categories',function(req,res){
    DButils.Select(connection,"SELECT * FROM Categories")
        .then(function(ans){
            res.send(ans);
        })
        .catch(function (err){
            res.status(400).send(err);
        })
})
app.get('/getExchange',function (req,res){
        var price=req.query.Price;
        var from=req.query.From;
        var to=req.query.To;
    oxr.latest(function() {
        // Apply exchange rates and base rate to `fx` library object:
        fx.rates = oxr.rates;
        fx.base = oxr.base;
        // money.js is ready to use:
        var newPrice = {"Price" : fx(price).from(from).to(to)}; // ~8.0424
        res.send(newPrice);

    });

})
var getUserNameOfUserId=function (orders) {
    var dict={};
    var toRet=[];
    return new Promise(function(resolve,reject){
        DButils.Select(connection,"SELECT * FROM Clients")
            .then(function (ans) {
                ans.forEach(function (item) {
                    dict[item.ClientID] = item.UserName;
                })
                orders.forEach(function (item) {
                    var month = (item.OrderDate).getUTCMonth() + 1; //months from 1-12
                    var day = (item.OrderDate).getUTCDate();
                    var year = (item.OrderDate).getUTCFullYear();
                    if (month < 10) {
                        month = "" + 0 + month;
                    }
                    var newdate = year + "-" + month + "-" + day;
                    var month1 = (item.ShipmentDate).getUTCMonth() + 1; //months from 1-12
                    var day1 = (item.ShipmentDate).getUTCDate();
                    var year1 = (item.ShipmentDate).getUTCFullYear();
                    if (month1 < 10) {
                        month1 = "" + 0 + month1;
                    }
                    var newdate1 = year1 + "-" + month1 + "-" + day1;
                    var obj = {
                        "OrderID":  item.OrderID,
                        "Client":  dict[item.ClientID],
                        "OrderDate": newdate,
                        "ShipmentDate":  newdate1,
                        "Currency": "" + item.Currency,
                        "TotalAmount": item.TotalAmount,
                        "Movies":""
                    }
                    toRet.push(obj);
                })
        console.log(toRet);
        resolve(toRet);
            })
    });
};
var getMoviesByMoviesId =function (orders) {
    var dict=[];
    var toRet=[];
    return new Promise(function(resolve,reject){
        DButils.Select(connection,"SELECT * FROM MoviesInOrders")
            .then(function(ans) {
                ans.forEach(function (item) {
                    var key=item.OrderID.toString();
                    if (!(key in dict)) {
                        dict[key] = [];
                        var obj={"MovieID":item.MovieID,"Amount":item.Amount}
                        dict[key].push(obj);
                    }
                    else
                        dict[key].push({"MovieID":item.MovieID,"Amount":item.Amount});
                })
                orders.forEach(function (item) {
                    var moviess="";
                    var obj=dict[item.OrderID];
                    for(i=0;i<obj.length;i++){
                        moviess+=obj[i].MovieID+"-"+obj[i].Amount+" ";
                    }
                    item.Movies=moviess;
                 toRet.push(item);
                })
                resolve(toRet);
            })
    });
};
var buildOrders = function(orders){
    var dict={};
    var toRet=[];
    return new Promise(function(resolve,reject){
        DButils.Select(connection,"SELECT * FROM Movies")
            .then(function(ans){
               ans.forEach(function(item){
                   dict[item.MovieID]=item.MovieName;
               })
                orders.forEach(function(item){
                    var obj=[];
                    var movies=item.Movies;
                    var moviesamount=movies.split(" ");
                    for(i=0;i<moviesamount.length-1;i++){
                        var MovieName1=dict[moviesamount[i].split('-')[0]];
                        var AmountOfMovie=moviesamount[i].split('-')[1];
                        var obj1={
                        "MovieName":MovieName1,
                            "Amount":AmountOfMovie
                        }
                        obj.push(obj1);
                    }
                    item.Movies=[];
                    item.Movies=obj.slice();
                    toRet.push(item);
                })
                resolve(toRet);
            })
    });
};


app.post('/register', function(req,res){
    var firstName = req.body.FirstName;
    var lastName = req.body.LastName;
    var address = req.body.Address;
    var city = req.body.City;
    var country = req.body.Country;
    var phone = req.body.Phone;
    var cellular = req.body.Cellular;
    var mail = req.body.Mail;
    var credit = req.body.CreditCardNumber;
    var grand = req.body.GrandMother;
    var teacher = req.body.Teacher;
    var password = req.body.Password;
    var userName = req.body.UserName;
    var categories = req.body.Categories;
    var query = "Select * from Clients Where UserName='"+userName+"';";
    DButils.Select(connection,query)
        .then(function (ans){
            if(ans.length==1)
                res.send(false);
            else{
                query= "Insert Into Clients (FirstName, LastName, Address, City, Country, Phone, Cellular, Mail, CreditCardNumber, GrandMother, Teacher, Password, UserName, isADmin) Values ('"+firstName+"','"+lastName+"','"+address+"','"+city+"','"+country+"','"+phone+"','"+cellular+"','"+mail+"','"+credit+"','"+grand+"','"+teacher+"','"+password+"','"+userName+"',0)";
                console.log(query);
                DButils.Insert(connection, query)
                    .then(function (ans){
                        query="Select ClientID from Clients Where UserName='"+userName+"';";
                        DButils.Select(connection, query)
                            .then(function (ans){
                                var clientID=ans[0].ClientID;
                                var dict = {};
                                var toInsert=[];
                                query="Select * From Categories";
                                DButils.Select(connection,query)
                                    .then(function (ans){
                                        ans.forEach(function (item){
                                            dict[item.CategoryName] = item.CategoryID;
                                        });
                                        categories.forEach(function (item){
                                            toInsert.push(clientID,dict[item]);
                                        });
                                        query="Insert Into ClientCategory Values ";
                                        for(var i=0;i<toInsert.length;i+=2){
                                            query += "('"+toInsert[i]+"','"+toInsert[i+1]+"'),";
                                        }
                                        query = query.slice(0,-1);
                                        query+=";";
                                        console.log(query);
                                        DButils.Insert(connection,query)
                                            .then(function (ans){
                                                res.send(true);
                                            });
                                    })
                            })
                    })
            }
        })
        .catch(function (err){
            res.status(400).send(err)
        })
});

app.post('/addClient', function(req,res){
    var firstName = req.body.FirstName;
    var lastName = req.body.LastName;
    var address = req.body.Address;
    var city = req.body.City;
    var country = req.body.Country;
    var phone = req.body.Phone;
    var cellular = req.body.Cellular;
    var mail = req.body.Mail;
    var credit = req.body.CreditCardNumber;
    var grand = req.body.GrandMother;
    var teacher = req.body.Teacher;
    var password = req.body.Password;
    var userName = req.body.UserName;
    var admin = req.body.IsAdmin;
    var categories = req.body.Categories;
    var query = "Select * from Clients Where UserName='"+userName+"';";
    DButils.Select(connection,query)
        .then(function (ans){
            if(ans.length==1)
                res.send(false);
            else{
                query= "Insert Into Clients (FirstName, LastName, Address, City, Country, Phone, Cellular, Mail, CreditCardNumber, GrandMother, Teacher, Password, UserName, isADmin) Values ('"+firstName+"','"+lastName+"','"+address+"','"+city+"','"+country+"','"+phone+"','"+cellular+"','"+mail+"','"+credit+"','"+grand+"','"+teacher+"','"+password+"','"+userName+"',"+admin+")";
                console.log(query);
                DButils.Insert(connection, query)
                    .then(function (ans){
                        query="Select ClientID from Clients Where UserName='"+userName+"';";
                        DButils.Select(connection, query)
                            .then(function (ans){
                                var clientID=ans[0].ClientID;
                                var dict = {};
                                var toInsert=[];
                                query="Select * From Categories";
                                DButils.Select(connection,query)
                                    .then(function (ans){
                                        ans.forEach(function (item){
                                            dict[item.CategoryName] = item.CategoryID;
                                        });
                                        categories.forEach(function (item){
                                            toInsert.push(clientID,dict[item]);
                                        });
                                        query="Insert Into ClientCategory Values ";
                                        for(var i=0;i<toInsert.length;i+=2){
                                            query += "('"+toInsert[i]+"','"+toInsert[i+1]+"'),";
                                        }
                                        query = query.slice(0,-1);
                                        query+=";";
                                        console.log(query);
                                        DButils.Insert(connection,query)
                                            .then(function (ans){
                                                res.send(true);
                                            });
                                    })
                            })
                    })
            }
        })
        .catch(function (err){
            res.status(400).send(err)
        })
});
app.post('/login', function (req,res) {
    var userName = req.body.UserName;
    var password = req.body.Password;
    var query= "Select * from Clients Where UserName='"+userName+"' And Password='"+password+"';";
    console.log(query);
    DButils.Select(connection, query)
        .then(function (ans){
            if(ans.length==1) {
                var token = ans[0].ClientID;
                app.locals.users[userName] = token;
                res.json(token);
               // res.send(true);
            }
            else
                res.status(403).send("username or password incorrect");
        })
        .catch(function (err){
            res.status(400).send(err);
        })
});

function getOrdersOfClientID(clientID) {
    return new Promise(function (resolve, reject) {
        if(clientID.length==1){
            var query = "Select * from Orders Where ClientID='" + clientID[0].ClientID + "';";
            DButils.Select(connection, query)
                .then(function (ans) {
                    if(ans.length==0){
                        reject("user has no orders");
                    }
                    else
                        resolve(ans);
                })
        }
        else{
            reject("no such user");
        }
    });
};
app.get('/showMyLastOrders/:username', function (req,res){
    var userName = req.params.username;
    var query= "Select ClientID from Clients Where UserName='"+userName+"';"
    console.log(query);
    DButils.Select(connection, query)
        .then(getOrdersOfClientID)
        .then(getUserNameOfUserId)
        .then(getMoviesByMoviesId)
        .then(buildOrders)
        .then(function (ans){
            res.send(ans);
        })
        .catch(function (err){
            res.send(err);
        })
});

app.post('/addMovie', function(req,res){
    var movieName = req.body.MovieName;
    var directorFirstName = req.body.DirectorFirstName;
    var directorLastName = req.body.DirectorLastName;
    var year = req.body.Year;
    var productionName = req.body.ProductionName;
    var description = req.body.Description;
    var picture = req.body.PicturePath;
    var publishDate = req.body.PublishDate;
    var price = req.body.Price;
    var amount = req.body.Amount;
    var categories = req.body.Categories;
    var query = "Select * from Movies Where MovieName='"+movieName+"';";
    DButils.Select(connection,query)
        .then(function (ans){
            if(ans.length==1)
                res.send(false);
            else{
                query="Select ProductionID from Productions where Name='"+productionName+"';";
                var productionId, directorId;
                console.log(query);
                DButils.Select(connection,query)
                    .then(function(ans){
                        productionId=ans[0].ProductionID;
                        query="Select DirectorID from Directors where firstName='"+directorFirstName+"' and lastName='"+directorLastName+"';";
                        console.log(query);
                        DButils.Select(connection,query)
                            .then(function(ans) {
                                directorId = ans[0].DirectorID;
                                query="Insert Into Movies (MovieName, ProductionId, Year, Description, PicturePath, directorID, PublishDate, Price, StokAmount) Values ('"+movieName+"','"+productionId+"','"+year+"','"+description+"','"+picture+"','"+directorId+"','"+publishDate+"','"+price+"','"+amount+"');";
                                console.log(query);
                                DButils.Insert(connection,query)
                                    .then(function (ans){
                                        query="Select MovieID from Movies Where MovieName='"+movieName+"';";
                                        DButils.Select(connection, query)
                                            .then(function (ans){
                                                var movieID=ans[0].MovieID;
                                                var dict = {};
                                                var toInsert=[];
                                                query="Select * From Categories";
                                                DButils.Select(connection,query)
                                                    .then(function (ans){
                                                        ans.forEach(function (item){
                                                            dict[item.CategoryName] = item.CategoryID;
                                                        });
                                                        categories.forEach(function (item){
                                                            toInsert.push(movieID,dict[item]);
                                                        });
                                                        query="Insert Into MovieCategories Values ";
                                                        for(var i=0;i<toInsert.length;i+=2){
                                                            query += "('"+toInsert[i]+"','"+toInsert[i+1]+"'),";
                                                        }
                                                        query = query.slice(0,-1);
                                                        query+=";";
                                                        console.log(query);
                                                        DButils.Insert(connection,query)
                                                            .then(function (ans){
                                                                res.send(true);
                                                            });
                                                    })
                                            })
                                    })
                            })
                    })
            }
        })
        .catch(function (err){
            res.status(400).send(err)
        })
});

app.get('/listMoviesAdmin', function(req,res){
    var query="SELECT * FROM MOVIES"
    DButils.Select(connection,query)
        .then(createMovieProductionAdmin)
        .then(createMovieCategories)
        .then(createCategoryName)
        .then(createMovieDirector)
        .then(function (ans) {
            res.send(ans);
        })
        .catch(function(err){
            res.status(400).send(err.message);
        })
})

var createMovieProductionAdmin = function(movies) {
    return new Promise(function (resolve, reject) {
        var moviesRet = [];
        var dict={};
        var query = "SELECT ProductionID,Name FROM Productions;";
        DButils.Select(connection, query)
            .then(function (ans) {
                ans.forEach(function(item){
                    dict[item.ProductionID] = item.Name;
                })
                movies.forEach(function(item) {
                    var month = (item.PublishDate).getUTCMonth() + 1; //months from 1-12
                    var day = (item.PublishDate).getUTCDate();
                    var year = (item.PublishDate).getUTCFullYear();
                    if(month<10){
                        month=""+0+month;
                    }
                    if(day<10){
                        day=""+0+day;
                    }
                    var newdate = year + "-" + month + "-" + day;
                    var obj = {
                        "MovieID":item.MovieID,
                        "MovieName": item.MovieName,
                        "Year": item.Year,
                        "Description": item.Description,
                        "Director":  item.directorID,
                        "Production":  dict[item.ProductionID],
                        "PublishDate":newdate,
                        "Price": item.Price,
                        "Amount": item.StokAmount,
                        "Categories":[]
                    }
                    console.log(obj);
                    moviesRet.push(obj);
                })
                resolve(moviesRet);
            })
    });
};
var getCategoriesOfClientID = function(clientID) {
    return new Promise(function (resolve, reject) {
        if(clientID.length==1){
            var query = "Select CategoryID from ClientCategory Where ClientID='" + clientID[0].ClientID + "';";
            DButils.Select(connection, query)
                .then(function (ans) {
                    if(ans.length==0){
                        reject("user has no orders");
                    }
                    else
                        resolve(ans);
                })
        }
        else{
            reject("no such user");
        }
    });
};
var getTop5ForUser = function(clientCategories){
    return new Promise(function (resolve, reject) {
        var query="Select Distinct MovieID from MovieCategories where ";
        console.log(query);
        clientCategories.forEach(function (item){
            query += "CategoryID='"+item.CategoryID+"' or ";
        });
        query = query.slice(0,-4);
        query+=";";
        console.log(query);
        DButils.Select(connection, query)
            .then(function (ans){
                var movies=[];
                query="Select Top 5 * from Movies where ";
                ans.forEach(function (item){
                    query +="MovieID='"+item.MovieID+"' or ";
                })
                query = query.slice(0,-4);
                query+=";";
                DButils.Select(connection, query)
                    .then(function (ans){
                        resolve(ans);
                    })
            })
            .catch(function (err){
                reject(err);
            })
    });
};
app.get('/recommendedMovies/:username', function(req,res){
    var userName = req.params.username;
    var query= "Select ClientID from Clients Where UserName='"+userName+"';"
    DButils.Select(connection, query)
        .then(getCategoriesOfClientID)
        .then(getTop5ForUser)
        .then(createMovieProduction)
        .then(createMovieCategories)
        .then(createCategoryName)
        .then(createMovieDirector)
        .then(function (ans){
            res.send(ans);
        })
        .catch(function (err){
            res.status(400).send(err);
        })
});

app.put('/buyCart', function(req,res){
    //moviesAndAmounts:[{"MovieName":"x", "MovieAmount":"10"}]
    var username = req.body.UserName;
    var shipmentDate = req.body.ShipmentDate;
    var currency = req.body.Currency;
    var total = req.body.TotalAmount;
    var moviesAndAmounts = req.body.MoviesAndAmounts;
    var okToOrder=true;
    var dictAmounts ={};
    var dictWantedAmounts={};
    var dictIDs={};
    var query = "Select MovieName, StokAmount, MovieID from Movies;"
    DButils.Select(connection,query)
        .then(function(ans){
            ans.forEach(function (item){
                dictAmounts[item.MovieName]=item.StokAmount;
                dictIDs[item.MovieName]=item.MovieID;
            });
            moviesAndAmounts.forEach(function (item){
                var moviename=item.MovieName;
                var amount=item.MovieAmount;
                var amountOfMovieFromTable=dictAmounts[moviename];
                if(amount>amountOfMovieFromTable)
                    okToOrder=false;
            });
            if(okToOrder){
                query= "Select ClientID from Clients Where UserName='"+username+"';"
                DButils.Select(connection, query)
                    .then(function (ans){
                        var clientID = ans[0].ClientID;
                        var query1="UPDATE Movies SET StokAmount = CASE MovieName ";
                        var query2="ELSE StokAmount END WHERE MovieName IN ("
                        moviesAndAmounts.forEach(function (item){
                            var moviename=item.MovieName;
                            var amount=item.MovieAmount;
                            dictWantedAmounts[moviename]=amount;
                            var amountOfMovieFromTable=dictAmounts[moviename];
                            var newAmount = parseInt(amountOfMovieFromTable)-parseInt(amount);
                            //dictAmounts[moviename]=newAmount;
                            query1+="WHEN '"+moviename+"' THEN '"+newAmount+"' ";
                            query2+="'"+moviename+"',";
                        });
                        query2 = query2.slice(0,-1);
                        query2+=");";
                        query = query1+query2;
                        DButils.Update(connection,query)
                            .then(function(ans){
                                var today = new Date();
                                var dd = today.getDate();
                                var mm = today.getMonth()+1; //January is 0!
                                var yyyy = today.getFullYear();

                                if(dd<10) {
                                    dd='0'+dd
                                }

                                if(mm<10) {
                                    mm='0'+mm
                                }
                                today = yyyy+'-'+mm+'-'+dd;
                                query = "Select MAX(OrderID) AS maxID From Orders;";
                                DButils.Select(connection,query)
                                    .then(function (ans){
                                        var orderID=parseInt(ans[0].maxID)+1;
                                        query="Insert Into Orders (OrderID, ClientID, OrderDate, ShipmentDate, Currency, TotalAmount) Values ('"+orderID+"','"+clientID+"','"+today+"','"+shipmentDate+"','"+currency+"','"+total+"');";
                                        console.log(query);
                                        DButils.Insert(connection,query)
                                            .then(function (ans) {

                                                query="Insert Into MoviesInOrders Values ";
                                                var keysID = Object.keys(dictIDs);
                                                for(var i=0;i<moviesAndAmounts.length;i+=1){
                                                    var keyID = moviesAndAmounts[i].MovieName;
                                                    query += "('"+orderID+"','"+dictIDs[keyID]+"','"+dictWantedAmounts[keyID]+"'),";
                                                }
                                                query = query.slice(0,-1);
                                                query+=";";
                                                console.log(query);
                                                DButils.Insert(connection,query)
                                                    .then(function (ans){
                                                        var obj = {
                                                            "OrderID": orderID,
                                                            "ClientID": clientID,
                                                            "OrderDate": today,
                                                            "ShipmentDate": shipmentDate,
                                                            "Currency": currency,
                                                            "TotalAmount": total,
                                                            "Movies":[]
                                                        }
                                                        var mToAdd=[];
                                                        for(var i=0;i<moviesAndAmounts.length;i+=1){
                                                            var keyID = moviesAndAmounts[i].MovieName;
                                                            var obj1={
                                                                "MovieName":keyID,
                                                                "Amount":dictWantedAmounts[keyID]
                                                            }
                                                            mToAdd.push(obj1);
                                                        }
                                                        obj.Movies=mToAdd.slice();
                                                        console.log(obj);
                                                        res.json(obj);
                                                    })
                                            })

                                    })

                            })
                            .catch(function (err){
                                res.status(400).send(err);
                            })
                    })
            }
            else
                res.send("Not all movies has wanted amount in stok.");
        })

});