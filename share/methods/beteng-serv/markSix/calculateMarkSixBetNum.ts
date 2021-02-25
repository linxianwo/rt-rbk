import { C } from '../../math/PermutationAndCombination';
import { MK6_TYPE } from '../../../models/comm-serv/MarSix/Enums';
import { MarkSixBetObject } from '../../../models/comm-serv/MarSix/MarkSixBetObject';

//  only for every bet; compute quickPick are multiple bets;
export const calculateMarkSixBetNum = (betObj: MarkSixBetObject): number => {
    let total = 0;
    const maximum = 49,
        minimum = 6;
    switch (betObj.type) {
        case MK6_TYPE.MK6_SINGLE:
        case MK6_TYPE.MK6_COMPUTER_RANDOM_SINGLES:
            total = 1;
            break;
        case MK6_TYPE.MK6_BANKER:
        case MK6_TYPE.MK6_COMPUTER_RANDOM_BANKER:
            const bankerLength = betObj.bankers.selections.length;
            const selectionsLength = betObj.isField
                ? maximum - bankerLength
                : betObj.selections[0].selections.length;
            total = C(selectionsLength, minimum - bankerLength);
            break;
        case MK6_TYPE.MK6_MULTIPLE:
        case MK6_TYPE.MK6_COMPUTER_RANDOM_MULTIPLE:
            const length = betObj.isField
                ? maximum
                : betObj.selections[0].selections.length;
            total = C(length, length - minimum);
            break;
        case MK6_TYPE.MK6_4_SINGLES:
            total = betObj.numOfEntries;
            break;
        case MK6_TYPE.MK6_RANDOM_SINGLES:
            total = 2;
            break;
        case MK6_TYPE.MK6_RANDOM_MULTIPLE:
            const len = betObj.qpNumOfSeln;
            total = C(len, len - minimum);
            break;
    }
    return Math.round(total * betObj.numOfDraws);
};
