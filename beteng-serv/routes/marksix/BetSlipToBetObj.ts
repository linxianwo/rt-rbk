import { TICKET_DETAIL } from '../../../share/models/beteng-serv/ticketdetail';
import { ERROR_ID } from '../../../share/models/errorMessage';
import {
    getErrorKeyFromErrorCode,
    ERROR_MSG,
    ResponseObject,
    ResponseObjectCode,
    SUCCESS_RESPONSE,
} from '../../../share/models/response-common';
import { MarkSixBetObject } from '../../../share/models/comm-serv/MarSix/MarkSixBetObject';
import {
    MK6_TYPE,
    MK6_ENTRY_INDEX,
} from '../../../share/models/comm-serv/MarSix/Enums';
import { Entry } from '../../../share/models/comm-serv/Entry';

// lottery
const TKT_MUL_DRAW_M6R = 60; /* MK6 multi draw random generated */
const TKT_MK649_SHORT = 61; /* mk6 49 numbers long mult/banker ticket */
const TKT_MK649_LONG = 62; /* mk6 49 numbers long single ticket */
const TKT_MK6_GAMES = 63; /* mk6 matching game ticket */
const TKT_MK6_ODD_EVEN = 64; /* long allup test ticket */
const TKT_GB_M6M = 65; /* single/multiple/banker Gold Ball */
const TKT_GB_M6R = 66; /* Random single/multiple Gold Ball */
const TKT_GB_ODD_EVEN = 67; /* Gold Ball odd even ticket */
const TKT_GB_GAMES = 68; /* Gold ball matching game ticket */
const TKT_MK6_SB_QP = 69; /* mk6 snowball random generated */
const TKT_MK6_SB = 70; /* mk6 snowball multiple/banker */
const TKT_MK6_SB_LONG = 71; /* mk6 snowball single */
const TKT_MK6_PUI_QP = 72; /* mk6 PUI random generated */
const TKT_MK6_PUI = 73; /* mk6 PUI multiple/banker */
const TKT_MK6_PUI_LONG = 74; /* mk6 PUI single */

const NON_MB = '0';
const SINGLE = '1';
const BANKER = '2';
const MULTIPLE = '3';
const BANK_MULT = '4';
const MULT_BANK = '5';

const SINGLE_DRAW = 'A'; /* M6 SINGLE DRAW */
const TEN_DRAW = 'J'; /* mk6 ten draw */

const FALSE = 0;
const TRUE = 1;
const NULL = 0;

const MAX_MARK6_SELN = 49;
const MAX_MARK6_10ENTRIES_SELN = 69; // star feng 20160302 MK6 Support 10 entries
const ENDBOX = 0; /* END OF BOX TO READ */
const MARK = '1'; /* box is marked */
const NOTMARK = '0'; /* box is empty */

const MIN_MARK6_SELN = 6;
const MAX_MARK6_BANKER = 5;
const MIN_MARK6_BANKER = 1;
const MAX_MARK6_MULTI_SELN = 25;
const MIN_MARK6_MULTI_SELN = 7;

// export const betSlipToTicketDetail = (req, res, next) => {
//     const resObj: ResponseObject = Object.assign({}, SUCCESS_RESPONSE);
//     const betSlip: Slip = req.betSlip;
//     const ttstWrapper = new TTSTWrapper();
//     const ticketDetail = new TICKET_DETAIL();
//     const error_status = ttstWrapper.CTSTvalidate(
//         false,
//         true,
//         false,
//         parseInt(
//             betSlip.slipID
//                 .slice()
//                 .reverse()
//                 .join(''),
//             2
//         ),
//         1,
//         '0' + betSlip.slipData.join(''),
//         ticketDetail
//     );
//     if (error_status === ERROR_ID.RID_NO_ERROR) {
//         req.ticketDetail = ticketDetail;
//         next();
//     } else {
//         resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
//         resObj.message = ERROR_MSG[getErrorKeyFromErrorCode(error_status)];
//         res.status(200).send(resObj);
//         return;
//     }
// };

const init = (betObj: MarkSixBetObject) => {
    betObj.isField = false;
    betObj.type = MK6_TYPE.UNDEFINED_TYPE;
    betObj.numOfDraws = 1;
    betObj.numOfEntries = 1;
    betObj.qpNumOfSeln = 0;
    betObj.lotteryType = 0;
    betObj.gmType = 0;
    betObj.drawYr = 0;
    betObj.drawId = '';
    betObj.isSnowBall = false;
    betObj.isPui = false;
    betObj.unitBet = 1000;
};

