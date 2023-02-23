import dotenv from 'dotenv';
dotenv.config();
import http from 'http';
import express, { Express, NextFunction, Request, Response } from 'express';
const cors = require('cors');
import { ServerSocket } from './socket';
import path from 'path';

const app: Express = express();
const port = process.env.PORT || 3000;

/** Server Handling */
const httpServer = http.createServer(app);

/** Log the request */
// app.use((req, res, next) => {
//     console.info(`METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`);

//     res.on('finish', () => {
//         console.info(`METHOD: [${req.method}] - URL: [${req.url}] - STATUS: [${res.statusCode}] - IP: [${req.socket.remoteAddress}]`);
//     });

//     next();
// });

/** Parse the body of the request */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/public',express.static(path.join(__dirname, "public")));
// app.use(cors);
// app.options('*', cors());

/** Start Socket */
new ServerSocket(httpServer);

/** Rules of our API */
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if (req.method == 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }

    next();
});

app.get("/", (req: Request, res: Response, next: NextFunction) => {
    return res.sendFile(__dirname + "/public/index.html");
});

/** Health check */
app.get('/ping', (req, res, next) => {
    return res.status(200).json({ hello: 'world!' });
});

/** Socket Information */
app.get('/status', (req, res, next) => {
    return res.status(200).json({ users: ServerSocket.instance.users });
});

/** Error handling */
app.use((req, res, next) => {
    const error = new Error('Not found');

    res.status(404).json({
        message: error.message
    });
});

/** Listen */
httpServer.listen(port, () => {
    console.log(`=================================`);
    console.log(`🚀 App listening on the port ${port}`);
    console.log(`=================================`);
});