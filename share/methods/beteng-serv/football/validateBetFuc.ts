import {
    ResponseObject,
    SUCCESS_RESPONSE,
    ResponseObjectCode,
    ERROR_MSG,
} from '../../../models/response-common';

import {
    FootballBetObject,
    SCBET_TYPE,
    Context,
    ODDS_INDICATION,
} from '../../../models/comm-serv/Football/FootballBetObject';

import * as footballGlobal from '../../../models/comm-serv/Football/FootballBetObject';
import {
    FootballFormulaCriteria,
    FootballBetObjectCriteria,
} from '../../../models/beteng-serv/football/FootballCriteria';
import { getObjectKeyFromValue } from '../../util';
import { PCODE } from '../../../models/comm-serv/CommonDefs';
import { objectFormatIsStandard } from '../../../utils/format-check';
import { SYSTEM_ERROR } from '../../../models/errorMessage';
import { logger } from '../../../utils/logs';

const MAX_SCBET_LEG = 8;
///////////////////////////////////////////////////////////////////////////////
//
//  validateHCSP()
//
//  special checking for HCSP and DHCP;
//  ensures there are selections in both first half and full time
//
///////////////////////////////////////////////////////////////////////////////
export const validateHCSP = (
    contextList: Context[],
    resObj: ResponseObject,
    bVoidLeg: boolean
): boolean => {
    let bHasFirstHalf = false;
    let bHasFullTime = false;

    for (let i = 0; i < contextList.length; i++) {
        if (contextList[i].scContext.firstHalf) {
            bHasFirstHalf = true;
        } else {
            bHasFullTime = true;
        }
    }

    if ((!bHasFirstHalf || !bHasFullTime) && !bVoidLeg) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_EX_BE_INSUF_SELECT;
        return false;
    }

    return true;
};

export const contextValidate = (
    poolStr: string,
    context: Context,
    oddsFlag: boolean,
    resObj: ResponseObject,
    checkScContextTypeInContext: boolean
): boolean => {
    const scContext = context.scContext;
    if (checkScContextTypeInContext) {
        if (
            scContext instanceof
                footballGlobal[
                    FootballBetObjectCriteria[poolStr].scContext.type
                ] ===
            false
        ) {
            resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
            resObj.message = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
            return false;
        }
    }

    const constraint_fields: Array<{ field: string; valueType: string }> =
        FootballBetObjectCriteria[poolStr].scContext.constraint_fields;
    for (const constraint_field of constraint_fields) {
        if (constraint_field.valueType === 'Number') {
            if (
                scContext[constraint_field.field] === undefined ||
                scContext[constraint_field.field] < 0
            ) {
                resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                resObj.message = ERROR_MSG.RID_MISSING_SELECTIONS;
                return false;
            }
        } else {
            if (
                !scContext['field'] &&
                !Object.values(
                    footballGlobal[constraint_field.valueType]
                ).includes(scContext[constraint_field.field])
            ) {
                resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                resObj.message = ERROR_MSG.RID_MISSING_SELECTIONS;
                return false;
            }
        }
    }
    if (oddsFlag && context.odds === 0) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_MISSING_ODDS;
        return false;
    }

    return true;
};

export const gameValidate = (
    game: footballGlobal.Game,
    oddsFlag: boolean,
    quickPick: boolean,
    resObj: ResponseObject,
    checkScContextTypeInContext: boolean = false
): boolean => {
    const poolCode = game.pool.code;
    const poolStr = getObjectKeyFromValue(poolCode, PCODE);
    const bPariMu = game.pool.bPariMutuel;
    if (
        poolStr === '' ||
        bPariMu !== FootballBetObjectCriteria[poolStr].bPariMutuel
    ) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_EX_TKT_POOL_NOT_DEFINE_JKC;
        return false;
    }
    if (FootballBetObjectCriteria[poolStr].scBetType != SCBET_TYPE.MATCH_BET) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_EX_TKT_POOL_NOT_DEFINE_JKC;
        return false;
    }
    const matchNum = game.matchNumber;
    const matchDay = game.matchDay;
    const nItemNum = game.nItemNum;
    const contextList = game.contextList;
    const numOfContexts = contextList.length;
    const bVoidLeg = game.bVoidLeg;
    if (matchNum <= 0) {
        if (matchNum === 0 && !quickPick) {
            resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
            resObj.message = ERROR_MSG.RID_EX_TKT_NO_MATCH;
            return false;
        }
    } else if (matchDay < 0x00 || matchDay > 0x06) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_EX_TKT_NO_DAY;
        return false;
    } else if (
        (poolCode === PCODE.PC_SPCM || poolCode === PCODE.PC_STB) &&
        nItemNum === 0
    ) {
        //  should be missing item
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_MISSING_POOL;
        return false;
    } else if (poolCode === PCODE.PC_XXX) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_MISSING_POOL;
        return false;
    } else if (
        numOfContexts < FootballBetObjectCriteria[poolStr].minNumOfContexts &&
        !bVoidLeg
    ) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_EX_BE_INSUF_SELECT;
        return false;
    } else if (
        numOfContexts > 0 &&
        bVoidLeg &&
        /*bHaFu68Tkt && */ !quickPick &&
        poolCode !== PCODE.PC_SPCM
    ) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_EX_TKT_TOO_MANY_SELN;
        return false;
    } else if (
        numOfContexts > FootballBetObjectCriteria[poolStr].maxNumOfContexts
    ) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_EX_TKT_TOO_MANY_SELN;
        return false;
    } else {
        if (poolCode === PCODE.PC_HCSP || poolCode === PCODE.PC_DHCP) {
            if (!validateHCSP(contextList, resObj, bVoidLeg)) {
                return false;
            }
        }
        for (let i = 0; i < numOfContexts; i++) {
            if (
                !contextValidate(
                    poolStr,
                    contextList[i],
                    oddsFlag,
                    resObj,
                    checkScContextTypeInContext
                )
            ) {
                return false;
            }
        }
    }
    return true;
};