const setSelection = (
    td: TICKET_DETAIL,
    betObj: MarkSixBetObject,
    status: any
): boolean => {
    let retVal = true;
    let offset = 0;
    let seln: string = NOTMARK;
    let i = 1;
    let cnt = 0;
    let entryIndex = 0;

    // RHO added for new MK6 CC games
    switch (betObj.gmType) {
        case 0: // Normal MK6 Games
            switch (betObj.type) {
                case MK6_TYPE.MK6_SINGLE:
                    offset = MAX_MARK6_SELN;
                    //  check field first
                    if (td.selection[offset + 1] === MARK) {
                        status.s = ERROR_ID.RID_EX_TKT_MK6_ILL_SELECTION;
                        retVal = false;
                    } else {
                        seln = td.selection[i];
                        while (seln && i <= MAX_MARK6_SELN) {
                            if (seln === MARK) {
                                betObj.selections[0].selections.push(i);
                            }
                            i++;
                            seln = td.selection[i];
                        }

                        cnt = betObj.selections[0].selections.length;

                        if (cnt !== MIN_MARK6_SELN) {
                            retVal = false;
                            if (cnt > MIN_MARK6_SELN) {
                                status.s =
                                    ERROR_ID.RID_EX_TKT_MK6_TOO_MANY_SELN;
                            } else if (cnt < MIN_MARK6_SELN) {
                                status.s =
                                    ERROR_ID.RID_EX_TKT_MK6_INS_SELECTION;
                            }
                        }
                    }
                    break; // break MK6_SINGLE

                case MK6_TYPE.MK6_BANKER:
                    offset = MAX_MARK6_SELN;
                    seln = td.selection[i];
                    while (seln && i <= MAX_MARK6_SELN) {
                        if (seln === MARK) {
                            betObj.bankers.selections.push(i);
                        }
                        i++;
                        seln = td.selection[i];
                    }

                    cnt = betObj.bankers.selections.length;

                    if (cnt <= 0) {
                        retVal = false;
                        status.s = ERROR_ID.RID_EX_TKT_INSUF_BANKER;
                    }

                    if (cnt > MAX_MARK6_BANKER) {
                        retVal = false;
                        status.s = ERROR_ID.RID_EX_TKT_TOO_MANY_BANKER;
                    }

                    if (retVal) {
                        i = 1;
                        if (td.selection[2 * offset + 1] === MARK) {
                            betObj.isField = true;
                        } else {
                            seln = td.selection[i + offset];
                            while (seln && i <= MAX_MARK6_SELN) {
                                if (seln === MARK) {
                                    betObj.selections[0].selections.push(i);
                                }
                                i++;
                                seln = td.selection[i + offset];
                            }
                            cnt = betObj.selections[0].selections.length;
                            if (cnt <= 0) {
                                retVal = false;
                                status.s =
                                    ERROR_ID.RID_EX_TKT_MK6_INS_SELECTION;
                            }
                        }
                    }

                    break; // break MK6_BANKER

                case MK6_TYPE.MK6_MULTIPLE:
                    offset = MAX_MARK6_SELN;
                    //  check field first
                    if (td.selection[offset + 1] === MARK) {
                        betObj.isField = true; // ?? multiple field
                    } else {
                        seln = td.selection[i];
                        while (seln && i <= MAX_MARK6_SELN) {
                            if (seln === MARK) {
                                betObj.selections[0].selections.push(i);
                            }
                            i++;
                            seln = td.selection[i];
                        }
                        cnt = betObj.selections[0].selections.length;
                        if (cnt <= MIN_MARK6_SELN) {
                            status.s = ERROR_ID.RID_EX_TKT_MK6_INS_SELECTION;
                            retVal = false;
                        }
                    }
                    break; // MK6_MULTIPLE

                case MK6_TYPE.MK6_4_SINGLES:
                    offset = MAX_MARK6_SELN;
                    seln = td.selection[i];

                    while (seln) {
                        let nTmp = 0;

                        if (seln === MARK) {
                            //  check for next entry
                            if (
                                cnt >= MIN_MARK6_SELN &&
                                cnt % MIN_MARK6_SELN === 0
                            ) {
                                nTmp = Math.floor(cnt / MIN_MARK6_SELN); //  to locate the exixting entry
                                if (
                                    (nTmp === 1 &&
                                        entryIndex !==
                                            MK6_ENTRY_INDEX.FIRST_ENTRY) ||
                                    (nTmp === 2 &&
                                        entryIndex !==
                                            MK6_ENTRY_INDEX.SECOND_ENTRY) ||
                                    (nTmp === 3 &&
                                        entryIndex !==
                                            MK6_ENTRY_INDEX.THIRD_ENTRY)
                                ) {
                                    status.s =
                                        ERROR_ID.RID_EX_TKT_MK6_ILL_SELECTION;
                                    retVal = false;
                                    break;
                                } else if (
                                    Math.floor(cnt / MIN_MARK6_SELN) === 4
                                ) {
                                    status.s =
                                        ERROR_ID.RID_EX_TKT_MK6_TOO_MANY_SELN;
                                    retVal = false;
                                    break;
                                } else {
                                    entryIndex++;
                                    betObj.numOfEntries =
                                        betObj.numOfEntries + 1;
                                    betObj.selections.push(new Entry());
                                    nTmp = i - entryIndex * offset;
                                    if (nTmp <= 0) {
                                        status.s =
                                            ERROR_ID.RID_EX_TKT_MK6_TOO_MANY_SELN;
                                        retVal = false;
                                        break;
                                    }
                                }
                            } else {
                                nTmp = Math.floor((i - 1) / MAX_MARK6_SELN); //  to locate the exixting entry
                                if (
                                    (nTmp === MK6_ENTRY_INDEX.FIRST_ENTRY &&
                                        entryIndex !==
                                            MK6_ENTRY_INDEX.FIRST_ENTRY) ||
                                    (nTmp === MK6_ENTRY_INDEX.SECOND_ENTRY &&
                                        entryIndex !==
                                            MK6_ENTRY_INDEX.SECOND_ENTRY) ||
                                    (nTmp === MK6_ENTRY_INDEX.THIRD_ENTRY &&
                                        entryIndex !==
                                            MK6_ENTRY_INDEX.THIRD_ENTRY) ||
                                    (nTmp === MK6_ENTRY_INDEX.FORTH_ENTRY &&
                                        entryIndex !==
                                            MK6_ENTRY_INDEX.FORTH_ENTRY)
                                ) {
                                    status.s =
                                        ERROR_ID.RID_EX_TKT_MK6_INS_SELECTION;
                                    retVal = false;
                                    break;
                                }
                            }

                            betObj.selections[entryIndex].selections.push(
                                i - entryIndex * offset
                            );
                            ++cnt;
                        }
                        i++;
                        seln = td.selection[i];
                    }
                    break;

                case MK6_TYPE.MK6_RANDOM_SINGLES: //  by Jason Lau, 20100602, support Q310 MK6 requirement
                    betObj.qpNumOfSeln = MIN_MARK6_SELN;
                    break;

                case MK6_TYPE.MK6_RANDOM_MULTIPLE:
                    offset = MIN_MARK6_SELN;
                    seln = td.selection[i];
                    while (seln && i <= MAX_MARK6_MULTI_SELN - MIN_MARK6_SELN) {
                        if (seln === MARK) {
                            betObj.qpNumOfSeln = i + offset;
                        }
                        i++;
                        seln = td.selection[i];
                    }
                    break;

                default:
                    break;
            }

            break; // break GAME_NORMAL
    } // close switch m_gmType

    return retVal;
};

