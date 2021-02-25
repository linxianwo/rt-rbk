import {
    RacingBetEntryCriteria,
    RacingBetObjectCriteria,
} from '../../../models/beteng-serv/racing/RacingCriteria';
import { logger } from '../../../utils/logs';
import {
    ResponseObject,
    ResponseObjectCode,
    ERROR_MSG,
} from '../../../models/response-common';
import { objectFormatIsStandard } from '../../../utils/format-check';
import {
    SelfSelection,
    Leg,
    CWInfo,
} from '../../../models/comm-serv/Racing/Leg';
import { calculateBetLineNumForEachLeg } from './calculateBetLineNum';
import { OrderCombinationsForDoubleDimensionArray } from '../../math/PermutationAndCombination';
import { getPoolBySymbol, poolTypeMapPoolStr } from './translatePool';
import { RacingBetObject } from '../../../models/comm-serv/Racing/RacingBetObject';
import { EnabledStarter } from '../../../../beteng-serv/routes/racing/validateBet';

export enum SelectType {
    SELECTION = 0,
    BANKER,
    TOTAL,
    LEG,
}

const validateSelectNum = (
    pool: string,
    selections: number[],
    resObj: ResponseObject,
    fieldSelectNum: number,
    criteria: string,
    minErrStr: string,
    maxErrStr: string
): boolean => {
    const minCriteria = 'min' + criteria;
    const maxCriteria = 'max' + criteria;
    const minSelectionNum = RacingBetEntryCriteria[pool][minCriteria];
    let maxSelectionNum = RacingBetEntryCriteria[pool][maxCriteria];
    if (minSelectionNum === undefined || maxSelectionNum === undefined) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
        logger.error(
            `Server RacingBetEntryCriteria for pool ${pool}'s ${minCriteria} or ${maxCriteria} is undefined`
        );
        return false;
    }
    maxSelectionNum = maxSelectionNum === -1 ? fieldSelectNum : maxSelectionNum;
    const selectionNum = selections.length;
    if (selectionNum < minSelectionNum) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = minErrStr;
        return false;
    } else if (maxSelectionNum >= 0 && selectionNum > maxSelectionNum) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = maxErrStr;
        return false;
    }
    return true;
};

const validateSSBankersBankerNum = (
    pool: string,
    bankers: number[],
    resObj: ResponseObject,
    fieldSelectNum: number
): boolean => {
    const minBankerNumPerPlace =
        RacingBetEntryCriteria[pool].multiBanker.minBankerNumPerPlace;
    let maxBankerNumPerPlace =
        RacingBetEntryCriteria[pool].multiBanker.maxBankerNumPerPlace;
    if (
        minBankerNumPerPlace === undefined ||
        maxBankerNumPerPlace === undefined
    ) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
        logger.error(`Server RacingBetEntryCriteria for pool ${pool}'s multiBanker
         minBankerNumPerPlace or maxBankerNumPerPlace is undefined`);
        return false;
    }
    maxBankerNumPerPlace =
        maxBankerNumPerPlace === -1 ? fieldSelectNum : maxBankerNumPerPlace;
    const bankernum = bankers.length;
    if (bankernum < minBankerNumPerPlace) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_EX_TKT_INSUF_BANKER;
        return false;
    } else if (maxBankerNumPerPlace >= 0 && bankernum > maxBankerNumPerPlace) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_EX_TKT_TOO_MANY_BANKER;
        return false;
    }
    return true;
};

export const validateDuplicateSelect = (
    selectType: SelectType,
    selections: number[],
    resObj: ResponseObject
): boolean => {
    if (new Set(selections).size !== selections.length) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        switch (selectType) {
            case SelectType.LEG:
                resObj.message = ERROR_MSG.RID_FOOTBALL_MATCH_SEQUENCE_ERROR;
                break;
            case SelectType.TOTAL:
                resObj.message = ERROR_MSG.RID_EX_TKT_LOTTERY_DUP_SELECTION;
                break;
            default:
                resObj.message = ERROR_MSG.RID_EX_BE_DUP_SELECTION.replace(
                    '%1',
                    selections
                        .filter((item, index) => {
                            return selections.indexOf(item) !== index;
                        })
                        .reduce((unique, item) => {
                            return unique.includes(item)
                                ? unique
                                : [...unique, item];
                        }, [])
                        .join(',')
                );
                break;
        }
        return false;
    }
    return true;
};

const validateAllSelectIsValid = (
    selections: number[],
    resObj: ResponseObject,
    enabledHorseNos: number[]
): boolean => {
    // JasonY: backend check horsenumber, so comment below code
    // if (
    //     selections.length === 0 ||
    //     enabledHorseNos === undefined ||
    //     enabledHorseNos.length === 0
    // ) {
    //     return true;
    // } else {
    //     if (
    //         selections.some(selection => {
    //             return enabledHorseNos.includes(selection) === false;
    //         })
    //     ) {
    //         resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
    //         resObj.message = ERROR_MSG.RID_EX_BE_RUNNER_SCRATCHED.replace(
    //             '%1',
    //             selections
    //                 .filter(selection => {
    //                     return enabledHorseNos.includes(selection) === false;
    //                 })
    //                 .join(',')
    //         );
    //         return false;
    //     }
    // }
    return true;
};

