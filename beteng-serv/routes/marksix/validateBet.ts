import {
    ResponseObject,
    ResponseObjectCode,
    SUCCESS_RESPONSE,
    ERROR_MSG,
} from '../../../share/models/response-common';
import { MarkSixBetObject } from '../../../share/models/comm-serv/MarSix/MarkSixBetObject';
import { MK6_TYPE } from '../../../share/models/comm-serv/MarSix/Enums';
import { validateBetLine } from './validateBetEntry';

const validateType = (type: MK6_TYPE, resObj: ResponseObject): boolean => {
    let retval = true;

    if (type === MK6_TYPE.UNDEFINED_TYPE) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_SVT_PMT_NO_MK6_TYPE;
        // resObj.message = `MK6 type is undefined`;
        retval = false;
    }

    return retval;
};

const validateDraws = (
    draws: number,
    isSnowBall: boolean,
    resObj: ResponseObject
): boolean => {
    let retval = true;
    const dd: number[] = [1, 5, 10, 20, 30];

    if (isSnowBall) {
        if (draws !== 1) {
            resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
            // resObj.message = `Invalid number of draws.`;
            resObj.message = ERROR_MSG.RID_SYS_ERR_SB_NO_MULT_DRAW;
            retval = false;
        }
    } else {
        // if (!dd.includes(draws)) {
        //     resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        //     resObj.message = `Invalid number of draws.`;
        //     retval = false;
        // }

        if (!((draws >= 5 && draws <= 30) || draws === 1)) {
            resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
            // resObj.message = `Invalid number of draws.`;
            resObj.message = ERROR_MSG.RID_SCMP_ESC_NO_MULTI_DRAW;
            retval = false;
        }
    }

    return retval;
};

const validateUnitbet = (
    isPui: boolean,
    unitBet: number,
    resObj: ResponseObject
): boolean => {
    const retval = true;

    // if (isPui) {
    //     if (unitBet !== 5) {
    //         resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
    //         resObj.message = `Invalid Unit bet, the unit bet should be 5 for partial bet.`;
    //         retval = false;
    //     }
    // } else {
    //     if (unitBet !== 10) {
    //         resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
    //         resObj.message = `Invalid Unit bet, the unit bet should be 10.`;
    //         retval = false;
    //     }
    // }

    return retval;
};

export const validateBet = (req, res, next) => {
    const resObj: ResponseObject = Object.assign({}, SUCCESS_RESPONSE);
    const betObj: MarkSixBetObject = req.markSixBetObject;

    if (
        !validateType(betObj.type, resObj) ||
        !validateDraws(betObj.numOfDraws, betObj.isSnowBall, resObj) ||
        !validateUnitbet(betObj.isPui, betObj.unitBet, resObj) ||
        !validateBetLine(betObj, resObj)
    ) {
        res.send(200, resObj);
        return;
    }

    next();
};