export const tgameValidate = (
    tgame: footballGlobal.TourGame,
    oddsFlag: boolean,
    quickPick: boolean,
    resObj: ResponseObject,
    checkScContextTypeInContext: boolean = false
): boolean => {
    const poolCode = tgame.pool.code;
    const poolStr = getObjectKeyFromValue(poolCode, PCODE);
    const contextList = tgame.contextList;
    const numOfContexts = contextList.length;
    if (tgame.nTourNo <= 0) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_MISSING_TOUR;
        return false;
    } else if (tgame.nGrpEvtNo <= 0) {
        switch (poolCode) {
            case PCODE.PC_ADTP:
            case PCODE.PC_GPF:
            case PCODE.PC_GPW:
            case PCODE.PC_TPS: //  treat as tps type for PC_TPS
                resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                resObj.message = ERROR_MSG.RID_EX_TKT_NO_EVENT;
                return false;
            case PCODE.PC_SPCT:
            case PCODE.PC_CHP:
            case PCODE.PC_FLT:
            case PCODE.PC_TOFP:
            case PCODE.PC_JKC:
                // can be zero
                if (tgame.nGrpEvtNo < 0) {
                    resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                    resObj.message = ERROR_MSG.RID_EX_TKT_NO_GROUP;
                    return false;
                }
                break;
            default:
                resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                resObj.message = ERROR_MSG.RID_EX_TKT_POOL_NOT_DEFINE_JKC;
                return false;
        }
    }
    if (poolCode === PCODE.PC_SPCT && tgame.nItemNum === 0) {
        //  should be missing item
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_EX_TKT_NO_EVENT;
        return false;
    } else if (poolCode === PCODE.PC_XXX) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_MISSING_POOL;
        return false;
    } else if (
        numOfContexts < FootballBetObjectCriteria[poolStr].minNumOfContexts
    ) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_EX_BE_INSUF_SELECT;
        return false;
    } else if (
        numOfContexts > FootballBetObjectCriteria[poolStr].maxNumOfContexts
    ) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_EX_TKT_TOO_MANY_SELN;
        return false;
    } else {
        for (let i = 0; i < numOfContexts; i++) {
            if (
                !contextValidate(
                    poolStr,
                    contextList[i],
                    oddsFlag,
                    resObj,
                    checkScContextTypeInContext
                )
            ) {
                return false;
            }
        }
    }

    return true;
};

export const validateFormula = (betObj, resObj: ResponseObject): boolean => {
    const betType = betObj.scBetType;
    const legNum = betObj.allUp.leg;
    const combinationNum = betObj.allUp.combination;
    const formula = '' + legNum + 'x' + combinationNum;
    if (!Object.keys(FootballFormulaCriteria).includes(formula)) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_EX_BE_INVALID_FORMULA;

        return false;
    }
    let matchList;
    if (betType === SCBET_TYPE.MATCH_BET) {
        matchList = betObj.gameList;
        if (matchList[0].pool.code === PCODE.PC_STB) {
            //  only allow 4x1 or 8x1
            if (
                (legNum !== MAX_SCBET_LEG / 2 && legNum !== MAX_SCBET_LEG) ||
                combinationNum !== 1
            ) {
                resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                resObj.message = ERROR_MSG.RID_EX_BE_INVALID_FORMULA;
                return false;
            }
        }
    } else {
        matchList = betObj.tgameList;
    }
    if (legNum > 1 && matchList.length !== legNum) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_EX_BE_INVALID_FORMULA;
        return false;
    }
    return true;
};

export const validateBetFuc = (betObj): ResponseObject => {
    const resObj: ResponseObject = {
        code: ResponseObjectCode.SUCCESS_CODE,
        body: null,
        message: 'success',
    };

    const footballBetObject = new FootballBetObject();
    const context = new Context();
    const tmpgame = new footballGlobal.Game();
    const tmptgame = new footballGlobal.TourGame();
    tmpgame.contextList.push(context);
    tmptgame.contextList.push(context);
    footballBetObject.gameList.push(tmpgame);
    footballBetObject.tgameList.push(tmptgame);
    if (!(betObj && objectFormatIsStandard(betObj, footballBetObject))) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
        logger.error('the wrong format received');
        return resObj;
    }
    if (!validateFormula(betObj, resObj)) {
        return resObj;
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
        return resObj;
    }

    const checkScContextTypeInContext = true;

    if (betType === SCBET_TYPE.MATCH_BET) {
        if (
            betObj.gameList[0].pool.code === PCODE.PC_HFMP6 &&
            betObj.gameList.length !== 6
        ) {
            resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
            resObj.message = ERROR_MSG.RID_MISSING_GAME;
            return resObj;
        }
        for (const game of gameList) {
            if (
                !gameValidate(
                    game,
                    oddsFlag,
                    quickPick,
                    resObj,
                    checkScContextTypeInContext
                )
            ) {
                return resObj;
            }
        }
    } else if (betType === SCBET_TYPE.TOUR_BET) {
        for (const tgame of tgameList) {
            if (
                !tgameValidate(
                    tgame,
                    oddsFlag,
                    quickPick,
                    resObj,
                    checkScContextTypeInContext
                )
            ) {
                return resObj;
            }
        }
    }

    // if (!quickPick && betObj.unitBet <= 0) {
    //     resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
    //     resObj.message = ERROR_MSG.RID_MISSING_UNITBET;
    //     return resObj;
    // }
    return resObj;
};
