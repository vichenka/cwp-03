
const net = require("net");
const fs = require("fs");
const port = 8124;

const client = new net.Socket();

let QA;
let ans;
let curQA = 0;

client.setEncoding('utf8');

client.connect(port, function() {
    console.log('Connected');
    client.write("QA");
});

client.on('data', function(data) {
    if (data == "ACK") {
        fs.readFile("qa.json", (err, data) => {
            if (err) {
                console.log("Error read qa.json");
                client.destroy();
            } else {
                QA = JSON.parse(data);
                QA = shuffle(QA);
                sendQA()
            }
        });
    } else if (data === "DEC") {
        client.destroy();
    } else {
        ans = parseInt(data);
        console.log("Quastion - " + QA[curQA - 1].qa + " server ansver " + QA[curQA - 1].goodAnsBad[ans]);
        console.log("Good answer " + QA[curQA - 1].goodAnsBad[0]);
        sendQA();

    }
    //client.destroy();
});

client.on('close', function() {
    console.log('Connection closed');
});

function sendQA() {
    if (curQA < QA.length) {
        client.write(QA[curQA++].qa);
    } else {
        client.destroy();
    }
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        let rann = getRandomInt(0, i);
        console.log(rann);
        t = arr[rann];
        arr[rann] = arr[i];
        arr[i] = t;
    }
    return arr;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