const setType = (td: TICKET_DETAIL, betObj: MarkSixBetObject): boolean => {
    let retVal = true;

    switch (td.ticket_id) {
        case TKT_MK649_SHORT:
            switch (td.mb_type) {
                case SINGLE:
                    betObj.type = MK6_TYPE.MK6_SINGLE;
                    break;
                case BANKER:
                    betObj.type = MK6_TYPE.MK6_BANKER;
                    break;
                case MULTIPLE:
                    betObj.type = MK6_TYPE.MK6_MULTIPLE;
                    break;
                default:
                    retVal = false;
            }
            betObj.lotteryType = 0;
            betObj.gmType = 0;
            break;

        case TKT_MK649_LONG:
            betObj.type = MK6_TYPE.MK6_4_SINGLES;
            betObj.lotteryType = 0;
            betObj.gmType = 0;
            break;
        case TKT_MUL_DRAW_M6R:
            if (td.mb_type === SINGLE) {
                betObj.type = MK6_TYPE.MK6_RANDOM_SINGLES;
            } else if (td.mb_type === MULTIPLE) {
                betObj.type = MK6_TYPE.MK6_RANDOM_MULTIPLE;
            }
            betObj.lotteryType = 0;
            betObj.gmType = 0;
            break;

        case TKT_MK6_PUI_QP:
        case TKT_MK6_SB_QP:
            if (td.mb_type === SINGLE) {
                betObj.type = MK6_TYPE.MK6_RANDOM_SINGLES; //  by Jason Lau, 20100602, support Q310 mk6 requirement
            } else if (td.mb_type === MULTIPLE) {
                betObj.type = MK6_TYPE.MK6_RANDOM_MULTIPLE;
            } else {
                retVal = false;
            }

            betObj.lotteryType = 0;
            betObj.gmType = 0;
            break;

        case TKT_MK6_PUI: //  by Jason Lau, 20100602, support Q310 mk6 requirement
        case TKT_MK6_SB:
            switch (td.mb_type) {
                case SINGLE:
                    betObj.type = MK6_TYPE.MK6_SINGLE;
                    break;
                case BANKER:
                    betObj.type = MK6_TYPE.MK6_BANKER;
                    break;
                case MULTIPLE:
                    betObj.type = MK6_TYPE.MK6_MULTIPLE;
                    break;
                default:
                    retVal = false;
            }

            betObj.lotteryType = 0;
            betObj.gmType = 0;
            break;

        case TKT_MK6_PUI_LONG:
        case TKT_MK6_SB_LONG:
            betObj.type = MK6_TYPE.MK6_4_SINGLES;
            // betObj.numOfEntries = 4;
            betObj.lotteryType = 0;
            betObj.gmType = 0;
            break;

        // RHO newly added MK6 CC Odd Even game for Q305
        case TKT_MK6_ODD_EVEN:
            break;

        // RHO newly added MK6 CC Matching Extra No. Ousider game for Q305
        case TKT_MK6_GAMES:
            break;
    }

    if (retVal && td.addon_flag) {
        //  by Jason Lau, 20100520
        //  Q310, support Partial Unit Investment
        if (
            td.ticket_id === TKT_MK6_PUI_QP ||
            td.ticket_id === TKT_MK6_PUI ||
            td.ticket_id === TKT_MK6_PUI_LONG
        ) {
            betObj.isPui = true;
        }
    }

    if (retVal && td.sb_flag === TRUE) {
        betObj.isSnowBall = true;
    }

    if (betObj.type === MK6_TYPE.MK6_RANDOM_SINGLES) {
        betObj.numOfEntries = 2;
    }

    return retVal;
};

