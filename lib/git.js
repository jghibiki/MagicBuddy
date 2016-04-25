"use strict";

var rimraf = require("rimraf");
var fs = require("fs");
var path = require("path");

module.exports = function(opts, models, callback){

    var gitManager = {};
    var data_path = path.normalize(opts["data"])
    gitManager.git = require('simple-git')(data_path);

    gitManager.bindListeners = function(opts, socket){
        if(opts.debug) console.log("Binding Git Listeners");
        
        socket.on("git:clone", function(repoPath){
            gitManager.clone(repoPath, function(){
                socket.emit("git:clone::response");
            });
        });

       socket.on("git:commit", function(message){
            gitManager.commit(message, function(){
                socket.emit("git:commit::response");
            });
        });

       socket.on("git:pull", function(){
           gitManager.pull(function(){
                models["collection"]._loadCollection();
                models["decks"]._loadDecks();
                socket.emit("git:pull::response");
            });
        });

       socket.on("git:push", function(){
            gitManager.push(function(){
                socket.emit("git:push::response");
            });
        });

       socket.on("git:status", function(){
            gitManager.status();
       });
    };

    gitManager.clone = function(repoPath, callback){
        if(opts["debug"]) console.log("Cloning " + repoPath + ".");
        
        //remove old data dir
        rimraf(opts["data"], function(){
            
            //create new data dir
            if (!fs.existsSync(opts["data"])){
                    fs.mkdirSync(opts["data"]);
            }

            //clone into data dir
            gitManager.git.clone(repoPath, ".", function(){
                if(opts["debug"]) console.log("Finished cloning " + repoPath + ".");
                callback();
            });
        });
    };

    gitManager.commit = function(message, callback){
        if(opts["debug"]) console.log("Committing Changes"); 
        gitManager.status(function(status){

            var files = [].concat(status.not_added).concat(status.modified).concat(status.deleted)
            gitManager.add(files, function(){
                gitManager.git.commit(message, files, function(err, data){
                    if(err){
                        console.log("Error: " + err);
                    }
                    else{
                        console.log(data);
                        if(opts["debug"]) console.log("Finished Changes"); 
                        callback();
                    }
                });
            });
        });
    }

    gitManager.status = function(callback){
        gitManager.git.status(function(err, data){
            if(err){
                console.log("Error: " + err);
            }
            else{
                if(typeof callback === "function"){
                    callback(data);
                }
            }
        });
    }

    gitManager.add = function(files, callback){
        gitManager.git.add(files, function(err, data){
            if(err){
                console.log("Error: " + err);
            }
            else{
                if(typeof callback === "function"){
                    callback(data);
                }
            }
        })
    };

    gitManager.push = function(callback){
        if(opts["debug"]) console.log("Pushing changes"); 
        gitManager.git.push("origin", "master", function(){
            if(opts["debug"]) console.log("Finished pushing changes"); 
            callback();
        });
    };

    gitManager.pull = function(callback){
        if(opts["debug"]) console.log("Pulling changes"); 

        gitManager.git.pull("origin", "master", function(){
            if(opts["debug"]) console.log("Finished pulling changes"); 
            if(callback !== undefined || callback !== null){
                callback();
            }
        });
    }

    if(callback !== null || callback !== undefined){
        callback(gitManager);
    }
    return gitManager

}
