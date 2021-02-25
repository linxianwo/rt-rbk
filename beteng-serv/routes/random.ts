import { AppBase } from '../../share/utils/app-base';
import {
    ResponseObject,
    ResponseObjectCode,
} from '../../share/models/response-common';
// import * as bindings from 'bindings';
import { validateJsonObjectFormat } from './routeShare';

class RandomReq {
    public max: number; // Max random.
    public min: number; // Min random.
    public bankerNum: number; // banker number assigned.
    public selNum: number; // required selections number assigned.
    public excludeList: Array<number>; // excluded number list from min to max .
    public id: string; // the identifier.
}

class RandomRes {
    public bankers: Array<string>;
    public selections: Array<string>;
    public id: string;
}

class RandomGen extends AppBase {
    private _random: any;
    constructor() {
        super();
    }

    public randomAddon(): any {
        if (!this._random) {
            this._random = require('../../beteng-serv/random-addon/randomAddon.node');
        }
        return this._random;
    }
}

const random = new RandomGen();
// <!-- middleware and function called by middleware

const randomGenerator = (req, res, next) => {
    const standArray = new Array<RandomReq>();
    const obj = new RandomReq();
    obj.max = 12;
    obj.min = 1;
    obj.bankerNum = 0;
    obj.selNum = 6;
    obj.excludeList = [1];
    obj.id = '';
    standArray.push(obj);
    if (validateJsonObjectFormat(req, res, standArray)) {
        const reqList: Array<RandomReq> = req.params.object;
        const resList: Array<RandomRes> = new Array<RandomRes>();
        let current = Date.now() * 1000000;
        let selection = '';
        let banker = '';

        reqList.forEach((element) => {
            let bankers = [];
            const resElement: RandomRes = new RandomRes();
            // generate random for bankers.
            current += 1000000;
            if (element.bankerNum > 0) {
                banker = random
                    .randomAddon()
                    .cti_generateRandom(
                        element.bankerNum,
                        element.min,
                        element.max,
                        element.excludeList,
                        element.excludeList.length,
                        false,
                        current
                    );
                resElement.bankers = banker.split('+');
                bankers = resElement.bankers.map(Number);
                element.excludeList.push.apply(element.excludeList, bankers);
            }
            // generate random for selections.
            current += 1000000;
            selection = random
                .randomAddon()
                .cti_generateRandom(
                    element.selNum,
                    element.min,
                    element.max,
                    element.excludeList,
                    element.excludeList.length,
                    false,
                    current
                );
            resElement.selections = selection.split('+');

            resElement.id = element.id;
            resList.push(resElement);
        });

        req.resList = JSON.stringify(resList);

        next();
    }
};

const sendResponseObject = (req, res) => {
    const resObj: ResponseObject = {
        code: ResponseObjectCode.SUCCESS_CODE,
        body: req.resList,
        message: 'success',
    };
    res.status(200).send(resObj);
};
//  middleware and function called by middleware --!>

// <!-- get method request for validateRaceBetObj
random.getApp().get('/', (req, res) => {
    res.setHeader('Content-type', 'text/html');
    res.send('<h1>Welcome, Betting Random Generator Service</h1>');
});

random.getApp().get('/randomGen/:object', randomGenerator);

random.use(sendResponseObject);

export const randomApp = random.getApp();
