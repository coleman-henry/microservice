# microservice

## How to use the Microservice:
  * The Microservice watches a directory for new .json files.
  
  * When a new .json file appears in the directory, the Microservice checks that it consists of correctly formatted JSON.
  
    * If the JSON is correctly formatted, the microservice calls a separate program (db.py) on the .json file.

    * If the JSON is incorrectly formatted, the microservice sends an error to the console with the name of the .json file.
  * Any data logged by db.py will be routed to the console.
  * After calling db.py, the microservice waits 30 seconds before deleting the .json. (Only .json that results in a successful call to db.py is deleted).
  

## Request Data: 
  * The Microservice listens to a tcp socket (by default, localhost:9000). 
  * Connecting to this address, either programmatically or through a browser, will give access to all response data.
    * Response data consists of history of .json files detected during the microservice's runtime, successful calls to db.py, deletions of .json, data logged by db.py, and errors.

## UML:
