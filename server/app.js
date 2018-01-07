var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var urlencodedParser=bodyParser.urlencoded( { extended: false, limit: '5mb' } );

app.use( bodyParser.json({limit: '5mb'}) );
app.use( express.static( 'public' ) );

app.set('port', process.env.PORT || 3000);
app.listen(app.get('port'), function() {
  console.log('Server up:', app.get('port'));
});


app.get( '/', function( req, res ){
  console.log( 'Serving index' );
  res.sendFile( path.resolve( 'public/views/index.html' ) );
});
