var jsonfile = require('jsonfile');
var fs = require('fs');
var readline = require('readline');
var nodeUtil = require('util');
var utils = require('./utils.js');

module.exports = function(opts, cards, parentCallback){

    var collectionManager = {};

    /************************/
    /* Variable Definitions */
    /************************/

    // the actual collection
    collectionManager.collection = [];

    // a checkpoint
    collectionManager.checkpoint = [];

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
            if(resolveWithCheckpoint){
                collectionManager.collection = collectionManager.checkpoint;
                collectionManager.checkpoint = null;
                collectionManager.deferedCheckpointResolution = false;
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
            if(!collectionManager.deferedCheckpointResolution){
                socket.emit("collection:get::response", collectionManager.collection);
            }
            else{
                socket.emit("collection:resolution::alert", {
                    collection: collectionManager.collection,
                    checkpoint: collectionManager.checkpoint
                });
            }
        });

    };


    collectionManager.save = function(callback){
        var timestamp = new Date();
        if(opts.debug) console.log("Saving Collection.");
        jsonfile.writeFile(opts.data + "/collection_data.json", { 
            "version" : opts.version,
            "timestamp": timestamp
        } , function(err, obj){
            if(err){
                console.log(err);
            }
            else{
                out = collectionManager._deflate().join("\n") + "\n";
                fs.writeFile(opts.data + "/collection.mbc", out, function(err){
                    if(err){
                        console.log(err);
                    }
                    else{
                        if(opts.debug) console.log("Collection Saved.");
                        collectionManager.changesSinceLastSave = false;
                        collectionManager.changesSinceLastCheckpoint = false;

                        if(fs.existsSync(opts.data + "/collection.checkpoint.mbc")){
                            if(opts.debug) console.log("Out of date checkpoint file exists. Removing.");
                            fs.unlinkSync(opts.data + "/collection.checkpoint.mbc");
                            fs.unlinkSync(opts.data + "/collection.checkpoint.json");
                            if(opts.debug) console.log("Out of date checkpoint file removed.");
                        }

                        resetTimers();

                        if(typeof callback === 'function'){
                            callback(collectionManager);
                        }
                    }
                });
            }
        });
    };

    collectionManager.checkpoint = function(){
        collectionManager.lastCheckpointTime = new Date();
        collectionManager.lastCheckpoint = collectionManager.collection;
        if(opts.debug) console.log("Saving Checkpoint.");
        jsonfile.writeFile(opts.data + "/collection_data.checkpoint.json", {
            "version": opts.version,
            "timestamp": collectionManager.lastCheckpointTime
        }, function(err, obj){
            if(err){
                console.log(err);
            }
            else{
                out = collectionManager._deflate().join("\n") + "\n";
                fs.writeFile(opts.data + "/collection.checkpoint.mbc", out, function(err){
                    if(err){
                        console.log(err);
                    }
                    else{
                        if(opts.debug) console.log("Checkpoint Saved.");
                        collectionManager.changesSinceLastCheckpoint = false;
                    }
                });
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
        jsonfile.readFile(opts.data + "/collection_data.json", function(err, obj){
            if(opts.debug) console.log("Collection Data Loaded.");
            if(opts.debug) console.log("Collection Version: " +  obj.version);
            if(opts.debug) console.log("Collection Last Modified: " + obj.timestamp);
            var lines = [];

            var lineReader = readline.createInterface({
                input: fs.createReadStream(opts.data + "/collection.mbc"),
                terminal: false
            });

            lineReader.on('line', function(line){
                lines.push(line);
            });

            lineReader.on('close', function(){
                if(opts.debug) console.log("Collection Loaded.");
                collectionManager.collection = collectionManager._inflate(lines);
                if(typeof callback === 'function'){
                    callback(collectionManager.collection);
                }
                else{
                    return collectionManager.collection;
                }
            });
        });
    };

    collectionManager._loadCheckpoint = function(callback){
        if(opts.debug) console.log("Loading Checkpoint.");
        jsonfile.readFile(opts.data + "/collection_data.checkpoint.json", function(err, obj){
            if(opts.debug) console.log("Checkpoint Data Loaded.");
            if(opts.debug) console.log("Checkpoint Version: " + obj.version);
            if(opts.debug) console.log("Checkpoint Last Modified: " + obj.timestamp);
            var lines = []

            var lineReader = readline.createInterface({
                input: fs.createReadStream(opts.data + "/collection.checkpoint.mbc"),
                terminal: false
            });

            lineReader.on('line', function(line){
                lines.push(line);
            });
            
            lineReader.on('close', function(){
                if(opts.debug) console.log("Checkpoint Loaded.");
                collectionManager.ckeckpoint = collectionManager._inflate(lines);
                if(typeof callback === 'function'){
                    callback(collectionManager.checkpoint);
                }
                else{
                    return collectionManager.checkpoint;
                }
            });
        });
    }

    collectionManager._deflate = function(callback){
        if(opts.debug) console.log("Defalting Cards");
        var cardNames = [];
        for(var i=0; i<collectionManager.collection.length; i++){
            var card = collectionManager.collection[i];
            cardNames.push(card.name);
        }
        var cardCounts = {};
        cardNames.forEach(function(x){ cardCounts[x] = (cardCounts[x] || 0)+1; });

        var deflated = [];
        for(var i=0; i<Object.keys(cardCounts).length; i++){
            var card = Object.keys(cardCounts)[i];
            var count = cardCounts[card];
            deflated.push(nodeUtil.format("%s %s", count, card));
        }

        if(typeof callback === 'function'){
            callback(deflated);
        }
        else{
            return deflated;
        }
    };

    collectionManager._inflate = function(deflatedCards, callback){
        var inflated = [];

        for(var i=0; i<deflatedCards.length; i++){
            var str = deflatedCards[i];
            var count = str.substr(0, str.indexOf(' '));
            var card = str.substr(str.indexOf(' ')+1);
            var fullCard = cards.get(card);

            for(var j=0; j<count; j++){
                inflated.push(fullCard); 
            }
        }

        if(typeof callback === 'function'){
            callback(inflated);
        }
        else{
            return inflated;
        }

    };


    function startTimers(){
        collectionManager.checkpointTimer = setInterval(function(){
            collectionManager.checkpoint();
        }, opts.checkpoint*1000);
    }

    function resetTimers(){
        clearTimeout(collectionManager.checkpointTimer);
        startTimers();
    }

    /************************/
    /* Load Collection Data */
    /************************/
    utils.mkdirSync(opts.data);

    // if a checkpoint file exists, wait to load data until we can prompt user to select 
    //    which file they would like to prefer.
    if(fs.existsSync(opts.data + "/collection.mbc")){
        collectionManager._loadCollection(function(){
            if(fs.existsSync(opts.data + "/collection.checkpoint.mbc")) {
                if(opts.debug) console.log("Deferred Checpoint Resolution.");
                collectionManager.deferedCheckpointResolution = true; 
                collectionManager._loadCheckpoint(function(){
                    startTimers();
                    parentCallback(collectionManager);

                })
            }
            else{
                startTimers();
                parentCallback(collectionManager);
            }
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
