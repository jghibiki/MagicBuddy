
module.exports = function(opts){

    var express = require('express');
    var server = require('http').createServer(app);
    var io = require('socket.io')(server);
    var bodyParser = require("body-parser");

    var app = express();
    var server = require('http').Server(app);
    var io = require('socket.io')(server);


    server.listen(opts.port, opts.host);
    console.log("Listening on port " + opts.port + ".")
    app.use(express.static("./app"))
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());


    io.on("connection", function(socket){
        
    });

}