const start = (
    td: TICKET_DETAIL,
    betObj: MarkSixBetObject,
    status: any
): boolean => {
    let retVal = true;
    init(betObj);

    //  all unit bet must be equals $5 in ticket
    // betObj.unitBet = 5 ; // ????? m_unitBet = 500L;

    //  set 4 member varaibles:
    //  m_single, m_multiple, m_random, m_numOfEntries & m_type
    //

    retVal = setType(td, betObj);

    // // RHO added to support MK6 CC games
    // if (bRet) {
    //     switch (betObj.lotteryType) {
    //         // RHO check which CC Game type in MK6 Class
    //         case 0:
    //             switch (betObj.gmType) {
    //                 // case GAME_ODD_EVEN:
    //                 //     break;  //break GAME_ODD_EVEN
    //                 // case GAME_OUTSIDER:
    //                 // case GAME_MATCHING:
    //                 // case GAME_EXTRA:
    //                 //     break;

    //                 case 0:
    //                     break;
    //             } //close switch m_gmType

    //             break; //break LOT_MK6

    //         // case LOT_GB:
    //         //     break; //break LOT_GB

    //     } //close switch m_lotteryType

    // }  //close if bRet

    if (retVal) {
        betObj.numOfDraws = td.draw_type.charCodeAt(0) & 0x3f;
        if (betObj.numOfDraws === 0) {
            //  since no need to mark draw number if not multiple draw
            //  set it to 1 by default
            betObj.numOfDraws = 1;
        }
    }

    for (let i = 0; i < betObj.numOfEntries; i++) {
        betObj.selections.push(new Entry());
    }

    //  set selections
    if (retVal) {
        retVal = setSelection(td, betObj, status);
    }

    return retVal;
};

export const ticketDetailToBetObj = (req, res, next) => {
    let retVal = true;

    const status = { s: ERROR_ID.RID_NO_ERROR };
    const ticketDetail: TICKET_DETAIL = req.ticketDetail;
    const betObj: MarkSixBetObject = new MarkSixBetObject();

    retVal = start(ticketDetail, betObj, status);

    if (retVal) {
        req.markSixBetObject = betObj;
        next();
    } else {
        const resObj: ResponseObject = Object.assign({}, SUCCESS_RESPONSE);
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG[getErrorKeyFromErrorCode(status.s)];
        res.status(200).send(resObj);
        return;
    }
};
