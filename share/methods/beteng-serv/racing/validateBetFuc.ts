import { Leg, SelfSelection } from '../../../models/comm-serv/Racing/Leg';
import {
    ResponseObject,
    ResponseObjectCode,
    ERROR_MSG,
} from '../../../models/response-common';
import {
    RacingBetObjectCriteria,
    FormulaCriteria,
} from '../../../models/beteng-serv/racing/RacingCriteria';
import { logger } from '../../../utils/logs';
import {
    SelectType,
    validateDuplicateSelect,
    validateBetEachLegFuc,
    validatePoolValid,
} from './validateBetEachLegFuc';
import { RacingBetObject } from '../../../models/comm-serv/Racing/RacingBetObject';
import { objectFormatIsStandard } from '../../../utils/format-check';
import { Formula } from '../../../models/comm-serv/Racing/Formula';
import { getPoolBySymbol, poolTypeMapPoolStr } from './translatePool';
import { QPTT_TYPE } from '../../../models/comm-serv/Racing/Enums';

export const validateBetPool = (
    legs: Leg[],
    pool: string,
    resObj: ResponseObject
): boolean => {
    if (
        legs.some((leg) => {
            let legPool = getPoolBySymbol(leg.AllUpPoolType);
            legPool = poolTypeMapPoolStr(legPool);
            return (
                RacingBetObjectCriteria[pool].legPools.includes(legPool) ===
                false
            );
        })
    ) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_SCMP_ERR_INVALID_POOL;
        return false;
    }
    return true;
};

export const validateBetRace = (
    legs: Leg[],
    pool: string,
    resObj: ResponseObject
): boolean => {
    const legNum = legs.length;
    const minLegNum = RacingBetObjectCriteria[pool].minLegNum;
    const maxLegNum = RacingBetObjectCriteria[pool].maxLegNum;
    if (
        (pool === 'QPTT' || pool === 'TT') &&
        legs[0].QuickPickType === QPTT_TYPE.QPTT_A
    ) {
        if (legNum !== 6) {
            resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
            resObj.message = ERROR_MSG.RID_EX_TKT_INS_LEG;
            return false;
        } else {
            return true;
        }
    }
    if (minLegNum === undefined || maxLegNum === undefined) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
        logger.error(`Server RacingBetEntryCriteria for pool ${pool}'s multiBanker
         minBankerNumPerPlace or maxBankerNumPerPlace is undefined`);
        return false;
    }

    if (legNum < minLegNum) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_EX_TKT_INS_LEG;
        return false;
    } else if (legNum > maxLegNum) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_EX_TKT_TOO_MANY_LEG;
        return false;
    }

    // validate leg raceno is not duplicate
    if (
        !validateDuplicateSelect(
            SelectType.LEG,
            legs.map((leg) => leg.RaceNo),
            resObj
        )
    ) {
        // resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        // resObj.message = ERROR_MSG.RID_EX_BE_DUPLICATED_ENTRIES;
        return false;
    }
    // validate leg sequential or not
    if (RacingBetObjectCriteria[pool].sequentialLegs) {
        let flag = true;
        legs.sort((legA, legB) => legA.RaceNo - legB.RaceNo).reduce(
            (prevLeg, nextLeg) => {
                if (nextLeg.RaceNo - prevLeg.RaceNo !== 1) {
                    flag = false;
                }
                return nextLeg;
            }
        );
        if (!flag) {
            resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
            resObj.message = ERROR_MSG.RID_EX_BE_INVALID_LEGS_ORDER;
            return false;
        }
    }
    return true;
};

export const validateBetValue = (
    isFlexiBet: boolean,
    unitBet: number,
    betToTal: number,
    resObj: ResponseObject
): boolean => {
    if (betToTal < 0 || unitBet < 0) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_EX_TKT_ILL_VALUE_MARK;
        return false;
    }
    if (isFlexiBet) {
        if (betToTal === 0) {
            resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
            resObj.message = ERROR_MSG.RID_MISSING_BETTOTAL;
            return false;
        }
        //  else {
        //     if (unitBet !== 0) {
        //         resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        //         resObj.message = ERROR_MSG.RID_EX_TKT_ILL_VALUE_MARK;
        //         return false;
        //     }
        // }
    } else {
        if (unitBet === 0) {
            resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
            resObj.message = ERROR_MSG.RID_MISSING_UNITBET;
            return false;
        }
        // else {
        //     if (betToTal !== 0) {
        //         resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        //         resObj.message = ERROR_MSG.RID_EX_TKT_ILL_VALUE_MARK;
        //         return false;
        //     }
        // }
    }
    return true;
};

export const validateFormula = (
    legNum: number,
    formula: Formula,
    resObj: ResponseObject
): boolean => {
    const allUpType = '' + formula.Legs + 'x' + formula.Combs;
    if (formula.Legs !== legNum || !FormulaCriteria[allUpType]) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_SCMP_ERR_ILLEGAL_FORMULA;
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

    const racingBetObject = new RacingBetObject();
    const leg = new Leg();
    leg.Selections = [1];
    leg.Bankers = [1];
    racingBetObject.Legs = [leg];

    if (!(betObj && objectFormatIsStandard(betObj, racingBetObject))) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
        logger.error('the wrong format received');
        return resObj;
    }
    const poolStr = betObj.PoolType;
    let pool = getPoolBySymbol(poolStr);
    pool = poolTypeMapPoolStr(pool);
    if (!validatePoolValid(poolStr, pool, false, resObj)) {
        return resObj;
    }

    const legs = betObj.Legs;
    if (legs.length === 0) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_MISSING_LEG;
        return resObj;
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
        logger.error('quick pick type but b_COMPUTER_QTT_TT not set true');
        return resObj;
    }
    for (const leg of legs) {
        if (!validateBetEachLegFuc(pool, leg, resObj)) {
            return resObj;
        }
    }

    if (
        !validateBetPool(legs, pool, resObj) ||
        !validateBetRace(legs, pool, resObj)
    ) {
        return resObj;
    }

    if (
        RacingBetObjectCriteria[pool].isAllUp &&
        !validateFormula(legs.length, betObj.Formula, resObj)
    ) {
        return resObj;
    }
    return resObj;
};
