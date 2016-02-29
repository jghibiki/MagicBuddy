var jsonfile = require('jsonfile');
var fs = require('fs');
var utils = require('./utils.js');

module.exports = function(opts, cards, parentCallback){

    var collectionManager = {};

    /************************/
    /* Variable Definitions */
    /************************/

    // the actual collection
    collectionManager.collection = [];

    // set to true if we fouind a check
    collectionManager.deferedCheckpointResolution = false;
    
    // Last date for a checkpoint
    collectionManager.lastCheckpointTime = null;

    // last checkpoint data
    collectionManager.lastCheckpoint = null;

    // indicates if changes have been made since the last save
    collectionManager.changesSinceLastSave = false;

    // indicates if changes have been made since the last checkpoint
    collectionManager.changesSinceLastCheckpoint = false;


    /******************/
    /* Public Methons */
    /******************/

    collectionManager.bindListeners = function(opts, socket){
        if(opts.debug) console.log("Binding collection listeners.");

        socket.on("collection:save", function(obj){
            collectionManager.save(function(){
                socket.emit("collection:save::response");    
            });
        });

        socket.on("collection:checkpoint", function(obj){
            collectionManager.checkpoint();
        });

        socket.on("collection:checkpoint:resolve", function(resolveWithCheckpoint){
            if(!resolveWithCheckpoint){
                collectionManager._loadCollection();
            }
            else{
                collectionManager._loadCheckpoint();
            }
        });

        socket.on("collection:add", function(card){
            if(opts.debug) console.log("Adding card: " + card.name + " to collection.");
            collectionManager.add(card);
        });

        socket.on("collection:remove", function(card){
            if(opts.debug) console.log("Removing card: " + card.name + " from collection.");
            collectionManager.remove(card);
        });

        socket.on("collection:get", function(){
            if(opts.debug) console.log("Sending collection.");
            socket.emit("collection:get::response", collectionManager.collection);
        });
    };


    collectionManager.save = function(callback){
        var timestamp = new Date();
        if(opts.debug) console.log("Saving Collection.");
        jsonfile.writeFile(opts.data + "/collection.json", { 
            "collection": collectionManager.collection,
            "version" : opts.version,
            "timestamp": timestamp
        } , function(err, obj){
            if(err){
                console.log(err);
            }
            else{
                if(opts.debug) console.log("Collection Saved.");
                collectionManager.changesSinceLastSave = false;
                collectionManager.changesSinceLastCheckpoint = false;

                if(fs.existsSync(opts.data + "/collection.checkpoint.json")){
                    if(opts.debug) console.log("Out of date checkpoint file exists. Removing.");
                    fs.unlinkSync(opts.data + "/collection.checkpoint.json");
                    if(opts.debug) console.log("Out of date checkpoint file removed.");
                }

                if(typeof callback === 'function'){
                    callback(collectionManager);
                }
            }
        });
    };

    collectionManager.checkpoint = function(){
        collectionManager.lastCheckpointTime = new Date();
        collectionManager.lastCheckpoint = collectionManager.collection;
        if(opts.debug) console.log("Saving Collection Checkpoint.");
        jsonfile.writeFile(opts.data + "/collection.checkpoint.json", {
            "collection": collectionManager.collection,
            "version": opts.version,
            "timestamp": collectionManager.lastCheckpoint
        }, function(err, obj){
            if(err){
                console.log(err);
            }
            else{
                if(opts.debug) console.log("Collection Checkpoint Saved.");
                collectionManager.changesSinceLastCheckpoint = false;
            }
        });
    };

    collectionManager.add = function(card){
        collectionManager.changesSinceLastSave = true;
        collectionManager.changesSinceLastCheckpoint = true;
        collectionManager.collection.push(card);
    };

    collectionManager.remove = function(card){
        collectionManager.changesSinceLastSave = true;
        collectionManager.changesSinceLastCheckpoint = true;
        for(var i in collectionManager.collection){
            if(collectionCard.id = card){
                collectionManager.collection.pop(i);
                break;
            }
        };
    };



    /*******************/
    /* Private Methods */
    /*******************/

    collectionManager._loadCollection = function(callback){
        if(opts.debug) console.log("Loading Collection.");
        jsonfile.readFile(opts.data + "/collection.json", function(err, obj){
            if(opts.debug) console.log("Collection Loaded.");
            if(opts.debug) console.log("Collection Version: " +  obj.version);
            if(opts.debug) console.log("Last Modified: " + obj.timestamp);
            collectionManager.collection = obj.collection;
            if(typeof callback === 'function') callback(collectionManager.collection);
        });
    };

    collectionManager._loadCheckpoint = function(callback){
        if(opts.debug) console.log("Loading Collection Checkpoint.");
        jsonfile.readFile(opts.data + "/collection.checkpoint.json", function(err, obj){
            if(opts.debug) console.log("Collection Checkpoint Loaded.");
            if(opts.debug) console.log("Collection Version: " + obj.version);
            if(opts.debug) console.log("Last Modified: " + obj.timestamp);
            collectionManager.collection = obj.collection;
            if(typeof callback === 'function') callback(collectionManager.collection);
        });
    }


    function startTimers(){
        collectionManager.checkpointTimer = setInterval(function(){
            collectionManager.checkpoint();
        }, opts.checkpoint*1000);
    }

    /************************/
    /* Load Collection Data */
    /************************/
    utils.mkdirSync(opts.data);

    // if a checkpoint file exists, wait to load data until we can prompt user to select 
    //    which file they would like to prefer.
    if(fs.existsSync(opts.data + "/collection.checkpoint.json")) {
        if(opts.debug) console.log("Deferred Checpoint Resolution.");
        collectionManager.deferedCheckpointResolution = true; 
        parentCallback(collectionManager);
    }
    else{
        if(fs.existsSync(opts.data + "/collection.json")){
            collectionManager._loadCollection(function(){
                startTimers();
                parentCallback(collectionManager);
            });
        }
        else{
            if(opts.debug) console.log("No collection exists. Creating empy collection.");
            collectionManager.save(function(){
                startTimers();
                parentCallback(collectionManager);
            });
        }
    }


}
