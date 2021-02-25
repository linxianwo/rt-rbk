import { logger } from '../../../share/utils/logs';
import { MarkSixBetObject } from '../../../share/models/comm-serv/MarSix/MarkSixBetObject';
import { MK6_TYPE } from '../../../share/models/comm-serv/MarSix/Enums';
import { Entry } from '../../../share/models/comm-serv/Entry';
import { MarkSixBetEntryCriteria } from '../../../share/models/beteng-serv/marksix/MarkSixCriteria';
import {
    ResponseObject,
    ResponseObjectCode,
    ERROR_MSG,
} from '../../../share/models/response-common';

const RemoveDuplicates = (xxx: Array<any>): Array<any> => {
    return Array.from(new Set(xxx));
};

const CheckNumbers = (selection: number[], resObj: ResponseObject): boolean => {
    let retval = true;

    for (let i = 0; i < selection.length; i++) {
        if (selection[i] < 1 || selection[i] > 49) {
            resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
            // resObj.message = `The numbers should be from 1 to 49.`;
            resObj.message = ERROR_MSG.RID_EX_TKT_MK6_ILL_SELECTION;
            retval = false;
            break;
        }
    }

    return retval;
};

const validateSingle = (
    banker: Entry,
    selection: Entry[],
    resObj: ResponseObject
): boolean => {
    let retval = false;
    const minSelectionNum = MarkSixBetEntryCriteria['single'].selectionNum;

    if (!minSelectionNum) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
        logger.error(
            'The parameters for option "MarkSix single" is not defined in Server MarkSixBetEntryCriteria.'
        );
        return retval;
    }

    if (banker.selections.length !== 0) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        // resObj.message = `Invalid choice, the banker should be empty for Single`;
        resObj.message = ERROR_MSG.RID_EX_TKT_ILL_BANKER;
        return retval;
    }

    if (selection.length > 1) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        // resObj.message = `Invalid choice, the selection should be only one entry for Single`;
        resObj.message = ERROR_MSG.RID_EX_TKT_MK6_TOO_MANY_SELN;
        return retval;
    } else if (selection.length < 1) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_EX_TKT_MK6_INS_SELECTION;
        return retval;
    }

    const x: number[] = selection[0].selections;

    if (x.length < minSelectionNum) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_EX_TKT_MK6_INS_SELECTION;
        return retval;
    }

    if (x.length > minSelectionNum) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_EX_TKT_MK6_TOO_MANY_SELN;
        return retval;
    }

    const xx = RemoveDuplicates(x);

    if (xx.length !== x.length) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_EX_TKT_LOTTERY_DUP_SELECTION;
        return retval;
    }

    retval = CheckNumbers(x, resObj);

    return retval;
};

const validateSingle4 = (
    banker: Entry,
    selection: Entry[],
    resObj: ResponseObject
): boolean => {
    const retval = false;
    const minSelectionNum = MarkSixBetEntryCriteria['single'].selectionNum;

    if (!minSelectionNum) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
        logger.error(
            'The parameters for option "MarkSix single" is not defined in Server MarkSixBetEntryCriteria.'
        );
        return retval;
    }

    if (banker.selections.length !== 0) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_EX_TKT_ILL_BANKER;
        // resObj.message = `Invalid choice, the banker should be empty for Single`;
        return retval;
    }

    if (selection.length > 4) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_EX_TKT_MK6_TOO_MANY_SELN;
        // resObj.message = `Invalid choice, the selection should have four entries for Single4`;
        return retval;
    } else if (selection.length < 1) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_EX_TKT_MK6_INS_SELECTION;
        return retval;
    }

    let x: number[];
    for (let i = 0; i < selection.length; i++) {
        x = selection[i].selections;

        if (x.length < minSelectionNum) {
            resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
            resObj.message = ERROR_MSG.RID_EX_TKT_MK6_INS_SELECTION;
            return retval;
        }

        if (x.length > minSelectionNum) {
            resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
            resObj.message = ERROR_MSG.RID_EX_TKT_MK6_TOO_MANY_SELN;
            return retval;
        }

        const xx = RemoveDuplicates(x);

        if (xx.length !== x.length) {
            resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
            resObj.message = ERROR_MSG.RID_EX_TKT_LOTTERY_DUP_SELECTION;
            return retval;
        }

        if (!CheckNumbers(x, resObj)) {
            return retval;
        }
    }
    return true;
};

