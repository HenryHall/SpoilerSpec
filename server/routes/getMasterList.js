var express = require('express');
var router = express.Router();
var pg = require('pg');
var connection = require('../modules/connection');

router.get('/', function(req, res){

  pg.connect(connection, function(err, client, done){
    var results = [];
    var query = client.query('SELECT * FROM spoilermasterlist');

    query.on('row', function(row){
      results.push({number: row.collectornum, name: row.cardname});
    });

    query.on('end', function(){

      done();
      res.send(results);

    });

  });

});


module.exports = router;
