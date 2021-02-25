import { RacingBetObject } from '../../../models/comm-serv/Racing/RacingBetObject';
import { Leg, SelfSelection } from '../../../models/comm-serv/Racing/Leg';
import { getPoolBySymbol, poolTypeMapPoolStr } from './translatePool';
import {
    RacingBetEntryCriteria,
    FormulaCriteria,
    RacingBetObjectCriteria,
} from '../../../models/beteng-serv/racing/RacingCriteria';
import {
    A,
    C,
    CombinationsForC,
    OrderCombinationsForDoubleDimensionArray,
} from '../../math/PermutationAndCombination';
import { PoolSymbol } from '../../../models/comm-serv/Racing/PoolType';
import { QPTT_TYPE, QPQTT_TYPE } from '../../../models/comm-serv/Racing/Enums';

const calculateMultiBankerBetLineNum = (ssBankers: SelfSelection[]): number => {
    const combinations = OrderCombinationsForDoubleDimensionArray(
        ssBankers.map((selfSelection) => {
            return selfSelection.Bankers;
        })
    );
    return combinations.filter((combination) => {
        return new Set(combination).size !== combination.length ? false : true;
    }).length;
};

const calculateBetLineNumForSelect = (
    method,
    totalNum: number,
    selectNum: number
) => {
    let num = 0;
    if (!method) {
        return 1;
    } else if (method === 'A') {
        num = A(totalNum, selectNum);
    } else if (method === 'C') {
        num = C(totalNum, selectNum);
    }
    return num;
};

export const calculateBetLineNumForEachLeg = (
    leg: Leg,
    betObjPool: string
): number => {
    let num = 0;
    let pool = '';
    if (betObjPool) {
        pool = betObjPool;
    } else {
        pool = getPoolBySymbol(leg.AllUpPoolType);
        pool = poolTypeMapPoolStr(pool);
    }
    pool = leg.TceQttType ? pool + leg.TceQttType : pool;
    const selections = leg.Selections;
    const bankers = leg.Bankers;
    const ssBankers = leg.SSBankers;
    const totalSelections = selections.concat(bankers);
    if (leg.TceQttType && RacingBetEntryCriteria[pool].multiBanker) {
        num = calculateMultiBankerBetLineNum(leg.SSBankers);
    } else {
        const selectionsBetLineNum = calculateBetLineNumForSelect(
            RacingBetEntryCriteria[pool].selectionBetLineCountFunc,
            new Set(totalSelections).size - bankers.length,
            RacingBetEntryCriteria[pool].numPerBetLine - bankers.length
        );
        const bankersBetLineNum = calculateBetLineNumForSelect(
            RacingBetEntryCriteria[pool].bankerBetLineCountFunc,
            RacingBetEntryCriteria[pool].numPerBetLine,
            bankers.length
        );
        num =
            RacingBetEntryCriteria[pool].factor *
            selectionsBetLineNum *
            bankersBetLineNum;
    }
    return num;
};

export const calculateBetLineNum = (betObj: RacingBetObject): number => {
    /* 
        1. Jeff Hong 11/04/2020, 
        2. modified by Jason Yang, to support betslip QPTT QPQTT
    */
    if (
        betObj.PoolType === PoolSymbol.TT &&
        betObj.Legs[0].QuickPickType === QPTT_TYPE.QPTT_A
    ) {
        return 2;
    }
    if (betObj.PoolType === PoolSymbol.QPTT) {
        if (betObj.Legs[0].QuickPickType === QPTT_TYPE.QPTT_A) {
            return 2;
        } else if (betObj.Legs[0].QuickPickType === QPTT_TYPE.QPTT_B) {
            return 64;
        } else if (betObj.Legs[0].QuickPickType === QPTT_TYPE.QPTT_C) {
            return 27;
        } else if (betObj.Legs[0].QuickPickType === QPTT_TYPE.QPTT_D) {
            return 4;
        }
    } else if (
        betObj.PoolType === PoolSymbol.QTT ||
        betObj.PoolType === PoolSymbol.QPQTT
    ) {
        if (betObj.Legs[0].QuickPickType === QPQTT_TYPE.QPQTT_A) {
            return 24;
        } else if (betObj.Legs[0].QuickPickType === QPQTT_TYPE.QPQTT_B) {
            return 120;
        } else if (betObj.Legs[0].QuickPickType === QPQTT_TYPE.QPQTT_C) {
            return 360;
        }
    }
    let num = 0;
    const legs = betObj.Legs;
    const legsBetLineCount: number[] = Array(legs.length);
    const allUpType = '' + betObj.Formula.Legs + 'x' + betObj.Formula.Combs;
    let pool = getPoolBySymbol(betObj.PoolType);
    pool = poolTypeMapPoolStr(pool);
    for (let i = 0; i < legs.length; i++) {
        legsBetLineCount[i] = calculateBetLineNumForEachLeg(
            legs[i],
            RacingBetObjectCriteria[pool].isAllUp ? undefined : pool
        );
    }

    if (RacingBetObjectCriteria[pool].isAllUp) {
        const formulaRule: number[] = FormulaCriteria[allUpType];
        if (!formulaRule || formulaRule.length !== legs.length) {
            return num;
        }
        for (let i = 0; i < formulaRule.length; i++) {
            if (formulaRule[i]) {
                const combinations: number[][] = CombinationsForC(
                    formulaRule.map((value, index) => index),
                    i + 1
                );
                for (const combination of combinations) {
                    let tmpNum = 1;
                    for (const legIndex of combination) {
                        tmpNum *= legsBetLineCount[legIndex];
                    }
                    num += tmpNum;
                }
            }
        }
    } else {
        num = 1;
        for (let i = 0; i < legs.length; i++) {
            num = num * legsBetLineCount[i];
        }
    }
    return Math.round(num);
};