const validateMultiple = (
    banker: Entry,
    selection: Entry[],
    isField: boolean,
    resObj: ResponseObject
): boolean => {
    let retval = false;
    const minSelectionNum = MarkSixBetEntryCriteria['multiple'].minSelectionNum;
    const maxSelectionNum = MarkSixBetEntryCriteria['multiple'].maxSelectionNum;

    if (!minSelectionNum || !maxSelectionNum) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
        logger.error(
            'The parameters for option "MarkSix multiple" is not defined in Server MarkSixBetEntryCriteria.'
        );
        return retval;
    }

    if (banker.selections.length !== 0) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_EX_TKT_ILL_BANKER;
        // resObj.message = `Invalid choice, the banker should be empty for Multiple`;
        return retval;
    }

    if (selection.length > 1) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_EX_TKT_MK6_TOO_MANY_SELN;
        return retval;
    } else if (selection.length < 1) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_EX_TKT_MK6_INS_SELECTION;
        return retval;
    }

    const x: number[] = selection[0].selections;
    if (!isField) {
        if (x.length < minSelectionNum) {
            resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
            resObj.message = ERROR_MSG.RID_EX_TKT_MK6_INS_SELECTION;
            return retval;
        }

        if (x.length > maxSelectionNum) {
            resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
            resObj.message = ERROR_MSG.RID_EX_TKT_MK6_TOO_MANY_SELN;
            return retval;
        }

        const xx = RemoveDuplicates(x);

        if (xx.length !== x.length) {
            resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
            resObj.message = ERROR_MSG.RID_EX_TKT_LOTTERY_DUP_SELECTION;
            return retval;
        }
    } else {
        if (selection[0].selections.length !== 0) {
            resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
            resObj.message = ERROR_MSG.RID_EX_TKT_MK6_ILL_SELECTION;
            // resObj.message = `Invalid choice, the selection should be empty when full field is selected.`;
            return retval;
        }
    }
    retval = CheckNumbers(x, resObj);

    return retval;
};

const validateBanker = (
    banker: Entry,
    selection: Entry[],
    isField: boolean,
    resObj: ResponseObject
): boolean => {
    let retval = false;
    const minBankerNum = MarkSixBetEntryCriteria['banker'].minBankerNum;
    const maxBankerNum = MarkSixBetEntryCriteria['banker'].maxBankerNum;
    const minLegNum = MarkSixBetEntryCriteria['banker'].minLegNum;
    const minSelectionNum = MarkSixBetEntryCriteria['banker'].minSelectionNum;

    if (!minBankerNum || !maxBankerNum || !minLegNum || !minSelectionNum) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
        logger.error(
            `The parameters for option "Banker Entry" is not defined in Server MarkSixBetEntryCriteria.`
        );
        return retval;
    }

    const b: number[] = banker.selections;

    if (b.length < minBankerNum) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_EX_TKT_INSUF_BANKER;
        return retval;
    }

    if (b.length > maxBankerNum) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_EX_TKT_TOO_MANY_BANKER;
        return retval;
    }

    const bb = RemoveDuplicates(b);

    if (bb.length !== b.length) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_EX_TKT_LOTTERY_DUP_SELECTION;
        return retval;
    }

    if (!isField) {
        if (selection.length > 1) {
            resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
            resObj.message = ERROR_MSG.RID_EX_TKT_MK6_TOO_MANY_SELN;
            return retval;
        } else if (selection.length < 1) {
            resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
            resObj.message = ERROR_MSG.RID_EX_TKT_MK6_INS_SELECTION;
            return retval;
        }

        const x: number[] = selection[0].selections;

        if (x.length < minLegNum) {
            resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
            resObj.message = ERROR_MSG.RID_EX_TKT_MK6_INS_SELECTION;
            return retval;
        }

        if (x.length < minSelectionNum - b.length) {
            resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
            resObj.message = ERROR_MSG.RID_EX_TKT_MK6_INS_SELECTION;
            return retval;
        }

        const maxLegNum: number = 49 - b.length;

        if (x.length > maxLegNum) {
            resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
            resObj.message = ERROR_MSG.RID_EX_TKT_MK6_TOO_MANY_SELN;
            return retval;
        }

        const xx = RemoveDuplicates(x);

        if (xx.length !== x.length) {
            resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
            resObj.message = ERROR_MSG.RID_EX_TKT_LOTTERY_DUP_SELECTION;
            return retval;
        }

        const bx: number[] = b.concat(x);
        const bxbx = RemoveDuplicates(bx);

        if (bx.length !== bxbx.length) {
            resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
            resObj.message = ERROR_MSG.RID_EX_TKT_LOTTERY_DUP_SELECTION;
            return retval;
        }

        retval = CheckNumbers(bx, resObj);
    } else {
        if (selection[0].selections.length !== 0) {
            resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
            resObj.message = ERROR_MSG.RID_EX_TKT_MK6_ILL_SELECTION;
            // resObj.message = `Invalid choice, the selection should be empty when full field is selected.`;
            return retval;
        }

        retval = CheckNumbers(b, resObj);
    }

    return retval;
};

