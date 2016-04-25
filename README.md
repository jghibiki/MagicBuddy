## MagicBuddy
A deck and collection manager for Magic the Gathering

# Dependencies

MagicBuddy requires NodeJS and npm (Node Package Manager) in order to run and install dependencies.

#Installation

1. Clone this repository: ```git clone https://github.com/jghibiki/MagicBuddy```
2. Run ```npm install``` from the root of the repository to install dependencies.

# Usage

Basic Usage:

Run ```./MagicBuddy``` and navigate to localhost:8000

Advanced Usage - Flags:

```--headed```: Launches the system default browser and opens the MagicBuddy app.
```--debug```: Launches application in debug mode. Debug info will be printed to the system console.
```--host <hostname or ip>```: Allows configuration of the host by default we will broad cast the application only on ```localhost``` or ```127.0.0.1```. Set this to ```0.0.0.0``` to allow access from outside of your local environment.
```--port <port>```: Allows configuration of the port the application will be hosted on.
```--data <path>```: The location where decks and your collection will be stored. Defaults to ```./data```
```--cache <path>```: The location of the persistant cache. Card json information is stored here persistantly. Defaults to ```./cache```
```--checkpoint```: Determines how often in seconds we will make a checkpoint. Default is ```60```

Note: Version 0.3 adds basic git support, in order to suppport pushing/pulling from a repository with ssh, you must use an ssh-agent and add use ```ssh-add``` to add your private key. Without this, you may not be able to authenticate and pulling/pushing will fail.


The JSON files used for card data come from [http://mtgjson.com/](http://mtgjson.com/).
The JSON files contains data that is Copyright © Wizards of the Coast - All Rights Reserved
This website/project is not affiliated with Wizards of the Coast in any way.

