const watchDirectory = require('./watchDirectory.js');
const express = require('express');
const app = express();
const port = 3000;


const sentinel = new watchDirectory();
sentinel.watch();
sentinel.listen();

app.get('/', (req, res) =>{
    res.write("<h3>Messages:</h3>");

    if(sentinel.messages.length){
        for(let i = 0; i < sentinel.messages.length; i++){
            msg = sentinel.messages[i];
            res.write(`<p>${msg}</p>`);
        }
    }  
    res.write("<h3>Errors:</h3>");

    if(sentinel.errors.length){
        for(let i = 0; i < sentinel.errors.length; i++){
            err= sentinel.errors[i];
            res.write(`<p>${err}</p>`);
        }
    }

    res.end();
})

app.get('/json', (req, res) => {
    res.write("<h1>JSON:</h1>");
    if(sentinel.json.length){
        for(let i = 0; i < sentinel.json.length; i++){
            file = sentinel.json[i].file;
            content = sentinel.json[i].content;
            res.write(`<div>`);
            res.write(`<h3>File Name:</h3>`)
            res.write(`<p>${file}</p>`);
            res.write(`<h3>Content</h3>`);
            res.write(`<p>${content}</p>`);
            res.write(`</div>`);
        }
    }
    res.end();
});

app.listen(port, () =>{
    console.log(`listening on port ${port}...`);
})