// const validateComputerRandomSingle = (
//     numOfEntries: number,
//     selection: Entry[],
//     resObj: ResponseObject
// ): boolean => {
//     let a: string;
//     let b: string;
//     let retval = true;

//     for (let i = 0; i < numOfEntries - 1; i++) {
//         for (let j = i + 1; j < numOfEntries; j++) {
//             a = selection[i].selections.join('+');
//             b = selection[j].selections.join('+');
//             if (a === b) {
//                 resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
//                 resObj.message = ERROR_MSG.RID_EX_BE_DUPLICATED_ENTRIES_SVT;
//                 retval = false;
//                 break;
//             }
//         }
//         if (!retval) {
//             break;
//         }
//     }

//     return retval;
// };

const validateComputerRandomSingle = (
    banker: Entry,
    selection: Entry[],
    resObj: ResponseObject
): boolean => {
    let retval = false;
    const minSelectionNum =
        MarkSixBetEntryCriteria['randomcomputersingle'].selectionNum;

    if (!minSelectionNum) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
        logger.error(
            'The parameters for option "MarkSix Computer Random Single" is not defined in Server MarkSixBetEntryCriteria.'
        );
        return retval;
    }
    if (banker.selections.length !== 0) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_EX_TKT_ILL_BANKER;
        return retval;
    }

    if (selection.length > 1) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_EX_TKT_MK6_TOO_MANY_SELN;
        return retval;
    } else if (selection.length < 1) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_EX_TKT_MK6_INS_SELECTION;
        return retval;
    }

    const x: number[] = selection[0].selections;

    if (x.length < minSelectionNum) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_EX_TKT_MK6_INS_SELECTION;
        return retval;
    }

    if (x.length > minSelectionNum) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_EX_TKT_MK6_TOO_MANY_SELN;
        return retval;
    }

    const xx = RemoveDuplicates(x);

    if (xx.length !== x.length) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_EX_TKT_LOTTERY_DUP_SELECTION;
        return retval;
    }

    retval = CheckNumbers(x, resObj);

    return retval;
};

