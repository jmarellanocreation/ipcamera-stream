const fs = require('fs');
const path = require('path');
const http = require('http');
const moment = require('moment');

class StreamServer {
    #port;
    #secret;
    #server;
    #webServer;
    #recordStream;
    #recordPath;
    #currentDate;
    #maxStorageGB; // Maximum storage space in GB
    #storageUsedGB; // Current storage used in GB

    constructor(configs, webServer) {
        this.#port = configs.rtspPort;
        this.#secret = configs.secret;
        this.#recordStream = configs.recordStream;
        this.#recordPath = configs.recordPath;
        this.#server = null;
        this.#webServer = webServer;
        this.#currentDate = moment().format('YYYY-MM-DD');
        this.#maxStorageGB = configs.maxStorageGB; // Maximum storage space in GB
        this.#storageUsedGB = 0; // Initialize storage used to 0
        this.init();
    }

    init() {
        this.#server = http.createServer((request, response) => {
            const params = request.url.substr(1).split('/');

            if (params[0] !== this.#secret) {
                console.log(
                    'Failed Stream Connection: ' + request.socket.remoteAddress + ':' +
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
                    this.#storageUsedGB += data.length / (1024 * 1024 * 1024); // Update storage used
                }
            });
            request.on('end', function () {
                console.log('close');
                if (request.socket.recording) {
                    request.socket.recording.close();
                }
            });

            if (this.#recordStream) {
                const date = moment().format('YYYY-MM-DD');
                if (date !== this.#currentDate || this.#storageUsedGB >= this.#maxStorageGB) {
                    // If the date changes or storage limit is reached, create a new recording file
                    this.#currentDate = date;
                    this.#storageUsedGB = 0; // Reset storage used
                    this.cleanUpOldRecordings(); // Clean up older recordings
                    const filePath = this.#recordPath + date + '.ts';
                    request.socket.recording = fs.createWriteStream(filePath);
                } else if (!request.socket.recording) {
                    const filePath = this.#recordPath + date + '.ts';
                    request.socket.recording = fs.createWriteStream(filePath);
                }
            }
        });

        this.#server.headersTimeout = 0;
        this.#server.listen(this.#port);
        console.log('Listening for incoming MPEG-TS Stream on http://127.0.0.1:' + this.#port + '/' + this.#secret);
    }

    cleanUpOldRecordings() {
        const files = fs.readdirSync(this.#recordPath);

        // Filter and sort files by modification date (oldest to newest)
        const sortedFiles = files
            .filter((file) => path.extname(file) === '.ts')
            .map((file) => ({
                name: file,
                date: fs.statSync(path.join(this.#recordPath, file)).mtime.getTime(),
            }))
            .sort((a, b) => a.date - b.date);

        const numToKeep = 5; // Change this value to the number of recordings you want to keep

        if (sortedFiles.length > numToKeep) {
            const filesToDelete = sortedFiles.slice(0, sortedFiles.length - numToKeep);

            // Delete the older recordings
            filesToDelete.forEach((file) => {
                const filePath = path.join(this.#recordPath, file.name);
                fs.unlinkSync(filePath);
                console.log('Deleted old recording:', filePath);
            });
        }
    }
}

module.exports = StreamServer;