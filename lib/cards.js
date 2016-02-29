var fs = require('fs');
var request = require('request');
var jsonfile = require('jsonfile');
var fuzzy = require('fuzzy');
var unzip = require('unzip');
var utils = require('./utils.js');

module.exports = function(opts, callback){

    

    var copyFile = function(source, destination){
        fs.createReadStream(source).pipe(fs.createWriteStream(destination));
    }

    //Check to see if there are updates to be installed and or if need to load the cards for the first time.
    utils.mkdirSync(opts.cache);

    newVersion(function(newVersionAvailable){
        if(newVersionAvailable){
            console.log("New version of card data available!");
            getNewVersion(function(cards){
                buildCardWrapper(cards, function(cardObj){
                    callback(cardObj);
                }); 
            });    
        }
        else{
            getCurrentVersion(function(cards){
                buildCardWrapper(cards, function(cardObj){
                    callback(cardObj);
                }); 
            });
        }
    });

}

function buildCardWrapper(cards, callback){
    var cardWrapper = {};

    cardWrapper.cards = cards;

    cardWrapper.bindListeners = function(opts, socket){
        if(opts.debug) console.log("Binding card listeners.");

        socket.on("cards:search", function(query){
            if(opts.debug) console.log("Searching for query: " + query);
            if(opts.debug) console.log("Narrowing from " + Object.keys(cardWrapper.cards).length + " possibilities.");
            var results = fuzzy.filter(query, Object.keys(cardWrapper.cards));
            if(opts.debug) console.log("Found " + results.length + " matches.");
            results = results.slice(0,10);
            var result = [];
            for(var i=0; i<results.length; i++){
                var key = results[i];
                result.push(cardWrapper.cards[key.string]);
            }
            socket.emit("cards:search::response", result);
        });
    };

    callback(cardWrapper);
};

function getNewVersion(callback){
    console.log("Retrieving card data.");
    var file = fs.createWriteStream(opts.cache + "/AllCards.json.zip");
    request({url: "http://www.mtgjson.com/json/AllCards.json.zip"})
    .pipe(file)
    .on("close",  function(){
        fs.createReadStream(opts.cache + "/AllCards.json.zip")
        .pipe(unzip.Extract({ path: opts.cache + "/AllCards.json"}))
        .on("close", function(){
            getCurrentVersion(callback);    
        });
    });
}


function getCurrentVersion(callback){
    jsonfile.readFile(opts.cache + "/AllCards.json/AllCards.json", function(err, obj){
        if(err){
            console.log(err);
        }
        else{
            callback(obj);
        }
    });

}

function newVersion(callback){
    request("http://www.mtgjson.com/json/version-full.json", function(error, response, body){
        if(!error && response.statusCode == 200){
            body = JSON.parse(body);
            var newVersion = body.version;

            if (fs.existsSync(opts.cache + "/version.json")) {
                jsonfile.readFile(opts.cache + "/version.json", function(err, obj){

                    var currentVersion = obj.version;

                    jsonfile.writeFile(opts.cache + "/version.json", body, {spaces: 2}, function(err) {
                        if(err){
                            console.log(err);
                        }
                        else {
                            callback(newVersion !== currentVersion);
                        }
                    });
                });
            }
            else{
                jsonfile.writeFile(opts.cache + "/version.json", body, {spaces: 2}, function(err) {
                    console.log(err);
                    callback(true); 
                })
            }

        }
    });
}
