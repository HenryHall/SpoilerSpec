var express = require('express');
var router = express.Router();
var pg = require('pg');
var connection = require('../modules/connection');

router.put('/', function(req, res){

  pg.connect(connection, function(err, client, done){

    client.query('UPDATE spoilermasterlist SET cardname = $1, status = "spoiled" WHERE collectornum = $2', [req.body.name, req.body.number])
    .then(function(){
      //Success
      var results = [];
      var query = client.query('SELECT * FROM spoilermasterlist');

      query.on('row', function(row){
        results.push(row);
      });

      query.on('end', function(){

        done();
        res.send(results);

      });
    }, function(err){
      //Error
    });
  });
});


module.exports = router;
