const WebSocket = require('ws');

class WebServer {

    #port;
    #server;
    #connectionCount;

    constructor(configs) {
        this.#port = configs.wsPort;
        this.#server = null;
        this.#connectionCount = 0;
        this.init();
    }
    init(){
        this.#server = new WebSocket.Server({port: this.#port, perMessageDeflate: false});
        this.#server.connectionCount = 0;
        this.#server.on('connection', (socket, upgradeReq) => {
            this.#connectionCount++;
            console.log(
                'New WebSocket Connection: ',
                (upgradeReq || socket.upgradeReq).socket.remoteAddress,
                (upgradeReq || socket.upgradeReq).headers['user-agent'],
                '('+this.#connectionCount+' total)'
            );
            socket.on('close', (code, message) => {
                this.#connectionCount--;
                console.log(
                    'Disconnected WebSocket ('+this.#connectionCount+' total)'
                );
            });
        });
        console.log('Awaiting WebSocket connections on ws://127.0.0.1:'+this.#port+'/');
    }
    broadcast(data){
        this.#server.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    }
}

module.exports = WebServer;