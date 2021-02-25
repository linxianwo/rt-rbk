import { AppBase } from '../../share/utils/app-base';
import {
    ResponseObject,
    SUCCESS_RESPONSE,
} from '../../share/models/response-common';
import { validateBet } from './football/validateBet';
import {
    validateJsonObjectFormat,
    sendResponseObject,
    validateBetSlipFormat,
    betSlipToTicketDetail,
    validateTicketDetailFormat,
} from './routeShare';
import { BetEngineAPI } from '../../share/protocols/kiosk-api-event';
import {
    FootballBetObject,
    Game,
    TourGame,
    Context,
} from '../../share/models/comm-serv/Football/FootballBetObject';
import { ticketDetailToBetObj } from './football/betSlipToBetObj';
import { getFootballMatchInfo } from '../util/betEngineRequest';
class FootballValidate extends AppBase {
    constructor() {
        super();
    }
}

const footballValidate = new FootballValidate();

// <!-- middleware and function called by middleware

const validateBetFormat = (req, res, next) => {
    const footballBetObject = new FootballBetObject();
    const context = new Context();
    const game = new Game();
    const tgame = new TourGame();
    game.contextList.push(context);
    tgame.contextList.push(context);
    footballBetObject.gameList.push(game);
    footballBetObject.tgameList.push(tgame);
    if (validateJsonObjectFormat(req, res, footballBetObject)) {
        req.footballBetObject = req.params.object;
        next();
    }
};

const sendResponseObjectWithBetObj = (req, res) => {
    const resObj: ResponseObject = Object.assign({}, SUCCESS_RESPONSE, {
        body: req.footballBetObject,
    });
    res.status(200).send(resObj);
};
//  middleware and function called by middleware --!>

// <!-- get method request for validateFootballBetObj
footballValidate.getApp().get('/', (req, res) => {
    res.setHeader('Content-type', 'text/html');
    res.send('<h1>Welcome Football Betting Engine Server</h1>');
});

footballValidate
    .getApp()
    .get(
        `${BetEngineAPI.FOOTBALL_APP_VALIDATE_BET_FORMAT_ENTRY}${BetEngineAPI.PARAMETER_ENTRY}`,
        validateBetFormat,
        sendResponseObject
    );

footballValidate
    .getApp()
    .get(
        `${BetEngineAPI.FOOTBALL_APP_VALIDATE_BET_ENTRY}${BetEngineAPI.PARAMETER_ENTRY}`,
        validateBetFormat,
        validateBet,
        sendResponseObjectWithBetObj
    );

footballValidate
    .getApp()
    .get(
        `${BetEngineAPI.RACING_APP_TRANSLATE_BETSLIP_TO_BETOBJ}${BetEngineAPI.PARAMETER_ENTRY}`,
        validateBetSlipFormat,
        betSlipToTicketDetail,
        validateTicketDetailFormat,
        ticketDetailToBetObj,
        getFootballMatchInfo,
        validateBet,
        sendResponseObjectWithBetObj
    );
//  get method request for validateFootballBetObj --!>

footballValidate
    .getApp()
    .post(
        `${BetEngineAPI.FOOTBALL_APP_VALIDATE_BET_ENTRY}`,
        validateBetFormat,
        validateBet,
        sendResponseObjectWithBetObj
    );

footballValidate
    .getApp()
    .post(
        `${BetEngineAPI.RACING_APP_TRANSLATE_BETSLIP_TO_BETOBJ}`,
        validateBetSlipFormat,
        betSlipToTicketDetail,
        validateTicketDetailFormat,
        ticketDetailToBetObj,
        getFootballMatchInfo,
        validateBet,
        sendResponseObjectWithBetObj
    );
export const footballApp = footballValidate.getApp();
