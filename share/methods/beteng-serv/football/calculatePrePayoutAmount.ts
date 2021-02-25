import {
    FootballBetObject,
    SCBET_TYPE,
    Game,
    TourGame,
} from '../../../models/comm-serv/Football/FootballBetObject';
import { ALLUP_TYPE } from '../../../models/comm-serv/CommonDefs';
import { FormulaCriteria } from '../../../models/beteng-serv/racing/RacingCriteria';
import { CombinationsForC } from '../../math/PermutationAndCombination';

export const calMaxBet = (obj: Game | TourGame) => {
    let maxNum = 0;
    obj.contextList.forEach((v) => {
        maxNum = v.odds > maxNum ? v.odds : maxNum;
    });
    return maxNum / 1000;
};
export const calculatePrePayoutAmount = (betObj: FootballBetObject): number => {
    let num = 0;
    let betType = betObj.scBetType;
    let unitBet = betObj.unitBet;
    let allupType = betObj.allUpType;
    let gameList = betObj.gameList;
    let tgameList = betObj.tgameList;
    let list = [];
    switch (betType) {
        case SCBET_TYPE.MATCH_BET:
            list = gameList;
            break;
        case SCBET_TYPE.TOUR_BET:
            list = tgameList;
            break;
        case SCBET_TYPE.NOVELTY_BET:
            break;
        case SCBET_TYPE.CROSS_POOL_BET:
            break;
        case SCBET_TYPE.EMPTY_BET:
            break;
    }
    if (
        // betType === SCBET_TYPE.MATCH_BET &&
        allupType === ALLUP_TYPE.NON_ALLUP
    ) {
        // num =
        //   (
        //     list[0].contextList.sort((a, b) => {
        //       return b.odds - a.odds;
        //     })[0].odds) /
        //   1000;
        num = calMaxBet(list[0]);
    } else if (allupType === ALLUP_TYPE.NORMAL_ALLUP) {
        const allUpType =
            '' + betObj.allUp.leg + 'x' + betObj.allUp.combination;
        // const legsBetLineCount: number[] = Array(gameList.length);
        const formulaRule: number[] = FormulaCriteria[allUpType];
        if (!formulaRule || formulaRule.length !== list.length) {
            return num;
        }
        const legDividendList = list.map((v) =>
            // v.contextList.sort((a, b) => {
            //   return b.odds - a.odds;
            // })[0].odds / 1000
            calMaxBet(v)
        );
        for (let i = 0; i < formulaRule.length; i++) {
            if (formulaRule[i]) {
                const combinations: number[][] = CombinationsForC(
                    formulaRule.map((value, index) => index),
                    i + 1
                );
                for (const combination of combinations) {
                    let tmpNum = 1;
                    for (const legIndex of combination) {
                        tmpNum *= legDividendList[legIndex];
                    }
                    num += tmpNum;
                }
            }
        }
    }
    const result = Math.round(num * unitBet);
    const maxnum = 999999999999;
    return result > maxnum ? 999999999999 : result;
};
