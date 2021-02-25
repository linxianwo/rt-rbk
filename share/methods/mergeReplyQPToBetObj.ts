import { MarkSixBetObject } from '../models/comm-serv/MarSix/MarkSixBetObject';
import { RacingBetObject } from '../models/comm-serv/Racing/RacingBetObject';
import { MSG_MarkSix_REPLY, MSG_BET_REPLY } from '../models/comm-serv/Messages';
import { logger } from '../utils/logs';
import { PoolSymbol } from '../models/comm-serv/Racing/PoolType';
import { Entry } from '../models/comm-serv/Entry';
import {
    ERROR_MSG,
    ResponseObject,
    SUCCESS_RESPONSE,
    ResponseObjectCode,
} from '../models/response-common';

const QPTT = PoolSymbol.QPTT;
const QPQTT = PoolSymbol.QPQTT;
const MAX_QPTT_SELECTION = 29;
const MAX_QPQTT_SELECTION = 6;
const BET_FIELD = 0;

const checkDuplicateEntry = (reply: MSG_MarkSix_REPLY): boolean => {
    let status = false;
    let entrys: Entry[] = reply.selections;
    for (let i = 0; i < entrys.length; i++) {
        for (let j = i + 1; j < entrys.length; j++) {
            if (
                entrys[i].selections.join(',') ===
                entrys[j].selections.join(',')
            ) {
                status = true;
            }
        }
    }
    return status;
};

/**
 *
 * @param {*} betObj  betObj
 * @param {*} reply  reply from commserv contains selection data
 * @returns {boolean}
 */
export const mergeReplyQPToBetObjForRacing = (
    betObj: RacingBetObject,
    reply: MSG_BET_REPLY
): ResponseObject => {
    const resObj: ResponseObject = Object.assign({}, SUCCESS_RESPONSE);

    if (betObj.PoolType === QPTT || betObj.PoolType === QPQTT) {
        let selnCnt = 0,
            nMax =
                betObj.PoolType === QPTT
                    ? MAX_QPTT_SELECTION
                    : MAX_QPQTT_SELECTION;
        while (selnCnt < nMax && selnCnt < reply.seln.length) {
            selnCnt++;
        }
        let m_currentLeg = 0;
        for (let i = 0; i < selnCnt; i++) {
            if (reply.seln[i] === '/'.charCodeAt(0)) {
                m_currentLeg++;
            } else if (reply.seln[i] === '>'.charCodeAt(0)) {
                betObj.Legs[m_currentLeg].Bankers =
                    betObj.Legs[m_currentLeg].Selections;
                betObj.Legs[m_currentLeg].Selections = [];
            } else if (reply.seln[i] === '|'.charCodeAt(0)) {
                // use 4th, 5th & 6th leg to be those 3 legs of 2nd entry
                m_currentLeg++;
            } else {
                if (reply.seln[i] === '('.charCodeAt(0)) {
                    break;
                }
                let sel = reply.seln[i] & 0x3f;
                if (sel === BET_FIELD) {
                    if (betObj.Legs[m_currentLeg].Selections.length > 0) {
                        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                        resObj.message = ERROR_MSG.RID_EX_TKT_ILL_SELECTION;
                        return resObj;
                    }
                    betObj.Legs[m_currentLeg].IsFieldSelected = true;
                } else {
                    if (betObj.Legs[m_currentLeg].IsFieldSelected) {
                        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                        resObj.message = ERROR_MSG.RID_EX_TKT_ILL_SELECTION;
                        return resObj;
                    } else {
                        if (betObj.Legs[m_currentLeg].Selections.length > 0) {
                            if (
                                betObj.Legs[m_currentLeg].Selections.includes(
                                    sel
                                )
                            ) {
                                resObj.code =
                                    ResponseObjectCode.ERROR_CODE_NORMAL;
                                resObj.message =
                                    ERROR_MSG.RID_EX_BE_DUP_SELECTION;
                                return resObj;
                            } else {
                                betObj.Legs[m_currentLeg].Selections.push(sel);
                            }
                        } else {
                            betObj.Legs[m_currentLeg].Selections.push(sel);
                        }
                    }
                }

                // betObj.setSelections((int)reply.seln[i]& 0X3f);
            }
        }
        // sort selections
        for (let leg of betObj.Legs) {
            leg.Selections.sort((a, b) => {
                return a - b;
            });
        }
    }

    return resObj;
};

/**
 *
 * @param {*} betObj  betObj
 * @param {*} reply  reply from commserv contains selection data
 * @returns {boolean}
 */
export const mergeReplyQPToBetObjForMK6 = (
    betObj: MarkSixBetObject,
    reply: MSG_MarkSix_REPLY
): ResponseObject => {
    const resObj: ResponseObject = Object.assign({}, SUCCESS_RESPONSE);
    if (checkDuplicateEntry(reply)) {
        resObj.code = ResponseObjectCode.ERROR_SEVERE;
        resObj.message = ERROR_MSG.RID_SVT_TAKE_ESC_CONTACT_STAFF;
        logger.error('marksix reply from backend have same entry!');
        return resObj;
    } else {
        betObj.selections = reply.selections;
    }
    // sort selections
    for (let selection of betObj.selections) {
        selection.selections.sort((a, b) => {
            return a - b;
        });
    }

    return resObj;
};