const validateComputerRandomMultiple = (
    qpNumOfSeln: number,
    banker: Entry,
    selection: Entry[],
    resObj: ResponseObject
): boolean => {
    let retval = false;

    const minQpNum = MarkSixBetEntryCriteria['randomcomputermultiple'].minQpNum;
    const maxQpNum = MarkSixBetEntryCriteria['randomcomputermultiple'].maxQpNum;

    if (!minQpNum || !maxQpNum) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
        logger.error(
            'The parameters for option "Computer Random Multiple Entry" is not defined in Server MarkSixBetEntryCriteria.'
        );
        return retval;
    }

    if (qpNumOfSeln < minQpNum) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_EX_TKT_MK6_INS_SELECTION;
        // resObj.message = `Invalid Number of Selections`;
        return retval;
    }

    if (qpNumOfSeln > maxQpNum) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_EX_TKT_MK6_TOO_MANY_SELN;
        // resObj.message = `Invalid Number of Selections`;
        return retval;
    }

    if (banker.selections.length !== 0) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_EX_TKT_ILL_BANKER;
        return retval;
    }

    if (selection.length > 1) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_EX_TKT_MK6_TOO_MANY_SELN;
        return retval;
    } else if (selection.length < 1) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_EX_TKT_MK6_INS_SELECTION;
        return retval;
    }

    const x: number[] = selection[0].selections;

    if (x.length !== qpNumOfSeln) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_EX_TKT_MK6_ILL_SELECTION;
        // resObj.message = 'Number of Selections Does Not match';
        return retval;
    }

    const xx = RemoveDuplicates(x);

    if (xx.length !== x.length) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_EX_TKT_LOTTERY_DUP_SELECTION;
        return retval;
    }

    retval = CheckNumbers(x, resObj);

    return retval;
};

const validateRandomSingle = (
    qpNumOfSeln: number,
    resObj: ResponseObject
): boolean => {
    let retval = false;

    const qpNum = MarkSixBetEntryCriteria['randomsingle'].qpNum;
    if (!qpNum) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
        logger.error(
            'The parameters for option "Random Single Entry" is not defined in Server MarkSixBetEntryCriteria.'
        );
        return retval;
    }

    if (qpNumOfSeln !== qpNum) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_EX_TKT_MK6_ILL_SELECTION;
        // resObj.message = `Invalid Number of Selections`;
        return retval;
    }

    retval = true;
    return retval;
};

const validateRandomMultiple = (
    qpNumOfSeln: number,
    resObj: ResponseObject
): boolean => {
    let retval = false;

    const minQpNum = MarkSixBetEntryCriteria['randommultiple'].minQpNum;
    const maxQpNum = MarkSixBetEntryCriteria['randommultiple'].maxQpNum;

    if (!minQpNum || !maxQpNum) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
        logger.error(
            'The parameters for option "Random Multiple Entry" is not defined in Server MarkSixBetEntryCriteria.'
        );
        return retval;
    }

    if (qpNumOfSeln < minQpNum) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_EX_TKT_MK6_INS_SELECTION;
        // resObj.message = `Invalid Number of Selections`;
        return retval;
    }

    if (qpNumOfSeln > maxQpNum) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_EX_TKT_MK6_TOO_MANY_SELN;
        // resObj.message = `Invalid Number of Selections`;
        return retval;
    }

    retval = true;

    return retval;
};

