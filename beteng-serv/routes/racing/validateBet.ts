import {
    ResponseObject,
    ResponseObjectCode,
    SUCCESS_RESPONSE,
} from '../../../share/models/response-common';
import { RacingBetObject } from '../../../share/models/comm-serv/Racing/RacingBetObject';
import { ERROR_MSG } from '../../../share/models/response-common';
import { validatePoolValid } from '../../../share/methods/beteng-serv/racing/validateBetEachLegFuc';
import {
    validateBetPool,
    validateBetRace,
    validateBetValue,
    validateFormula,
} from '../../../share/methods/beteng-serv/racing/validateBetFuc';
import {
    getPoolBySymbol,
    poolTypeMapPoolStr,
} from '../../../share/methods/beteng-serv/racing/translatePool';
import { RacingMeeting } from '../../../share/models/comm-serv/Racing/Enums';
import * as RacingUtil from '../../util/racing-util';
import { RacingBetObjectCriteria } from '../../../share/models/beteng-serv/racing/RacingCriteria';
import { logger } from '../../../share/utils/logs';

export interface EnabledStarter {
    Number: number;
    CompositeName: string;
    Composite: number[];
    NumberEngName: string;
    NumberChnName: string;
}
export interface EnabledPool {
    Pool: string;
    PoolEngName: string;
    PoolChnName: string;
    EnabledStarters: Array<EnabledStarter>;
}
export interface EnabledRace {
    RaceNo: number;
    EnabledPools: Array<EnabledPool>;
}
export interface EnabledTrack {
    Venue: string;
    Date: string;
    EnabledRaces: Array<EnabledRace>;
}
export const validateBetTrack = (req, res, next) => {
    const resObj: ResponseObject = Object.assign({}, SUCCESS_RESPONSE);
    const betObj = req.racingBetObject;
    let enabledRaces: EnabledRace[] = null;
    const betObj_enableTrack = req.enabledTracks.filter((track) => {
        return (
            RacingMeeting[track.Venue] === betObj.Meeting &&
            RacingUtil.getWeekDayCode(track.Date) === betObj.RaceDay
        );
    });
    if (betObj_enableTrack.length === 1) {
        enabledRaces = betObj_enableTrack[0].EnabledRaces;
    } else {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_EX_TKT_MEET_NOT_DEFINE;
        res.status(200).send(resObj);
        return;
    }

    if (!enabledRaces.length) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_SCMP_ERR_INVALID_RACE;
        res.status(200).send(resObj);
        return;
    } else {
        req.enabledRaces = enabledRaces;
    }
    next();
};

export const validateBet = (req, res, next) => {
    const resObj: ResponseObject = Object.assign({}, SUCCESS_RESPONSE);
    const betObj: RacingBetObject = req.racingBetObject;

    const poolStr = betObj.PoolType;
    let pool = getPoolBySymbol(poolStr);
    pool = poolTypeMapPoolStr(pool);
    if (!validatePoolValid(poolStr, pool, false, resObj)) {
        res.status(200).send(resObj);
        return;
    }

    const legs = betObj.Legs;
    const betToTal = betObj.BetTotal;
    const isFlexiBet = betObj.IsFlexiBet;
    const unitBet = betObj.UnitBet;
    if (betObj.Legs.length === 0) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_MISSING_LEG;
        res.status(200).send(resObj);
        return;
    }
    if (
        legs[0].QuickPickType !== 0 &&
        (((pool === 'QPTT' || pool === 'QPQTT') &&
            betObj.b_COMPUTER_QTT_TT === true) ||
            (pool !== 'QPTT' &&
                pool !== 'QPQTT' &&
                betObj.b_COMPUTER_QTT_TT === false))
    ) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
        logger.error('quick pick type but b_COMPUTER_QTT_TT not set correct');
        res.status(200).send(resObj);
        return;
    }
    if (
        !validateBetPool(legs, pool, resObj) ||
        !validateBetRace(legs, pool, resObj) ||
        !validateBetValue(isFlexiBet, unitBet, betToTal, resObj)
    ) {
        res.status(200).send(resObj);
        return;
    }
    if (
        RacingBetObjectCriteria[pool].isAllUp &&
        !validateFormula(legs.length, betObj.Formula, resObj)
    ) {
        res.status(200).send(resObj);
        return resObj;
    }
    next();
};
