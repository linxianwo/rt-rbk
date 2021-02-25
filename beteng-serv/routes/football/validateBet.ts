import {
    ResponseObject,
    SUCCESS_RESPONSE,
    ResponseObjectCode,
    ERROR_MSG,
} from '../../../share/models/response-common';
import {
    FootballBetObject,
    ODDS_INDICATION,
    SCBET_TYPE,
} from '../../../share/models/comm-serv/Football/FootballBetObject';
import {
    validateFormula,
    tgameValidate,
    gameValidate,
} from '../../../share/methods/beteng-serv/football/validateBetFuc';
import { PCODE } from '../../../share/models/comm-serv/CommonDefs';
import { calculateBetLineNumForEachBetType } from '../../../share/methods/beteng-serv/football/calculateBetLineNum';

export const validateBet = (req, res, next) => {
    const resObj: ResponseObject = Object.assign({}, SUCCESS_RESPONSE);
    const betObj: FootballBetObject = req.footballBetObject;

    if (!validateFormula(betObj, resObj)) {
        res.status(200).send(resObj);
        return;
    }
    // validate tgameList or gameList not empty
    const betType = betObj.scBetType;
    const gameList = betObj.gameList;
    const tgameList = betObj.tgameList;
    const quickPick = betObj.quickPick;
    const oddsIndicator = betObj.oddsIndicator;
    let oddsFlag = false;
    if (oddsIndicator === ODDS_INDICATION.FIXED_ODDS_WITH_ODDS) {
        oddsFlag = true;
    }
    if (
        (betType === SCBET_TYPE.MATCH_BET && !gameList.length) ||
        (betType === SCBET_TYPE.TOUR_BET && !tgameList.length)
    ) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_MISSING_GAME;
        res.status(200).send(resObj);
        return;
    }

    if (betType === SCBET_TYPE.MATCH_BET) {
        if (
            betObj.gameList[0].pool.code === PCODE.PC_HFMP6 &&
            betObj.gameList.length !== 6 &&
            betObj.quickPick === false
        ) {
            resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
            resObj.message = ERROR_MSG.RID_MISSING_GAME;
            res.status(200).send(resObj);
            return;
        }
        for (let game of gameList) {
            if (!gameValidate(game, oddsFlag, quickPick, resObj)) {
                res.status(200).send(resObj);
                return;
            }
        }
        // add all bet valid check for DHCP
        // delete this rule 2020-12-21
        // if (betObj.gameList[0].pool.code === PCODE.PC_DHCP) {
        //     if (
        //         calculateBetLineNumForEachBetType(
        //             betObj,
        //             betObj.gameList,
        //             true
        //         ) !==
        //         calculateBetLineNumForEachBetType(
        //             betObj,
        //             betObj.gameList,
        //             false
        //         )
        //     ) {
        //         resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        //         resObj.message = ERROR_MSG.RID_FOOTBALL_INVALID_DHCP_ERROR;
        //         res.status(200).send(resObj);
        //         return;
        //     }
        // }
    } else if (betType === SCBET_TYPE.TOUR_BET) {
        for (const tgame of tgameList) {
            if (!tgameValidate(tgame, oddsFlag, quickPick, resObj)) {
                res.status(200).send(resObj);
                return;
            }
        }
    }

    if (!quickPick && betObj.unitBet <= 0) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_MISSING_UNITBET;
        res.status(200).send(resObj);
        return;
    }
    next();
};
