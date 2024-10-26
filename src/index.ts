import { httpServer } from "./http_server/index";
import { WebSocketServer } from 'ws';
import { handleMessage } from "./ws_server/handler/handler";
import { WsMessage } from "./models/models";

const HTTP_PORT = 8181;

const WS_PORT = 3000;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

const wsServer = new WebSocketServer({ port: WS_PORT });
console.log(`Start WS server on the ${WS_PORT} port!`);

wsServer.on('connection', (ws) => {
    console.log('New client connected');
    
    ws.on('message', (message) => {
        const msg: WsMessage = JSON.parse(message.toString());
        console.log(msg);
        handleMessage(ws, msg);
    });
    
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});
