import { createServer, Server } from 'http';
// import * as express from 'express';
// import * as socketIo from 'socket.io';
import socketIo = require('socket.io');
import { ServerPorts } from '../../share/main-proc/processes/ports';
import {
    MODULE_TYPE,
    CommonModule,
} from '../../share/main-proc/processes/module-type';
import { AppBase } from '../utils/app-base';
import * as bodyParser from 'body-parser';

export class KioskServer extends AppBase {
    public static PORT = 8080;
    private server: Server;
    private io: SocketIO.Server;
    private port: string | number;
    private processType = MODULE_TYPE.MODULE_NONE;
    public m_fuc: Function = null;
    // private timeout = 2 * 60 * 60 * 1000;
    // private timeout = 3 * 60  * 1000;

    // disable http response timeout
    private timeout = 0;

    constructor() {
        super();
        this.config();
        this.createServer();
        this.sockets();
        this.corsAccess();
        this.defaultListen();
        this.useMiddlewares();
    }

    private createServer(): void {
        this.server = createServer(this.app);
        this.server.setTimeout(this.timeout);
    }

    private config(): void {
        this.getProcessType();
        this.setServerPort();
        this.port = KioskServer.PORT;
    }

    private sockets(): void {
        this.io = socketIo(this.server);
    }

    private defaultListen() {
        let useDefaultListen = true;
        for (const arg of process.argv) {
            if (arg.indexOf('_mocha') !== -1) {
                useDefaultListen = false;
                break;
            }
        }
        if (useDefaultListen) {
            this.listen().then((val) => {
                console.log('Service started');
            });
        }
    }

    public listen(port: number = -1): Promise<any> {
        return new Promise((resolve, reject) => {
            if (port > 0) {
                this.port = port;
            }
            const ret = this.server.listen(this.port, () => {
                console.log('Running server on port %s', this.port);
            });

            this.io.on('connect', (socket: any) => {
                console.log('Connected client on port %s.', this.port);
                socket.on('message', (m: string) => {
                    console.log('[server](message): %s', m);
                    this.io.emit('message', m);
                });

                socket.on('disconnect', () => {
                    console.log('Client disconnected');
                });
                socket.on('retryReply_Event', (m: string) => {
                    if (this.m_fuc !== null) {
                        this.m_fuc(m);
                    }
                });

            });
            resolve(ret);
        });
    }

    private getProcessType() {
        this.processType = CommonModule.getProcessType();
    }

    private setServerPort() {
        switch (this.processType) {
            case MODULE_TYPE.MODULE_HW:
                KioskServer.PORT = ServerPorts.hardwareServer;
                break;
            case MODULE_TYPE.MODULE_INFO:
                KioskServer.PORT = ServerPorts.infoServer;
                break;
            case MODULE_TYPE.MODULE_COMMSERV:
                KioskServer.PORT = ServerPorts.commServer;
                break;
            case MODULE_TYPE.MODULE_BETENG:
                KioskServer.PORT = ServerPorts.betengServer;
                break;
            case MODULE_TYPE.MODULE_UBC:
                KioskServer.PORT = ServerPorts.ubcServer;
                break;
            case MODULE_TYPE.MODULE_BROADCAST:
                KioskServer.PORT = ServerPorts.BroadcastServer;
                break;
            // case MODULE_TYPE.MODULE_MAIN:
            //     KioskServer.PORT = ServerPorts.mainProcServer;
            //     break;
            default:
                break;
        }
    }

    private corsAccess() {
        this.app.all('*', (req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'X-Requested-With');
            res.header(
                'Access-Control-Allow-Methods',
                'PUT,POST,GET,DELETE,OPTIONS'
            );
            res.header('X-Powered-By', ' 3.2.1');
            res.header('Content-Type', 'application/json;charset=utf-8');
            next();
        });
    }

    private useMiddlewares() {
        if (this.processType !== MODULE_TYPE.MODULE_UBC) {
            this.app.use(bodyParser.json({ type: '*/*' }));
        }
    }

    public emitEvent(eventName: string, ...args: any[]) {
        this.io.emit(eventName, ...args);
    }

    public onEvent(eventName: string, callBack: any) {
        this.io.on(eventName, callBack);
    }

}
