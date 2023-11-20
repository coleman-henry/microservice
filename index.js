const chokidar = require('chokidar');
const jsonDirectory = '/JSON/';
const pathToFile =__dirname + jsonDirectory;
const endOfPrefix = pathToFile.length;
const fs = require('fs');

let exec = require('child_process').exec,
child;

main();

function main(){

    const watcher = chokidar.watch(pathToFile, {ignored: /^\./, persistent: true});
    
    watcher
    .on('add', function(pathToFile){
        
        const fileName = pathToFile.substring(endOfPrefix);
        
        if(fileName.endsWith('.json')){
            //read file, validate JSON, call db.py
            getJSON(fileName);
        }
    })
    .on('error', (err) => {console.error('Error happened', err);});
}


//Reads a file and converts it to string, checks that the string produced is valid JSON data.
//If the string is valid JSON, calls the DB program and deletes the file.
//If it isn't, prints an error message to the console.
function getJSON(fileName){
    console.log(pathToFile);

    fs.readFile(pathToFile+fileName, (error,data)=>{
        if(error) throw error; 
        const JSON = (data.toString());
        
        isValidJSON(JSON) ? callDBTrigger(fileName) : console.error("Received Invalid JSON: "+ fileName);

    })
}

//Calls db.py on .json indicated by fileName, then deletes the associated file.
//fileName must be the relative path to a valid .json file.
async function callDBTrigger(fileName){
    child = exec(`python db.py ${fileName}`, (err) => {
        if(err) throw err;
    });  

    console.log("Deleting " +fileName+ " in 30 seconds...");
    await new Promise( resolve => setTimeout(resolve, 30000));

    fs.unlink(pathToFile+fileName, (err) =>{
        if(err) throw err;
    });
}

//validates that a string is JSON.
function isValidJSON(str){
    try{
        JSON.parse(str)
    }catch(err){
        console.error("There is an error in the JSON: ", err);
        return false;
    }
    return true;
}