'use strict';

var mbServices = angular.module('magicBuddy.services', []);

mbServices.factory("collectionManager", ["socket", function(socket){
    var collectionManager = {};
    collectionManager.collection = [];
    collectionManager.pretty = [];

    collectionManager.add = function(card){
        socket.emit("collection:add", card);
        collectionManager.get();
    };

    collectionManager.remove = function(card){
        socket.emit("collection:remove", card);
        collectionManager.get();
    };

    collectionManager.get = function(){
        socket.emit("collection:get");
    };

    collectionManager.save = function(){
        socket.emit("collection:save");
    };

    collectionManager.bulkImport = function(cards){
        socket.emit("collection:import", cards);
        collectionManager.get();
    };


    //register listeners
    socket.on("collection:get::response", function(resp){
        collectionManager.collection = resp;


        //build pretty collection
        var cardCounts = {};
        collectionManager.collection.forEach(function(x){ cardCounts[x.name] = (cardCounts[x.name] || 0)+1; });
        var seen = {};
        var unique = collectionManager.collection.filter(function(item){
            return seen.hasOwnProperty(item.name) ? false : (seen[item.name] = true);
        });

        for(var idx in unique){
            unique[idx].count = cardCounts[unique[idx].name];                 
        }
        collectionManager.pretty = unique;

    });


    socket.on("collection:resolution::alert", function(){
        var conf = confirm("There was a recent checkpoint click \"OK\" to recover data?");
        socket.emit("collection:checkpoint:resolve", conf);
        socket.emit("collection:get");
    });

    socket.on("collection:save::response", function(resp){
        alert("Collection Saved!");
    });

    
    return collectionManager;
}]);

mbServices.factory("cardManager", ["socket", function(socket){
    var cardManager = {};
    cardManager.searchResults = [];



    socket.on("cards:search::response", function(resp){
        cardManager.searchResults = resp;
    });

    cardManager.search= function(query){
        socket.emit("cards:search", query);
    }

    
    return cardManager;
}]);

