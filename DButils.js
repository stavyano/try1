/**
 * Created by Stav on 29/05/2017.
 */
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;


exports.Select = function (connection, query) {
    return new Promise(function (resolve,reject){
        var req = new Request (query, function(err, rowCount){
            if(err){
                console.log('err select');
                reject(err.message);
            }
        });
        var res = [];
        var properties = [];
        req.on('columnMetadata', function (columns){
            columns.forEach(function (column){
                if(column.colName != null)
                    properties.push(column.colName);
            });
        });
        req.on('row', function (row){
            var item ={};
            for(i=0; i<row.length; i++){
                item[properties[i]] = row[i].value;
            }
            res.push(item);
        });
        req.on('requestCompleted', function(){
            console.log('requestCompleted with '+req.rowCount + ' row(s)');
        //    console.log(res);
            resolve(res);
        });

        connection.execSql(req);
    });

}

exports.Insert = function (connection, query){
    return new Promise(function (resolve,reject){
        var req = new Request (query, function(err, rowCount){
            if(err){
                console.log('err insert'+err.message);
                reject(err.message);
            }
        });
        req.on('requestCompleted', function(){
            console.log('requestCompleted with '+req.rowCount + ' row(s)');
            resolve(true);
        });

        connection.execSql(req);
    });
}

exports.Delete = function (connection, query){
    return new Promise(function (resolve,reject){
        var req = new Request (query, function(err, rowCount){
            if(err){
                console.log('err delete');
                reject(err.message);
            }
        });
        req.on('requestCompleted', function(){
            console.log('requestCompleted with '+req.rowCount + ' row(s)');
            if(req.rowCount==0)
                resolve("There was nothing to delete!");
            else
            resolve(true);
        });

        connection.execSql(req);
    });
}

exports.Update = function (connection, query){
    return new Promise(function (resolve,reject){
        var req = new Request (query, function(err, rowCount){
            if(err){
                console.log('err update');
                reject(err.message);
            }
        });
        req.on('requestCompleted', function(){
            console.log('requestCompleted with '+req.rowCount + ' row(s)');
            if(req.rowCount==0)
                resolve("There was nothing to update!");
            else
                resolve(true);        });
        connection.execSql(req);
    });
}