
const net = require('net');
const fs = require('fs');
const path = require("path");
const port = 8124;
const dirs = process.argv;
const client = new net.Socket();

const req = 'FILES';
const goodResp = 'ACK';
const badResp = 'DEC';
const resFiles = 'NEXT'

let arrOfFiles = [];
client.setEncoding('utf8');
getDirs();

client.connect(port, () => {

    client.write(req);
});

function getDirs() {
    process.argv.slice(2).forEach((dir) => {
        readFiles(dir);
    });
}

function readFiles(dir) {
    fs.readdir(dir, (err, files) => {
        files.forEach((file) => {
            file = dir + path.sep + file;
            fs.lstat(file, (err, stats) => {
                if (stats.isFile())
                    arrOfFiles.push(file);
                else
                    readFiles(file);
            })
        });
    })
}

client.on('data', (data) => {
    console.log(data);
    console.log(arrOfFiles);
    if (arrOfFiles.length === 0)
        client.destroy();
    else if (data === badResp) {
        client.destroy();
    } else if (data === goodResp || data === resFiles) {
        sendFile()
    }

    function sendFile() {
        let filePath = arrOfFiles.pop();
        fs.readFile(filePath, (err, data) => {
            let buf = data.toString('hex');

            client.write(buf);
            client.write(path.basename(filePath));
        })
    }
});

client.on('close', function() {
    console.log('Connection closed');
});
