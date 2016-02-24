
module.exports = function(opts, models){


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

    /* Allow the client to dynamically get the server port */
    app.get('/port', function(req, res){
        res.send(
            JSON.stringify(
                {"port": opts.port}
            ));
    });
    
    io.on("connection", function(socket){
        if(opts.debug) console.log("New client connected.");
        if(opts.debug) console.log("Binding model listeners");
        for(var model in models){
            if(typeof model.bindListeners === 'function'){
                model.bindListeners(opts, socket);
            }
        };
        if(opts.debug) console.log("Finished binding model listeners");

        socket.emit("test");

        socket.on("disconnect", function(){
            if(opts.debug) console.log("Client Disconnected.");
        })
    });

}
