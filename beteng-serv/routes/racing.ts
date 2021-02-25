import { AppBase } from '../../share/utils/app-base';
import { RacingBetObject } from '../../share/models/comm-serv/Racing/RacingBetObject';
import { Leg } from '../../share/models/comm-serv/Racing/Leg';
import {
    ResponseObject,
    SUCCESS_RESPONSE,
} from '../../share/models/response-common';
import { validateBetEntry } from './racing/validateBetEntry';
import { validateBet, validateBetTrack } from './racing/validateBet';
import {
    getRacingInfo,
    validateTrackFromInfoServer,
} from '../util/betEngineRequest';
import {
    validateJsonObjectFormat,
    validateBetSlipFormat,
    sendResponseObject,
    betSlipToTicketDetail,
    validateTicketDetailFormat,
} from './routeShare';
import { BetEngineAPI } from '../../share/protocols/kiosk-api-event';
import { ticketDetailToBetObj } from './racing/betSlipToBetObj';
class RacingValidate extends AppBase {
    constructor() {
        super();
    }
}

const racingValidate = new RacingValidate();

// <!-- middleware and function called by middleware

const validateBetFormat = (req, res, next) => {
    const racingBetObject = new RacingBetObject();
    racingBetObject.Legs = [new Leg()];
    if (validateJsonObjectFormat(req, res, racingBetObject)) {
        req.racingBetObject = req.params.object;
        next();
    }
};

const sendResponseObjectWithBetObj = (req, res) => {
    const resObj: ResponseObject = Object.assign({}, SUCCESS_RESPONSE, {
        body: req.racingBetObject,
    });
    res.status(200).send(resObj);
};
//  middleware and function called by middleware --!>

// <!-- get method request for validateRaceBetObj
racingValidate.getApp().get('/', (req, res) => {
    res.setHeader('Content-type', 'text/html');
    res.send('<h1>Welcome Racing Betting Engine Server</h1>');
});

racingValidate
    .getApp()
    .get(
        `${BetEngineAPI.RACING_APP_VALIDATE_BET_FORMAT_ENTRY}${BetEngineAPI.PARAMETER_ENTRY}`,
        validateBetFormat,
        sendResponseObject
    );

racingValidate
    .getApp()
    .get(
        `${BetEngineAPI.RACING_APP_VALIDATE_BET_ENTRY}${BetEngineAPI.PARAMETER_ENTRY}`,
        validateBetFormat,
        getRacingInfo,
        validateTrackFromInfoServer,
        validateBetTrack,
        validateBetEntry,
        validateBet,
        sendResponseObjectWithBetObj
    );

racingValidate
    .getApp()
    .get(
        `${BetEngineAPI.RACING_APP_TRANSLATE_BETSLIP_TO_BETOBJ}${BetEngineAPI.PARAMETER_ENTRY}`,
        validateBetSlipFormat,
        getRacingInfo,
        validateTrackFromInfoServer,
        betSlipToTicketDetail,
        validateTicketDetailFormat,
        ticketDetailToBetObj,
        validateBetEntry,
        validateBet,
        sendResponseObjectWithBetObj
    );

racingValidate
    .getApp()
    .post(
        `${BetEngineAPI.RACING_APP_VALIDATE_BET_ENTRY}`,
        validateBetFormat,
        getRacingInfo,
        validateTrackFromInfoServer,
        validateBetTrack,
        validateBetEntry,
        validateBet,
        sendResponseObjectWithBetObj
    );

racingValidate
    .getApp()
    .post(
        `${BetEngineAPI.RACING_APP_TRANSLATE_BETSLIP_TO_BETOBJ}`,
        validateBetSlipFormat,
        getRacingInfo,
        validateTrackFromInfoServer,
        betSlipToTicketDetail,
        validateTicketDetailFormat,
        ticketDetailToBetObj,
        validateBetEntry,
        validateBet,
        sendResponseObjectWithBetObj
    );

export const racingApp = racingValidate.getApp();
