var fs = require('fs');
var request = require('request');
var jsonfile = require('jsonfile');
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
    callback(cards);
};

function getNewVersion(callback){
    console.log("Retrieving card data.");
    request("http://www.mtgjson.com/json/AllCards.json", function(error, response, body){
        if(!error && response.statusCode == 200){
            var cards = JSON.parse(body);
            jsonfile.writeFile(opts.cache + "/AllCards.json", body, {spaces: 2}, function(err) {
                if(err){
                    console.log(err);
                }
                else {
                    console.log("Finished retrieving card data.");
                    callback(cards);
                }
            });

        }
    });
}

function getCurrentVersion(callback){
    jsonfile.readFile(opts.cache + "/AllCards.json", function(err, obj){
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