const validateComputerRandomBanker = (
    banker: Entry,
    selection: Entry[],
    isField: boolean,
    resObj: ResponseObject
): boolean => {
    let retval = false;
    const minBankerNum =
        MarkSixBetEntryCriteria['randomcomputerbanker'].minBankerNum;
    const maxBankerNum =
        MarkSixBetEntryCriteria['randomcomputerbanker'].maxBankerNum;
    const minLegNum = MarkSixBetEntryCriteria['randomcomputerbanker'].minLegNum;
    const minSelectionNum =
        MarkSixBetEntryCriteria['randomcomputerbanker'].minSelectionNum;

    if (!minBankerNum || !maxBankerNum || !minLegNum || !minSelectionNum) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
        logger.error(
            'The parameters for option "Computer Random Banker Entry" is not defined in Server MarkSixBetEntryCriteria.'
        );
        return retval;
    }

    const b: number[] = banker.selections;

    if (b.length < minBankerNum) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_EX_TKT_INSUF_BANKER;
        return retval;
    }

    if (b.length > maxBankerNum) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_EX_TKT_TOO_MANY_BANKER;
        return retval;
    }

    const bb = RemoveDuplicates(b);

    if (bb.length !== b.length) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_EX_TKT_LOTTERY_DUP_SELECTION;
        return retval;
    }

    if (isField) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_SCMP_ERR_ILLEGAL_FIELD;
        // resObj.message = `Full betting is not supported for Banker of Quick pick`;
        return retval;
    }

    if (!isField) {
        if (selection.length > 1) {
            resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
            resObj.message = ERROR_MSG.RID_EX_TKT_MK6_TOO_MANY_SELN;
            return retval;
        } else if (selection.length < 1) {
            resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
            resObj.message = ERROR_MSG.RID_EX_TKT_MK6_INS_SELECTION;
            return retval;
        }

        const x: number[] = selection[0].selections;

        if (x.length < minLegNum) {
            resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
            resObj.message = ERROR_MSG.RID_EX_TKT_MK6_INS_SELECTION;
            return retval;
        }

        if (x.length < minSelectionNum - b.length) {
            resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
            resObj.message = ERROR_MSG.RID_EX_TKT_MK6_INS_SELECTION;
            return retval;
        }

        const maxLegNum: number = 49 - b.length;

        if (x.length > maxLegNum) {
            resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
            resObj.message = ERROR_MSG.RID_EX_TKT_MK6_TOO_MANY_SELN;
            return retval;
        }

        const xx = RemoveDuplicates(x);

        if (xx.length !== x.length) {
            resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
            resObj.message = ERROR_MSG.RID_EX_TKT_LOTTERY_DUP_SELECTION;
            return retval;
        }

        const bx: number[] = b.concat(x);
        const bxbx = RemoveDuplicates(bx);

        if (bx.length !== bxbx.length) {
            resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
            resObj.message = ERROR_MSG.RID_EX_TKT_LOTTERY_DUP_SELECTION;
            return retval;
        }

        retval = CheckNumbers(bx, resObj);
    } else {
        retval = CheckNumbers(b, resObj);
    }

    return retval;
};

export const validateBetLine = (
    betInfo: MarkSixBetObject,
    resObj: ResponseObject
): boolean => {
    let retval = true;
    const type: MK6_TYPE = betInfo.type;
    const banker: Entry = betInfo.bankers;
    const selection: Entry[] = betInfo.selections;
    const numOfEntries: number = betInfo.numOfEntries;
    const qpNumOfSeln: number = betInfo.qpNumOfSeln;
    switch (type) {
        case MK6_TYPE.MK6_SINGLE:
            retval = validateSingle(banker, selection, resObj);
            break;
        case MK6_TYPE.MK6_4_SINGLES:
            retval = validateSingle4(banker, selection, resObj);
            break;
        case MK6_TYPE.MK6_MULTIPLE:
            retval = validateMultiple(
                banker,
                selection,
                betInfo.isField,
                resObj
            );
            break;
        case MK6_TYPE.MK6_BANKER:
            retval = validateBanker(banker, selection, betInfo.isField, resObj);
            break;
        case MK6_TYPE.MK6_RANDOM_SINGLES:
            retval = validateRandomSingle(qpNumOfSeln, resObj);
            break;
        case MK6_TYPE.MK6_RANDOM_MULTIPLE:
            retval = validateRandomMultiple(qpNumOfSeln, resObj);
            break;
        case MK6_TYPE.MK6_COMPUTER_RANDOM_SINGLES:
            retval = validateComputerRandomSingle(banker, selection, resObj);
            break;
        case MK6_TYPE.MK6_COMPUTER_RANDOM_MULTIPLE:
            retval = validateComputerRandomMultiple(
                qpNumOfSeln,
                banker,
                selection,
                resObj
            );
            break;
        case MK6_TYPE.MK6_COMPUTER_RANDOM_BANKER:
            retval = validateComputerRandomBanker(
                banker,
                selection,
                betInfo.isField,
                resObj
            );
            break;
    }

    return retval;
};

// export const validateBetLines = (betLines: MarkSixBetLine[], resObj: ResponseObject):boolean => {

//     let retval = true;

//     if (betLines.length === 0) {
//         resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
//         resObj.message = ERROR_MSG.RID_TKT_NO_MARK_ENTRY;

//     } else {
//         for (let i = 0; i < betLines.length; i++) {
//             retval = validateBetLine(betLines[i], resObj);
//             if (!retval) { break; }
//         }
//     }
//     return retval;

// };
