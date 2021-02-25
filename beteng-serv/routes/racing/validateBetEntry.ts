import { logger } from '../../../share/utils/logs';
import { RacingBetObject } from '../../../share/models/comm-serv/Racing/RacingBetObject';
import { Leg } from '../../../share/models/comm-serv/Racing/Leg';
import {
    ResponseObject,
    ResponseObjectCode,
    ERROR_MSG,
    SUCCESS_RESPONSE,
} from '../../../share/models/response-common';
import { EnabledPool, EnabledRace } from './validateBet';
import { PoolTypeString } from '../../../share/models/render/RacingEntitys';
import {
    validateSelectionSets,
    validatePoolValid,
} from '../../../share/methods/beteng-serv/racing/validateBetEachLegFuc';
import {
    RacingBetObjectCriteria,
    RacingBetEntryCriteria,
} from '../../../share/models/beteng-serv/racing/RacingCriteria';
import {
    getPoolBySymbol,
    poolTypeMapPoolStr,
    infoServerPoolStrMapPoolStr,
} from '../../../share/methods/beteng-serv/racing/translatePool';

// validate race defined in races which fetch from infoservice
const validateRace = (
    raceNo: number,
    resObj: ResponseObject,
    enabledRaces: EnabledRace[],
    betslipRequest: boolean,
    checkPoolStatus: boolean
): boolean => {
    let flag = true;
    return true;
    // if (!checkPoolStatus) {
    //     return flag;
    // }
    // flag = enabledRaces.some((enabledRace) => enabledRace.RaceNo === raceNo);
    // if (!flag) {
    //     resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
    //     // if (betslipRequest) {
    //     //     resObj.message = ERROR_MSG.RID_EX_BE_RACE_CLOSED.replace(
    //     //         '%1',
    //     //         '' + raceNo
    //     //     );
    //     // } else {
    //     //     resObj.message = ERROR_MSG.RID_EX_BE_POOL_CLOSED;
    //     // }
    //     resObj.message = ERROR_MSG.RID_EX_BE_INVALID_RACE;
    //     return flag;
    // }
    // return flag;
};

// validate pool defined in RacingBetEntryCriteria and infoservice
const validatePool = (
    enabledPools: EnabledPool[],
    pool: string,
    resObj: ResponseObject,
    checkLegPool: Boolean,
    checkPoolStatus: boolean
): boolean => {
    let flag = true;
    // if (!checkPoolStatus) {
    //     return flag;
    // }
    if (checkLegPool && enabledPools.length) {
        // validate defined in pools which fetch from infoservice
        flag = enabledPools.some(
            (enabledPool) =>
                infoServerPoolStrMapPoolStr(enabledPool.Pool) === pool
        );
        if (!flag) {
            resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
            // resObj.message = ERROR_MSG.RID_EX_BE_POOL_CLOSED.replace(
            //     '%1',
            //     PoolTypeString[pool]
            // );
            if (
                RacingBetObjectCriteria[pool] &&
                RacingBetObjectCriteria[pool].minLegNum > 1
            ) {
                resObj.message = ERROR_MSG.RID_EX_TKT_POOL_NOT_DEFINE;
            } else {
                resObj.message = ERROR_MSG.RID_EX_TKT_POOL_NOT_DEFINE_JKC;
            }
            return false;
        }
    }
    return flag;
};

const validateLeg = (
    leg: Leg,
    poolStr: string,
    resObj: ResponseObject,
    enabledRaces: EnabledRace[],
    checkLegPool: boolean,
    betslipRequest: boolean,
    checkPoolStatus: boolean
): boolean => {
    const pool = leg.TceQttType ? poolStr + leg.TceQttType : poolStr;
    const raceNo = leg.RaceNo;
    if (
        !validateRace(
            raceNo,
            resObj,
            enabledRaces,
            betslipRequest,
            checkPoolStatus
        )
    ) {
        // JasonY: for multi-leg pool, if not first race stop sell, still can sell 2020-06-24
        if (!checkLegPool) {
            return true;
        }
        return false;
    }
    let enabledPools: EnabledPool[] = [];
    if (enabledRaces !== null) {
        enabledRaces.forEach((enabledRace) => {
            if (enabledRace.RaceNo === raceNo) {
                enabledPools = enabledRace.EnabledPools;
            }
        });
    }

    if (enabledRaces !== null && !enabledPools.length && checkPoolStatus) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_EX_BE_INVALID_RACE.replace('%1', 'All');
        return false;
    }
    if (
        RacingBetEntryCriteria[pool] &&
        RacingBetEntryCriteria[pool].groupPool
    ) {
        for (const detailPool of RacingBetEntryCriteria[pool].groupPool.pools) {
            if (
                !validatePool(
                    enabledPools,
                    detailPool,
                    resObj,
                    checkLegPool,
                    checkPoolStatus
                )
            ) {
                return false;
            }
        }
    } else {
        if (
            !validatePool(
                enabledPools,
                poolStr,
                resObj,
                checkLegPool,
                checkPoolStatus
            )
        ) {
            return false;
        }
    }

    // set Pool Chinese & English name
    enabledPools.forEach((enabledPool) => {
        if (infoServerPoolStrMapPoolStr(enabledPool.Pool) === poolStr) {
            leg.poolNameC = enabledPool.PoolChnName;
            leg.poolNameE = enabledPool.PoolEngName;
        }
    });
    return true;
};

