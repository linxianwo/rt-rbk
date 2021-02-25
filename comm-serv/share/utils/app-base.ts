// import * as express from 'express';
import express = require('express');
export class AppBase {
    protected app: express.Application;

    constructor() {
        this.createApp();
    }

    protected createApp(): void {
        this.app = express();
    }

    public getApp(): express.Application {
        return this.app;
    }

    public appUse(path: string, reqHandler: any) {
        this.app.use(path, reqHandler);
    }

    public use(middleware: any) {
        this.app.use(middleware);
    }

    public addAppApi(path: string, callback: express.RequestHandler) {
        this.app.get(path, callback);
    }

    public addPostApi(path: string, callback: express.RequestHandler) {
        this.app.post(path, callback);
    }
}