export const validateSelectionSets = (
    leg: Leg,
    poolStr: string,
    resObj: ResponseObject,
    enabledStarters?: EnabledStarter[]
): boolean => {
    let enabledHorseNos: number[] = [];
    if (enabledStarters) {
        enabledHorseNos = enabledStarters.map(
            (enabledStarter) => enabledStarter.Number
        );
    }
    const pool = leg.TceQttType ? poolStr + leg.TceQttType : poolStr;
    if (!RacingBetEntryCriteria[pool]) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
        logger.error(`leg pool:${pool} not defined in bet engine criteria`);
        return false;
    }
    const selections = leg.Selections;
    const bankers = leg.Bankers;
    const ssBankers = leg.SSBankers;
    const totalSelections = selections.concat(bankers);

    /* 
    JasonY 06-07-2020
        modified to do not check max selection number, because betengine do not check scratch horse, 
        so scratch horse will not exclude from the selections, too many error will report, but should report scratch error from backend
    */
    const fieldSelectNum = -1;
    // const fieldSelectNum =
    //     enabledHorseNos && enabledHorseNos.length > 0
    //         ? enabledHorseNos.length
    //         : -1;

    // check ssbanker format
    const selfSelection = new SelfSelection();
    selfSelection.Bankers = [1];
    const standardSSBankers = [selfSelection];
    if (leg.TceQttType && RacingBetEntryCriteria[pool].multiBanker) {
        if (!objectFormatIsStandard(ssBankers, standardSSBankers)) {
            resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
            resObj.message = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
            logger.error('wrong format of ssBankers');
            return false;
        }
    }

    if (
        !validateSelectNum(
            pool,
            bankers,
            resObj,
            fieldSelectNum,
            'BankerNum',
            ERROR_MSG.RID_EX_TKT_INSUF_BANKER,
            ERROR_MSG.RID_EX_TKT_TOO_MANY_BANKER
        )
    ) {
        return false;
    }
    if (
        !validateDuplicateSelect(SelectType.BANKER, bankers, resObj) ||
        !validateAllSelectIsValid(bankers, resObj, enabledHorseNos)
    ) {
        return false;
    }

    if (
        RacingBetEntryCriteria[pool].allowFieldSelect === false &&
        leg.IsFieldSelected
    ) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_EX_TKT_ILL_FIELD;
        logger.error(`${pool} don't allow field select`);
        return false;
    } else if (leg.IsFieldSelected) {
        return true;
    }

    if (
        !validateSelectNum(
            pool,
            selections,
            resObj,
            fieldSelectNum,
            'SelectionNum',
            ERROR_MSG.RID_EX_TKT_INS_SELECTION,
            ERROR_MSG.RID_EX_TKT_TOO_MANY_SELN
        ) ||
        !validateSelectNum(
            pool,
            totalSelections,
            resObj,
            fieldSelectNum,
            'TotalNum',
            ERROR_MSG.RID_EX_TKT_INS_SELECTION,
            ERROR_MSG.RID_EX_TKT_TOO_MANY_SELN
        )
    ) {
        return false;
    }

    if (leg.TceQttType && RacingBetEntryCriteria[pool].multiBanker) {
        if (
            ssBankers.length !==
            RacingBetEntryCriteria[pool].multiBanker.placeNum
        ) {
            resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
            resObj.message = ERROR_MSG.RID_EX_TKT_INSUF_BANKER;
            return false;
        }
        for (const selfSelection of ssBankers) {
            if (
                RacingBetEntryCriteria[pool].multiBanker.allowFieldSelect &&
                selfSelection.IsFieldSelected
            ) {
                break;
            } else if (selfSelection.IsFieldSelected) {
                resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                resObj.message = ERROR_MSG.RID_EX_TKT_ILL_FIELD;
                logger.error(`${pool} don't allow field select`);
                return false;
            }

            if (
                !validateSSBankersBankerNum(
                    pool,
                    selfSelection.Bankers,
                    resObj,
                    fieldSelectNum
                ) ||
                !validateDuplicateSelect(
                    SelectType.BANKER,
                    selfSelection.Bankers,
                    resObj
                ) ||
                !validateAllSelectIsValid(
                    selfSelection.Bankers,
                    resObj,
                    enabledHorseNos
                )
            ) {
                return false;
            }
        }

        // total across bankers combination number must greater than 1
        const combinations = OrderCombinationsForDoubleDimensionArray(
            ssBankers.map((selfSelection) => {
                return selfSelection.Bankers;
            })
        );
        if (combinations.length < 2) {
            resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
            // need to confirm error code
            resObj.message = ERROR_MSG.RID_EX_TKT_INSUF_BANKER;
            return false;
        }
        const validCombinations = combinations.filter((combination) => {
            return new Set(combination).size !== combination.length
                ? false
                : true;
        });
        const validateCombNum = validCombinations.length;
        if (validateCombNum < 1) {
            resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
            // need to confirm error code
            resObj.message = ERROR_MSG.RID_EX_TKT_ILL_BANKER;
            return false;
        }

        // validate some selection not used, eg: ssbanker's bankers is [[1],[3],[3,4,5]],in third banker,3 horse not used
        // const usedSSBankers: number[][] = [];
        // validCombinations.forEach(validCombination => {
        //     validCombination.forEach((item, index) => {
        //         if (!usedSSBankers[index]) {
        //             usedSSBankers[index] = [item];
        //         } else if (!usedSSBankers[index].includes(item)) {
        //             usedSSBankers[index].push(item);
        //         }
        //     });
        // });
        // for (let i = 0; i < ssBankers.length; i++) {
        //     if (ssBankers[i].Bankers.length !== usedSSBankers[i].length) {
        //         resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        //         resObj.message = ERROR_MSG.RID_EX_TKT_ILL_BANKER;
        //         return false;
        //     }
        // }
    } else {
        if (ssBankers.length) {
            resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
            resObj.message = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
            logger.error(
                'invalid bet object, SSBankers should be empty for' + pool
            );
            return false;
        }

        if (
            !validateDuplicateSelect(
                SelectType.SELECTION,
                selections,
                resObj
            ) ||
            !validateDuplicateSelect(SelectType.TOTAL, totalSelections, resObj)
        ) {
            return false;
        }

        if (!validateAllSelectIsValid(selections, resObj, enabledHorseNos)) {
            return false;
        }

        // if banker exist, total betline number must greater than 1
        // 2020-03-18 exclude IWIN pool for above rule
        if (
            pool !== 'IWIN' &&
            bankers.length &&
            calculateBetLineNumForEachLeg(leg, poolStr) /
                RacingBetEntryCriteria[pool].factor <=
                1
        ) {
            resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
            resObj.message = ERROR_MSG.RID_EX_TKT_INS_SELECTION;
            return false;
        }
    }
    // set CWA CWB CWC print information
    if (enabledHorseNos.length) {
        leg.cwSelInfo = [];
        leg.Selections.forEach((sel) => {
            const cwEachSelInfo: CWInfo = new CWInfo();
            enabledStarters.forEach((starter) => {
                if (starter.Number === sel) {
                    cwEachSelInfo.selCombNameC = starter.NumberChnName;
                    cwEachSelInfo.selCombNameE = starter.NumberEngName;
                    cwEachSelInfo.selContent = starter.Composite;
                    cwEachSelInfo.selSymbolName = starter.CompositeName;
                }
            });
            leg.cwSelInfo.push(cwEachSelInfo);
        });
        // add check selection is valid for CWA CWB CWC
        if (pool === 'CWA' || pool === 'CWB' || pool === 'CWC') {
            if (
                leg.cwSelInfo.some((cwEverySelInfo) => {
                    return cwEverySelInfo.selContent.length === 0;
                })
            ) {
                resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                resObj.message = ERROR_MSG.RID_INFO_NO_SELECTION_AVAIL;
                return false;
            }
        }
    }
    return true;
};

