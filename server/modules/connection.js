
var pg = require('pg');
var connectionString = '';
if(process.env.DATABASE_URL !== undefined) {
 connectionString = process.env.DATABASE_URL;
 pg.defaults.ssl = true;
}
// else {
//  connectionString = 'postgres://localhost:5432/shoutouts'
// }

module.exports = connectionString;