export const validateBetEachLeg = (req, res, next?): boolean => {
    const checkPoolStatus = req.checkPoolStatus;
    const resObj: ResponseObject = Object.assign({}, SUCCESS_RESPONSE);
    const leg: Leg = req.racingBetEntry;

    let pool = '',
        poolStr = '',
        checkLegPool = false;
    if (req.betObjPool) {
        if (RacingBetObjectCriteria[req.betObjPool].isAllUp) {
            poolStr = leg.AllUpPoolType;
            pool = getPoolBySymbol(poolStr);
            pool = poolTypeMapPoolStr(pool);
            checkLegPool = true;
        } else {
            if (leg.AllUpPoolType !== '') {
                resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                resObj.message = ERROR_MSG.RID_SCMP_ERR_INVALID_POOL;
                res.status(200).send(resObj);
                return false;
            }
            poolStr = req.betObjPool;
            pool = poolStr;
            if (leg.RaceNo === req.firstLegRaceNo) {
                checkLegPool = true;
            }
        }
    }
    const tmpPool = leg.TceQttType ? pool + leg.TceQttType : pool;
    if (!validatePoolValid(poolStr, tmpPool, true, resObj)) {
        res.status(200).send(resObj);
        return false;
    }
    const enabledStarters = [];
    const enabledRaces: EnabledRace[] = req.enabledRaces;
    if (enabledRaces === null) {
        checkLegPool = false;
    }
    if (
        !validateLeg(
            leg,
            pool,
            resObj,
            enabledRaces,
            checkLegPool,
            req.betslipRequest,
            checkPoolStatus
        )
    ) {
        res.status(200).send(resObj);
        return false;
    }
    if (checkLegPool) {
        enabledRaces.forEach((enabledRace) => {
            if (enabledRace.RaceNo === leg.RaceNo) {
                enabledRace.EnabledPools.forEach((enabledPool) => {
                    if (
                        (RacingBetEntryCriteria[tmpPool].groupPool &&
                            RacingBetEntryCriteria[tmpPool].groupPool
                                .pools[0] ===
                            infoServerPoolStrMapPoolStr(
                                enabledPool.Pool
                            )) ||
                        pool === infoServerPoolStrMapPoolStr(enabledPool.Pool)
                    ) {
                        enabledPool.EnabledStarters.forEach(
                            (enabledStarter) => {
                                enabledStarters.push(enabledStarter);
                            }
                        );
                    }
                });
            }
        });

        if (enabledStarters.length === 0 && checkPoolStatus) {
            resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
            resObj.message = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
            logger.error(
                `no horse get from info-serv for raceNo:${leg.RaceNo} pool:${leg.AllUpPoolType}`
            );
            res.status(200).send(resObj);
            return false;
        }
    }

    if (!validateSelectionSets(leg, pool, resObj, enabledStarters)) {
        res.status(200).send(resObj);
        return false;
    }

    if (next) {
        next();
    }
    return true;
};

export const validateBetEntry = (req, res, next) => {
    const resObj: ResponseObject = Object.assign({}, SUCCESS_RESPONSE);
    const betObj: RacingBetObject = req.racingBetObject;

    if (!betObj.Legs || betObj.Legs.length === 0) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_MISSING_LEG;
        res.status(200).send(resObj);
        return;
    } else {
        const poolStr = betObj.PoolType;
        let pool = getPoolBySymbol(poolStr);
        pool = poolTypeMapPoolStr(pool);
        if (!validatePoolValid(poolStr, pool, false, resObj)) {
            res.status(200).send(resObj);
            return;
        }
        req.betObjPool = pool;
        req.firstLegRaceNo = betObj.Legs[0].RaceNo;
        for (const leg of betObj.Legs) {
            req.racingBetEntry = leg;
            if (!validateBetEachLeg(req, res)) {
                return;
            }
        }
    }
    next();
};