mbServices.factory("deckManager", ["socket", "$q", function(socket, $q){
    var deckManager = {};
    deckManager.deck = [];
    deckManager.names = [];
    deckManager.name = "";
    deckManager.previous= "";
    deckManager.notes = "";
    deckManager.symbolRe = /[^{}]+(?=\})/g;

    deckManager.pretty = [];

    deckManager.promise = null;

    /* API */

    deckManager.deselectDeck = function(){
        deckManager.previous = deckManager.name;
        deckManager.name = "";
    }

    deckManager.isPreviousDeck = function(name){
        return deckManager.previous === name;
    }

    deckManager.selectDeck = function(name){
        deckManager.name = name;
    }


    function dispatchOrChain(callable, args){
        if(deckManager.promise !== null){
            deckManager.promise
                .promise.then(function(){
                    callable.apply(this, args);
                })
                .finally(function(){
                    deckManager.promise = null;   
                });
        }
        else{
            return callable.apply(this, args);
        }
        return deckManager.promise;
         
    }

    /* Add */
    deckManager.add = function(card){
        return dispatchOrChain(addCard, [card]);
    };

    function addCard(card){
        deckManager.promise = $q.defer();
        socket.emit("deck:add", {
            name: deckManager.name,
            card: card
        });
        return deckManager.promise;
    }

    socket.on("deck:add::response", function(){
        deckManager.promise.resolve();
        deckManager.promise = null;
    });


    /* Remove */
    deckManager.remove = function(card){
        return dispatchOrChain(removeCard, [card]);
    };

    function removeCard(card){
        deckManager.promise = $q.defer();
        socket.emit("deck:remove", {
            card: card,
            name: deckManager.name
        });
        return deckManager.promise
    }


    socket.on("deck:remove::response", function(){
        deckManager.promise.resolve();
        deckManager.promise = null;
    });

    /* Get */

    deckManager.get = function(name){
        if(name === undefined || name === null){
            return dispatchOrChain(getAll, {});
        }
        else{
            return dispatchOrChain(getOne, [name]);
        }
    };

    function getAll(){
        deckManager.promise = $q.defer();
        socket.emit("deck:get:all");
        return deckManager.promise;
    };

    function getOne(name){
        deckManager.promise = $q.defer();
        socket.emit("deck:get:one", name);
        return deckManager.promise;
    }


    socket.on("deck:get:one::response", function(resp){

        deckManager.deck = resp;

        //build pretty collection
        var cardCounts = {};
        deckManager.deck.forEach(function(x){ cardCounts[x.name] = (cardCounts[x.name] || 0)+1; });
        var seen = {};
        var unique = deckManager.deck.filter(function(item){
            return seen.hasOwnProperty(item.name) ? false : (seen[item.name] = true);
        });

        for(var idx in unique){
            var card = unique[idx];
            unique[idx].count = cardCounts[card.name];                 


			if(card.hasOwnProperty("manaCost")){

                var symbols = [];
                card.manaCost.match(deckManager.symbolRe).forEach(function(el){
                    symbols.push(el.toLowerCase());
                });
                unique[idx].manaSymbols = symbols;
            }
        }
        deckManager.pretty = unique;
        deckManager.promise.resolve(deckManager.pretty);
        deckManager.promise = null;
    });

    socket.on("deck:get:all::response", function(resp){
        deckManager.names = resp
        deckManager.promise.resolve(deckManager.names);
        deckManager.promise = null;
    });
    
    /* Create */
    deckManager.create = function(name){
        if(name == undefined || name == null || name == ""){
            throw Error("Deck name cannot be empty");
        }
        else{
            return dispatchOrChain(createDeck, [name]);
        }
    };

    function createDeck(name){
        deckManager.promise = $q.defer();
        socket.emit("deck:create", name);
        return deckManager.promise;
    }

    socket.on("deck:create::response", function(){
        deckManager.promise.resolve();
        deckManager.promise = null;
    });


    /* Save */

    deckManager.save = function(){
        deckManager.promise = $q.defer();
        dispatchOrChain(saveDeck, []);
        return deckManager.promise;
    };

    function saveDeck(){
        deckManager.promise = $q.defer();
        socket.emit("deck:save", deckManager.name);
        return deckManager.promise;
    }

    socket.on("deck:save::respose", function(){
        deckManager.promise.resolve();
        deckManager.promise = null;
    });

    /* Delete */

    deckManager.delete = function(){
        return dispatchOrChain(deleteDeck, []);
    };
    
    function deleteDeck(){
        deckManager.promise = $q.defer();
        socket.emit("deck:delete", deckManager.name);
        return deckManager.promise;
    }

    socket.on("deck:delete::response", function(){
        deckManager.promise.resolve();
        deckManager.promise = null;
    });


    /* Bulk Import */
    
    deckManager.bulkImport = function(cards){
        return dispatchOrChain(bulkImport, [cards]);
    };

    function bulkImport(cards){
        deckManager.promise = $q.defer();
        socket.emit("deck:import", { 
            "name": deckManager.name, 
            "cards": cards
        });
        return deckManager.promise;
    }

    socket.on("deck:import::response", function(){
        deckManager.promise.resolve();
        deckManager.promise = null;
    });


    /* Save notes */
    deckManager.saveNotes = function(){
        dispatchOrChain(saveNotes, []);
    };

    function saveNotes(){
        deckManager.promise = $q.defer();
        socket.emit("deck:notes:save", {
            "name": deckManager.name,
            "notes": deckManager.notes 
        });
        return deckManager.promise;
    }

    socket.on("deck:notes:save::response", function(){
        deckManager.promise.resolve();
        deckManager.promise = null;
    });

    /* Get Notes */

    deckManager.getNotes = function(){
        dispatchOrChain(getNotes, []);
        return deckManager.promise;
    };

    function getNotes(){
        deckManager.promise = $q.defer();
        socket.emit("deck:notes:get", deckManager.name);
        return deckManager.promise;
    }

    socket.on("deck:notes:get::response", function(resp){
        deckManager.notes = resp 
        deckManager.promise.resolve(resp);
        deckManager.promise = null;
    });

    return deckManager;

}]);

mbServices.factory("gitManager", ["socket", function(socket){
    var gitManager = {};
    
    /* Commit */
    gitManager.commit = function(message){
        socket.emit("git:commit", message);
    };

    socket.on("git:commit::response", function(){
        alert("Changes Committed.");
    });

    /* Clone */
    gitManager.clone = function(repo){
        socket.emit("git:clone", repo);
    };

    socket.on("git:clone::response", function(){
        alert("Finished Cloning Repository.");
    });


    /* Pull */
    gitManager.pull = function(){
        socket.emit("git:pull");
    };

    socket.on("git:pull::response", function(){
        alert("Finished Pulling Repository.");
    });

    /* Push */
    gitManager.push = function(){
        socket.emit("git:push");
    };

    socket.on("git:push::response", function(){
        alert("Finished Pushing Repository.");
    });

    /* Status */
    gitManager.status = function(){
        socket.emit("git:status");
    }

    return gitManager;
}]);