export const validatePoolValid = (
    poolStr: string,
    pool: string,
    isLegPool: boolean,
    resObj: ResponseObject
): boolean => {
    if (poolStr === '') {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_MISSING_POOL;
        return false;
    }

    if (pool === '') {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_SCMP_ERR_INVALID_POOL;
        return false;
    }

    if (isLegPool) {
        if (!RacingBetEntryCriteria[pool]) {
            resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
            resObj.message = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
            logger.error('leg pool not defined in bet engine criteria');
            return false;
        }
    } else {
        if (!RacingBetObjectCriteria[pool]) {
            resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
            resObj.message = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
            logger.error('betobj pool not defined in bet engine criteria');
            return false;
        }
    }
    return true;
};

export const validateBetEachLegFuc = (
    betObjPool: string,
    leg: Leg,
    resObj: ResponseObject
): boolean => {
    // translate PoolSymbol to pool string and validate defined in criteria
    let pool = '',
        poolStr = '';
    if (betObjPool) {
        if (RacingBetObjectCriteria[betObjPool].isAllUp) {
            poolStr = leg.AllUpPoolType;
            pool = getPoolBySymbol(poolStr);
            pool = poolTypeMapPoolStr(pool);
        } else {
            if (leg.AllUpPoolType !== '') {
                resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                resObj.message = ERROR_MSG.RID_SCMP_ERR_INVALID_POOL;
                return false;
            }
            poolStr = betObjPool;
            pool = poolStr;
        }
    }
    if (
        !validatePoolValid(
            poolStr,
            leg.TceQttType ? pool + leg.TceQttType : pool,
            true,
            resObj
        )
    ) {
        return false;
    }

    if (!validateSelectionSets(leg, pool, resObj)) {
        return false;
    }
    return true;
};
