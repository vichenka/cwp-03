
const net = require("net");
const fs = require("fs");
const path = require("path");
const port = 8124;
let seed = 0;

const reqFiles = 'FILES';
const reqQA = 'QA';
const resGood = 'ACK';
const resBad = 'DEC';
const resFiles = 'NEXT';
const defaultDir = process.env.DEF_DIR;
const maxConn = parseInt(process.env.MAX_CONN);

let files = [];
let clients = [];
let flag = 0;
let connections = 0;

let QA;
let ans;
const server = net.createServer((client) => {
    client.setEncoding("utf8");
    client.id = seed++;
    console.log("Client connected, ID = " + client.id);
    if (++connections === maxConn) {
        client.write(resBad)
        client.destroy();
    }
    let log = client.id + ".txt";
    client.on("data", (data) => {
        if (data === reqQA || data === reqFiles) {
            clients[client.id] = data;
            fs.readFile("qa.json", (err, data) => {
                if (err) {
                    console.log("Error read qa.json");
                    client.destroy();
                } else {
                    QA = JSON.parse(data);
                    fs.appendFile(log, "Connected new client: ID - " + client.id + "\n", (err) => {
                        if (err) {
                            console.log("Error append in file");
                        }
                    });
                }
            });
            if (data === reqFiles) {
                files[client.id] = [];
                fs.mkdir(defaultDir + path.sep + client.id, (err) => {
                    console.log(err);
                });
                fs.appendFile(log, "Making dir for client files\nStarting accept files\n", (err) => {
                    if (err) {
                        console.log("Error append in file");
                    }
                });
            }
            client.write(resGood);
        } else if (client.id === undefined) {
            client.write(resBad);
            client.destroy();
        }

        if (clients[client.id] === reqQA && data !== reqQA) {
            //client.write("DEC");
            console.log(client.id + " data: " + data);
            ans = getRandomAnswer();
            client.write(ans);
            fs.appendFile(log, "New QA - " + data + "\nServer answer - " + ans + "\n", (err) => {
                if (err) {
                    console.log("Error append in file");
                }
            });
            //console.log("Server answer " + ans);
        }
        if (clients[client.id] === reqFiles && data !== reqFiles) {
            files[client.id].push(data);
            flag++;
            if (flag === 2) {
                let buf = Buffer.from(files[client.id][0], 'hex');
                let filePath = defaultDir + path.sep + client.id + path.sep + files[client.id][1];
                fs.appendFile(log, "Creating file " + filePath + "\n", (err) => {
                    if (err) {
                        console.log("Error append in file");
                    }
                });
                //console.log(filePath);
                fil = fs.createWriteStream(filePath);
                fil.write(buf);
                fs.appendFile(log, "Writing into file " + filePath + "\n", (err) => {
                    if (err) {
                        console.log("Error append in file");
                    }
                });
                flag = 0;
                files[client.id] = [];
                fil.close();
                client.write(resFiles);
            }
            //client.write("Hello from server");
        }


    });
    client.on("end", () => {
        connections--;
        console.log("Client disconected, ID = " + client.id);
        fs.appendFile(log, "client disconected\n", (err) => {
            if (err) {
                console.log("Error append in file");
            }
        });
    });
});

server.listen(port, () => {
    console.log("listenning");
});


function getRandomAnswer() {
    return Math.random() > 0.5 ? '1' : '0';
}
