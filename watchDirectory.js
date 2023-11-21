const chokidar = require('chokidar');
const fs = require('fs');
let exec = require('child_process').exec,
child;
let zmq = require('zeromq'),
    sock = zmq.socket('pull');

const jsonDirectory = '/JSON/';
const pathToFile =__dirname + jsonDirectory;
const endOfPrefix = pathToFile.length;




class Main {

    constructor(){
        this.errors = [];
        this.messages = [];
        this.json = [];
        this.ready = false;
    }
    
    //expects bool
    setReady(ready){
        this.ready = ready
    }

    //expects string
    writeMessage(msg){
        this.messages.push(msg);
    }

    //expects string
    writeError(err){
        this.errors.push(err);
    }

    //expects two strings
    writeJson(fileName, json){
        this.json.push({file: fileName, content: json});
    }

    listen(){
        const host = '127.0.0.1';
        const port = '5001';
        sock.connect(`tcp://${host}:${port}`);

        sock.on('message', (msg) =>{
            if(msg.toString().toLowerCase() ==='ready'){
                this.setReady(true);
            }
        })
    }
    
    watch(){
        const watcher = chokidar.watch(pathToFile, {ignored: /^\./, persistent: true});
        this.writeMessage(`Watching: ${pathToFile} <strong>TIME: ${new Date()}</strong>`);
        let self = this;
        watcher
        .on('add', function(pathToFile){
            const fileName = pathToFile.substring(endOfPrefix);
            self.writeMessage(`Detected new file: ${fileName} <strong>TIME: ${new Date()}</strong>`);
            if(fileName.endsWith('.json')){
                //read file, validate JSON, call db.py
                self.getJSON(fileName);
            }
            else{
                self.writeMessage(`Ignored ${fileName} <strong>TIME: ${new Date()}</strong>`)
            }
        })
        .on('error', (err) => {writeError(`An error occured: ${err.toString()} <strong>TIME: ${new Date()}</strong>`);});
    }
    
    //Reads a file and converts it to string, checks that the string produced is valid JSON data.
    //If the string is valid JSON, calls the DB program and deletes the file.
    //If it isn't, prints an error message to the console.
    getJSON(fileName){
        console.log(pathToFile);
        fs.readFile(pathToFile+fileName, (err,data)=>{
            if(err) this.writeError(`An error occured: ${err.toString()} <strong>TIME: ${new Date()}</strong>`); 

            const JSON = (data.toString());
            if(this.isValidJSON(JSON)){
                this.writeJson(fileName, JSON);
                this.callDBTrigger(fileName) 
            }else{
                this.writeError(`In ${fileName} <strong>TIME: ${new Date()}</strong>`);

            }
    
        })
    }
    
    //Calls db.py on .json indicated by fileName, then deletes the associated file.
    //fileName must be the relative path to a valid .json file.
    async callDBTrigger(fileName){

        while(!this.ready){
            await new Promise( resolve => setTimeout(resolve, 5000));
            this.writeMessage(`Waiting for signal to call db.py on ${fileName} <strong>TIME: ${new Date()} </strong>`);
        }

        child = exec(`python db.py ${fileName}`, (err, stdOut, stdErr) => {
            if(err) this.writeError(`An Error Occured: ${err.toString()} <strong>TIME: ${new Date()}</strong>`);
            if(stdOut) this.writeMessage(`From db.py: ${stdOut} <strong>TIME: ${new Date()}</strong>`);
            if(stdErr) this.writeError(`Error in db.py: ${stdErr} <strong>TIME: ${new Date()}</strong>`);
        });  
        
    
        fs.unlink(pathToFile+fileName, (err) =>{
            if(err) this.error = err;
            this.writeMessage(`Deleted File: ${fileName} <strong>TIME: ${new Date()}</strong>`);
        });

        this.setReady(false);
    }
    
    //validates that a string is JSON.
    isValidJSON(str){
        try{
            JSON.parse(str)
        }catch(err){
            this.writeError(`There is an error in the JSON: ${err.toString()} <strong>TIME: ${new Date()}</strong>`);
            return false;
        }
        return true;
    }
};


module.exports = Main;