var express = require('express');
var router = express.Router();
var pg = require('pg');
var connection = require('../modules/connection');

router.get('/', function(req, res){

  pg.connect(connection, function(err, client, done){
    var results = [];
    console.log(connection);
    var query = client.query('SELECT * FROM spoilermasterlist');

    query.on('row', function(row){
      results.push(row);
    });

    query.on('end', function(){

      done();
      res.send(results);

    });

  });

});


module.exports = router;
