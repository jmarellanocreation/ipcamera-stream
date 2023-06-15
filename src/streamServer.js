const fs = require('fs');
const http = require('http');

class StreamServer {

    #port;
    #secret;
    #server;
    #webServer;
    #recordStream;
    #recordPath;

    constructor(configs, webServer) {
        this.#port = configs.rtspPort;
        this.#secret = configs.secret;
        this.#recordStream = configs.recordStream;
        this.#recordPath = configs.recordPath;
        this.#server = null;
        this.#webServer = webServer;
        this.init();
    }
    init(){
        this.#server = http.createServer( (request, response) => {
            const params = request.url.substr(1).split('/');
        
            if (params[0] !== this.#secret) {
                console.log(
                    'Failed Stream Connection: '+ request.socket.remoteAddress + ':' +
                    request.socket.remotePort + ' - wrong secret.'
                );
                response.end();
            }
        
            response.connection.setTimeout(0);
            console.log(
                'Stream Connected: ' +
                request.socket.remoteAddress + ':' +
                request.socket.remotePort
            );
            request.on('data', (data) => {
                this.#webServer.broadcast(data);
                if (request.socket.recording) {
                    request.socket.recording.write(data);
                }
            });
            request.on('end',function(){
                console.log('close');
                if (request.socket.recording) {
                    request.socket.recording.close();
                }
            });
            if (this.#recordStream) {
                const path = this.#recordPath + Date.now() + '.ts';
                request.socket.recording = fs.createWriteStream(path);
            }
        })
        this.#server.headersTimeout = 0;
        this.#server.listen(this.#port);
        console.log('Listening for incomming MPEG-TS Stream on http://127.0.0.1:'+this.#port+'/'+this.#secret);
    }
}



module.exports = StreamServer;