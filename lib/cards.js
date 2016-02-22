var fs = require('fs');
var request = require('request');
var jsonfile = require('jsonfile');

module.exports = function(opts, callback){

    
    var mkdirSync = function (path) {
      try {
        fs.mkdirSync(path);
      } catch(e) {
        if ( e.code != 'EEXIST' ) throw e;
      }
    }

    var copyFile = function(source, destination){
        fs.createReadStream(source).pipe(fs.createWriteStream(destination));
    }

    //Check to see if there are updates to be installed and or if need to load the cards for the first time.
    mkdirSync("./cache");

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
            jsonfile.writeFile("./cache/AllCards.json", body, {spaces: 2}, function(err) {
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
    jsonfile.readFile("./cache/AllCards.json", function(err, obj){
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

            if (fs.existsSync("./cache/version.json")) {
                jsonfile.readFile("./cache/version.json", function(err, obj){

                    var currentVersion = obj.version;

                    jsonfile.writeFile("./cache/version.json", body, {spaces: 2}, function(err) {
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
                jsonfile.writeFile("./cache/version.json", body, {spaces: 2}, function(err) {
                    console.log(err);
                    callback(true); 
                })
            }

        }
    });
}
