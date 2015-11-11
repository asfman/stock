var mongoose = require('mongoose');
var config = require('../config');
mongoose.connection.once('error', function(err) {
	console.error("db connection error: " + err);
});
mongoose.connection.once('open', function callback() {
    console.log("db connection open");
});
mongoose.connection.once("connected", function() {
	console.log("Connect to MongoDb success");
});
mongoose.connection.once("disconnected", function() {
	console.log("MongoDB disconnected");
});
exports.connect = function() {
	mongoose.connect(config.mongodb);
}
exports.disconnect = function() {
    mongoose.disconnect();
}