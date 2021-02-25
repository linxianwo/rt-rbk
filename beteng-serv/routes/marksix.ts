import { AppBase } from '../../share/utils/app-base';
import { MarkSixBetObject } from '../../share/models/comm-serv/MarSix/MarkSixBetObject';
import {
    ResponseObject,
    SUCCESS_RESPONSE,
} from '../../share/models/response-common';
import { validateBet } from './marksix/validateBet';
import {
    validateJsonObjectFormat,
    betSlipToTicketDetail,
    validateBetSlipFormat,
    validateTicketDetailFormat,
} from './routeShare';
import { BetEngineAPI } from '../../share/protocols/kiosk-api-event';
import { ticketDetailToBetObj } from './marksix/betSlipToBetObj';
import { getMarkSixInfo } from '../util/betEngineRequest';

class MarkSixValidate extends AppBase {
    constructor() {
        super();
    }
}

const markSixValidate = new MarkSixValidate();

// <!-- middleware and function called by middleware

/**
 * description: check the object's(from req paramter) format is same as objType's format or not
 *
 * @param {*} req  http Request
 * @param {*} res  http Response
 * @param {*} standardInstance a standard instance can represent the accepted object format
 * @returns {boolean}
 */

const validateBetFormat = (req, res, next) => {
    const m6BetObject = new MarkSixBetObject();
    if (validateJsonObjectFormat(req, res, m6BetObject)) {
        req.markSixBetObject = req.params.object;
        next();
    }
};

const sendResponseObject = (req, res) => {
    const resObj: ResponseObject = Object.assign({}, SUCCESS_RESPONSE);
    res.status(200).send(resObj);
};

const sendResponseObjectWithBetObj = (req, res) => {
    const resObj: ResponseObject = Object.assign({}, SUCCESS_RESPONSE, {
        body: req.markSixBetObject,
    });
    res.status(200).send(resObj);
};

//  middleware and function called by middleware --!>

// <!-- get method request for validateRaceBetObj
// markSixValidate.getApp().get('/', (req, res) => {
//     res.setHeader('Content-type', 'text/html');
//     res.send('<h1>Welcome MarkSix Betting Engine Server</h1>');
// });

// markSixValidate
//     .getApp()
//     .get('/validateMarkSixBetObj/:object', validateBetFormat, validateBet);

// markSixValidate.use(sendResponseObject);

markSixValidate.getApp().get('/', (req, res) => {
    res.setHeader('Content-type', 'text/html');
    res.send('<h1>Welcome MarkSix Betting Engine Server</h1>');
});

markSixValidate
    .getApp()
    .get(
        `${BetEngineAPI.MARKSIX_APP_VALIDATE_BET_ENTRY}${BetEngineAPI.PARAMETER_ENTRY}`,
        validateBetFormat,
        validateBet,
        sendResponseObject
    );

markSixValidate
    .getApp()
    .get(
        `${BetEngineAPI.MARKSIX_APP_TRANSLATE_BETSLIP_TO_BETOBJ}${BetEngineAPI.PARAMETER_ENTRY}`,
        validateBetSlipFormat,
        getMarkSixInfo,
        betSlipToTicketDetail,
        validateTicketDetailFormat,
        ticketDetailToBetObj,
        validateBet,
        sendResponseObjectWithBetObj
    );

markSixValidate
    .getApp()
    .post(
        `${BetEngineAPI.MARKSIX_APP_VALIDATE_BET_ENTRY}`,
        validateBetFormat,
        validateBet,
        sendResponseObject
    );

markSixValidate
    .getApp()
    .post(
        `${BetEngineAPI.MARKSIX_APP_TRANSLATE_BETSLIP_TO_BETOBJ}`,
        validateBetSlipFormat,
        getMarkSixInfo,
        betSlipToTicketDetail,
        validateTicketDetailFormat,
        ticketDetailToBetObj,
        validateBet,
        sendResponseObjectWithBetObj
    );

export const markSixApp = markSixValidate.getApp();
