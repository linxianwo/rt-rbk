import { TICKET_DETAIL } from '../../../share/models/beteng-serv/ticketdetail';
import {
    ERROR_MSG,
    ResponseObject,
    ResponseObjectCode,
    SUCCESS_RESPONSE,
} from '../../../share/models/response-common';
import { EnabledTrack, EnabledStarter } from './validateBet';
import { RacingBetObject } from '../../../share/models/comm-serv/Racing/RacingBetObject';
import {
    RacingMeeting,
    TCEQTT_TYPE,
    QPTT_TYPE,
    QPQTT_TYPE,
} from '../../../share/models/comm-serv/Racing/Enums';
import * as RacingUtil from '../../util/racing-util';
import { PoolSymbol } from '../../../share/models/comm-serv/Racing/PoolType';
import {
    poolStrMapPoolType,
    getPoolBySymbol,
    poolTypeMapPoolStr,
    infoServerPoolStrMapPoolStr,
} from '../../../share/methods/beteng-serv/racing/translatePool';
import { Leg, SelfSelection } from '../../../share/models/comm-serv/Racing/Leg';
import {
    RacingBetObjectCriteria,
    FormulaCriteria,
    RacingBetEntryCriteria,
} from '../../../share/models/beteng-serv/racing/RacingCriteria';

const DEFAULT_TD = 'X';
const QPTT = PoolSymbol.QPTT;
const TT = PoolSymbol.TT;
const DT = PoolSymbol.DT;
const QTT = PoolSymbol.QTT;
const TCE = PoolSymbol.TCE;
const FCT = PoolSymbol.FCT;
const QPQTT = PoolSymbol.QPQTT;
const MAX_RACE = 15;
const FF = PoolSymbol.FF;
const TRIO = PoolSymbol.TRIO;
const ATRIO = PoolSymbol.ATRIO;
const ALUP = PoolSymbol.ALUP;
const XPOOL = 2;
const MAX_VAL_BOX = 23;
const MAX_TT_TYPE = 5;

const TKT_WIN = 1; /* win pla w-p */
const TKT_QIN = 2; /* qin qpl qqp */
const TKT_TRI = 3; /* trio */
const TKT_DBL = 4; /* win pla w-p */
const TKT_TBL = 5; /* qin qpl qqp */
const TKT_6UP = 6; /* trio */
const TKT_DT = 7; /* d-t */
const TKT_TT = 8; /* t-t */
const TKT_TCE_SINGLE = 9; /* tce single */
const TKT_TCE_MULTI = 10; /* tce multiple */
const TKT_3X7 = 11; /* allup trio short tkt */
const TKT_6X63 = 12; /* allup trio long tkt */
const TKT_QPTT = 13; /* qptt */
const TKT_CWB_LOCALOS = 14; // CWB+WIN FOR LOCAL + OVERSEAS RACE
const TKT_CWC_LOCALOS = 15; // CWC+WIN FOR LOCAL + OVERSEAS RACE
const TKT_AUP_CWA_FLX_3X = 18; // all up WPQ CWA flexi bet 3x
const TKT_AUP_CWA_FLX_3X_24 = 19; // all up WPQ CWA flexi bet 3x (Q309 24 Starters)
const TKT_DM_TRIO = 20; /* DM style all up trio short tkt */
const TKT_DM_6UP = 21; /* DM style DBL/TBL/6UP */
const TKT_DM_TCE = 22; /* DM style TCE ticket */
const TKT_CWA_SIMPLE = 23;
const TKT_CWB_SIMPLE = 24;
const TKT_CWA_LOCALOS = 25; // CWA+WIN FOR LOCAL + OVERSEAS RACE
const TKT_AUP_3X = 26; /* allup across pools 3x w/ BWA*/
const TKT_QPQTT_FLX_OSNOS = 27;
const TKT_AUP_BWA_6X = 28; /* allup across pools 6x w/ BWA*/
const TKT_QTT_FLX_NOS = 29;
const TKT_QTT_FLX_OS = 30;
const TKT_QPQTT_FLX_NOS = 31;
const TKT_CWC_SIMPLE = 32;
const TKT_QPTT_20 = 33; // qptt $20
const TKT_AUP_FLX_3X = 34; // all up WPQ flexi bet 3x
const TKT_TRI_FLX = 35; // all up TRIO flexi bet
const TKT_6UP_FLX = 36; // DBL/TBL/6UP flexi bet
const TKT_TCE_FLX = 37; // TCE flexi bet
const TKT_AUP_FLX_6X = 38; // all up WPQ flexi bet 6x
const TKT_AUP_FLX_6X_24 = 40; // all up WPQ flexi bet 6x (Q309 24 Starters)
const TKT_6UP_FLX_24 = 41; // DBL/TBL/6UP flexi bet (Q309 24 Starters)
const TKT_TCE_FLX_24 = 42; // TCE flexi bet (Q309 24 Starters)
const TKT_TRI_FLX_24 = 43; // all up TRIO flexi bet (Q309 24 Starters)
const TKT_AUP_FLX_3X_24 = 44; // all up WPQ flexi bet 3x (Q309 24 Starters)
const TKT_AUP_FLX_6X_24_OS = 46; // all up WPQ flexi bet 6x (Overseas Only)
const TKT_6UP_FLX_24_OS = 47; // DBL/TBL/6UP flexi bet (Overseas Only)
const TKT_TCE_FLX_24_OS = 48; // TCE flexi bet (Overseas Only)
const TKT_TRI_FLX_24_OS = 49; // all up TRIO flexi bet (Overseas Only)
const TKT_AUP_FLX_3X_24_OS = 50; // all up WPQ flexi bet 3x (Overseas Only)
const TKT_AUP_FLX_3X_NOS = 51; // all up WPQ flexi bet 3x (No Oversea)
const TKT_TRI_FLX_NOS = 52; // all up TRIO flexi bet (No Oversea)
const TKT_6UP_FLX_NOS = 53; // DBL/TBL/6UP flexi bet (No Oversea)
const TKT_TCE_FLX_NOS = 54; // TCE flexi bet (No Oversea)
const TKT_AUP_FLX_6X_NOS = 55; // all up WPQ flexi bet 6x (No Oversea)
const TKT_WIN_SIMPLE = 56; // 14
const TKT_PLA_SIMPLE = 57; // 15
const TKT_QIN_SIMPLE = 58; // 16
const TKT_QPL_SIMPLE = 59; // 17

const TKT_6UP_FLX_34_OS = 183; // double treble 6up oversea
const TKT_TCE_FLX_34_OS = 184; // tce oversea
const TKT_AUP_CWA_FLX_3X_34_OS = 186; // W/P/Q/CWA 3x oversea.
const TKT_FCT_FLX = 180; // fct local
const TKT_FCT_FLX_34_OS = 187; // fct oversea

// by Sam, 20200529  Overseas race
const TKT_AUP_FLX_3X_34_OS = 181; // all up WPQ flexi bet 3x (Overseas Only)
const TKT_TRI_FLX_34_OS = 182; // all up TRIO flexi bet (Overseas Only)
const TKT_AUP_FLX_6X_34_OS = 185;
const TKT_IWIN = 198;
const TKT_IWIN_OS = 199;

const TKT_BNK_24 = 11;
const TKT_BNK_34 = 12;
// export const betSlipToTicketDetail = (req, res, next) => {
//     const resObj: ResponseObject = Object.assign({}, SUCCESS_RESPONSE);
//     const betSlip: Slip = req.betSlip;
//     const ttstWrapper = new TTSTWrapper();
//     const ticketDetail = new TICKET_DETAIL();
//     const error_status = ttstWrapper.CTSTvalidate(
//         true,
//         true,
//         true,
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
//     // const errKey: string = getErrMsgKey(error_status);

//     if (ERROR_ID[errKey] === ERROR_ID.RID_NO_ERROR) {
//         req.ticketDetail = ticketDetail;
//         next();
//     } else {
//         resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
//         resObj.message = ERROR_MSG[errKey];
//         res.status(200).send(resObj);
//         return;
//     }
// };

const setTrackDay = (
    req,
    td: TICKET_DETAIL,
    betObj: RacingBetObject
): string => {
    let status = ERROR_MSG.RID_NO_ERROR;
    const ticketDetail = Object.assign({}, td);
    if (ticketDetail.track === DEFAULT_TD) {
        const numOfLocalDefinedTrack = req.enabledTracks.filter(
            (track) => track.Venue === 'HV' || track.Venue === 'ST'
        ).length;
        if (numOfLocalDefinedTrack < 1) {
            status = ERROR_MSG.RID_EX_TKT_MEET_NOT_DEFINE;
        } else {
            const defaultTrack = req.defaultTrack;
            if (defaultTrack === null) {
                // status = ERROR_MSG.RID_EX_TKT_MEET_NOT_DEFINE;
                let tmpTrack = req.enabledTracks.filter(
                    (track) => track.Venue === 'HV' || track.Venue === 'ST'
                )[0];
                req.defaultTrack = tmpTrack;
                betObj.RaceDay = RacingUtil.getWeekDayCode(tmpTrack.Date);
                betObj.RaceDate = tmpTrack.Date
                    ? tmpTrack.Date.replace(/\//g, '').replace(
                          /^(\d{2})(\d{2})(\d{4})$/,
                          '$3-$2-$1'
                      )
                    : '';
                betObj.Meeting = RacingMeeting[tmpTrack.Venue] as RacingMeeting;
                req.selectedTrack = tmpTrack;
            } else {
                const defaultVenue = RacingMeeting[defaultTrack.Venue];
                // 2020-10-13 JasonY: defaultVenue can only be local meeting,
                // so comment the below logic and TTST add not mark check for betslip which can select meeting
                // if (
                //     ticketDetail.ticket_id !== TKT_QPTT_20 &&
                //     (defaultVenue === RacingMeeting.S1 ||
                //         defaultVenue === RacingMeeting.S2)
                // ) {
                //     status = ERROR_MSG.RID_EX_TKT_MEET_NOT_MARK;
                // } else {
                betObj.RaceDay = RacingUtil.getWeekDayCode(defaultTrack.Date);
                betObj.RaceDate = defaultTrack.Date
                    ? defaultTrack.Date.replace(/\//g, '').replace(
                        /^(\d{2})(\d{2})(\d{4})$/,
                        '$3-$2-$1'
                    )
                    : '';
                betObj.Meeting = defaultVenue as RacingMeeting;
                req.selectedTrack = defaultTrack;
                // }
            }
        }
    } else {
        if (ticketDetail.track === RacingMeeting.X1) {
            ticketDetail.track = RacingMeeting.S1;
        } else if (ticketDetail.track === RacingMeeting.X2) {
            ticketDetail.track = RacingMeeting.S2;
        }
        // check if marked track defined
        const enabledTracks = req.enabledTracks;
        const matchedTrack = enabledTracks.filter(
            (track) => ticketDetail.track === RacingMeeting[track.Venue]
        );

        // if not matched, its error, otherwise, track and day is got
        if (matchedTrack.length !== 1) {
            status = ERROR_MSG.RID_EX_TKT_MEET_NOT_DEFINE;
        } else {
            betObj.RaceDay = RacingUtil.getWeekDayCode(matchedTrack[0].Date);
            betObj.RaceDate = matchedTrack[0].Date
                ? matchedTrack[0].Date.replace(/\//g, '').replace(
                    /^(\d{2})(\d{2})(\d{4})$/,
                    '$3-$2-$1'
                )
                : '';
            betObj.Meeting = RacingMeeting[
                matchedTrack[0].Venue
            ] as RacingMeeting;
            req.selectedTrack = matchedTrack[0];
        }
    }
    return status;
};

const getValidPoolsBySelectedRace = (
    selectedTrack: EnabledTrack,
    raceNo: number
) => {
    if (selectedTrack === null) {
        return [];
    }
    const currentRace = selectedTrack.EnabledRaces.filter(
        (enabledRace) => enabledRace.RaceNo === raceNo
    )[0];
    if (currentRace) {
        return currentRace.EnabledPools.map(
            (enabledPool) =>
                PoolSymbol[
                poolStrMapPoolType(
                    infoServerPoolStrMapPoolStr(enabledPool.Pool)
                )
                ]
        );
    } else {
        return [];
    }
};

const getStartersBySelectedRacePool = (
    selectedTrack: EnabledTrack,
    raceNo: number,
    poolSymbol: string,
    max_tkt_horse_seln: number
) => {
    let i = 1;
    const fieldStarters = [];
    const currentRace = selectedTrack.EnabledRaces.filter(
        (enabledRace) => enabledRace.RaceNo === raceNo
    )[0];
    if (currentRace) {
        const currentEnabledPool = currentRace.EnabledPools.filter(
            (enabledPool) =>
                PoolSymbol[
                poolStrMapPoolType(
                    infoServerPoolStrMapPoolStr(enabledPool.Pool)
                )
                ] === poolSymbol
        );
        if (currentEnabledPool.length > 0) {
            return currentEnabledPool[0].EnabledStarters;
        } else {
            while (i <= max_tkt_horse_seln) {
                fieldStarters.push(i);
                i++;
            }
            return fieldStarters.map((num) => {
                const starter: EnabledStarter = {
                    Number: num,
                    CompositeName: '',
                    Composite: [],
                    NumberEngName: '',
                    NumberChnName: '',
                };
                return starter;
            });
        }
    } else {
        while (i <= max_tkt_horse_seln) {
            fieldStarters.push(i);
            i++;
        }
        return fieldStarters.map((num) => {
            const starter: EnabledStarter = {
                Number: num,
                CompositeName: '',
                Composite: [],
                NumberEngName: '',
                NumberChnName: '',
            };
            return starter;
        });
    }
};

const setRace = (
    selectedTrack: EnabledTrack,
    td: TICKET_DETAIL,
    betObj: RacingBetObject,
    checkPoolStatus: boolean
): string => {
    let trackNotForSelling = false;
    let validRaceNos = [];
    if (selectedTrack === null) {
        trackNotForSelling = true;
    } else {
        validRaceNos = selectedTrack.EnabledRaces.map(
            (enabledRace) => enabledRace.RaceNo
        );
        if (validRaceNos.length === 0) {
            return ERROR_MSG.RID_EX_TKT_ALL_RACE_CLOSED_FOR_SELECTED_VENUE;
        }
    }
    let totalRaceNum = 0,
        tmpLeg;
    for (let raceNo = 1; raceNo < td.race.length; raceNo++) {
        if (td.race[raceNo] === '1') {
            if (
                checkPoolStatus === false ||
                trackNotForSelling ||
                validRaceNos.includes(raceNo)
            ) {
                tmpLeg = new Leg();
                tmpLeg.RaceNo = raceNo;
                betObj.Legs.push(tmpLeg);
                totalRaceNum++;
            } else {
                return ERROR_MSG.RID_EX_BE_INVALID_RACE.replace(
                    '%1',
                    '' + raceNo
                );
            }
        }
    }
    if (totalRaceNum === 0) {
        /* JasonY: for DT QPQTT TT QTT, raceno must fill in betslip,
            so only for QPTT ,the totalRaceNum will be 0, but only one race will define TT in a track */
        //  if no race marked, chk if it is D-T T-T default race
        const pool = td.pool[1];
        if (pool !== QPTT && pool !== DT && pool !== TT && pool !== QPQTT) {
            return ERROR_MSG.RID_EX_TKT_NO_RACE_MARK;
        } else {
            let count = 0,
                race = 0;
            let validPools;
            if (trackNotForSelling) {
                count = 1;
                // set race to 1, but it is fake data, becuase when trackNotForSelling is true, backend will return error after check track
                race = 1;
                if (pool === QPTT || pool === TT) {
                    betObj.Formula.Legs = 3;
                } else if (pool === DT) {
                    betObj.Formula.Legs = 2;
                } else {
                    betObj.Formula.Legs = 1;
                }
            } else {
                // check default TT race
                if (pool === QPTT || pool === TT) {
                    for (let i = 1; i <= MAX_RACE; i++) {
                        validPools = getValidPoolsBySelectedRace(
                            selectedTrack,
                            i
                        );
                        if (validPools.includes(TT)) {
                            count++;
                            race = i;
                        }
                    }
                    betObj.Formula.Legs = 3;
                } else if (pool === QPQTT) {
                    for (let i = 1; i <= MAX_RACE; i++) {
                        validPools = getValidPoolsBySelectedRace(
                            selectedTrack,
                            i
                        );
                        if (validPools.includes(QTT)) {
                            count++;
                            race = i;
                        }
                    }
                    betObj.Formula.Legs = 1;
                } else {
                    for (let i = 1; i <= MAX_RACE; i++) {
                        validPools = getValidPoolsBySelectedRace(
                            selectedTrack,
                            i
                        );
                        if (validPools.includes(DT)) {
                            count++;
                            race = i;
                        }
                    }
                    betObj.Formula.Legs = 2;
                }
            }

            if (count === 0) {
                // if (checkPoolStatus) {
                if (pool === QPQTT) {
                    return ERROR_MSG.RID_EX_TKT_POOL_NOT_DEFINE_JKC;
                } else {
                    return ERROR_MSG.RID_EX_TKT_POOL_NOT_DEFINE;
                }
                // }
            } else if (count > 1) {
                return ERROR_MSG.RID_EX_TKT_NO_RACE_MARK;
            } else {
                tmpLeg = new Leg();
                tmpLeg.RaceNo = race;
                betObj.Legs.push(tmpLeg);
                for (let i = 1; i < betObj.Formula.Legs; i++) {
                    tmpLeg = new Leg();
                    tmpLeg.RaceNo = race + i;
                    betObj.Legs.push(tmpLeg);
                }
                return ERROR_MSG.RID_NO_ERROR;
            }
        }
    } else if (totalRaceNum === 1) {
        let pool = getPoolBySymbol(td.pool[1]);
        pool = poolTypeMapPoolStr(pool);
        betObj.Formula.Legs = RacingBetObjectCriteria[pool].maxLegNum;
        for (let i = 1; i < betObj.Formula.Legs; i++) {
            tmpLeg = new Leg();
            tmpLeg.RaceNo = betObj.Legs[0].RaceNo + i;
            betObj.Legs.push(tmpLeg);
        }
        return ERROR_MSG.RID_NO_ERROR;
    } else {
        betObj.Formula.Legs = totalRaceNum;
        return ERROR_MSG.RID_NO_ERROR;
    }
};

const setFormula = (td: TICKET_DETAIL, betObj: RacingBetObject): string => {
    let status = ERROR_MSG.RID_NO_ERROR;
    if (td.allup_flag === 0) {
        betObj.Formula.Legs = 0;
        betObj.Formula.Combs = 0;
    } else {
        let formula: string[],
            form = '';
        let cnt = 1;
        const allFormula = Object.getOwnPropertyNames(FormulaCriteria);
        if (betObj.Formula.Legs > 3) {
            formula = allFormula.splice(allFormula.indexOf('4x1'));
        } else {
            allFormula.splice(allFormula.indexOf('4x1'));
            formula = allFormula;
        }
        formula.unshift('');
        //  looking for the position of the formula of the ticket, the position
        //  is used to determine whether the event( no of races selected )
        //  is matched with the formula marked
        //

        while (td.formula[cnt]) {
            if (td.formula[cnt] === '1') {
                form = formula[cnt];
            }
            cnt++;
        }

        if (form) {
            const leg = Number(form.split('x')[0]);
            const combination = Number(form.split('x')[1]);
            if (betObj.Formula.Legs !== leg) {
                status = ERROR_MSG.RID_EX_TKT_ILL_FORMULA;
            } else {
                betObj.Formula.Combs = combination;
            }
        } else {
            betObj.Formula.Legs = 0;
            betObj.Formula.Combs = 0;
        }
    }
    return status;
};

const is24Starters = (
    slipID: number // Q309: 24 Starters
) => {
    if (
        slipID === TKT_AUP_FLX_6X_24 ||
        slipID === TKT_6UP_FLX_24 ||
        slipID === TKT_TCE_FLX_24 ||
        slipID === TKT_TRI_FLX_24 ||
        slipID === TKT_AUP_FLX_3X_24 ||
        slipID === TKT_AUP_CWA_FLX_3X_24 || // By Star Feng 04-30-2014 suppress CW Family
        slipID === TKT_AUP_FLX_6X_24_OS || // Q110: Overseas
        slipID === TKT_6UP_FLX_24_OS || // Q110: Overseas
        slipID === TKT_TCE_FLX_24_OS || // Q110: Overseas
        slipID === TKT_TRI_FLX_24_OS || // Q110: Overseas
        slipID === TKT_AUP_FLX_3X_24_OS || // Q110: Overseas
        slipID === TKT_QTT_FLX_OS || //  by Ben Ou, on 2013/04/19. PSR2013, QTT. QTT oversea
        slipID === TKT_IWIN_OS || // by Star Feng, on 2016/05/05 IWIN Enhancement,add for IWIN oversea
        // slipID === TKT_QPQTT_FLX_OS		|| // by YY Ngai, on 2014/03/24. QPQTT oversea ticket cancel.
        slipID ===
        TKT_QPQTT_FLX_OSNOS /*	By YY Ngai, 06012014. MSR 2014. New bet slips for Quick Pick QTT (combined local and overseas)*/
    ) {
        return true;
    }

    return false;
};

const is34Starters = (
    slipID: number // Q309: 24 Starters
) => {
    if (
        slipID === TKT_6UP_FLX_34_OS ||
        slipID === TKT_TCE_FLX_34_OS ||
        slipID === TKT_AUP_CWA_FLX_3X_34_OS ||
        slipID === TKT_FCT_FLX_34_OS ||
        slipID === TKT_AUP_FLX_3X_34_OS ||
        slipID === TKT_TRI_FLX_34_OS ||
        slipID === TKT_AUP_FLX_6X_34_OS
    ) {
        return true;
    }

    return false;
};

const setTktBanker = (
    slipId: number,
    pool: string,
    poolSymbol: string,
    selection: string[],
    legIndex: number,
    max_tkt_horse_seln: number,
    betObj: RacingBetObject,
    mb_type: string,
    selectedTrack: EnabledTrack
): string => {
    let numberRead = 0;
    let fieldMark, startAt, loopEnd;
    const BANKER_10 = 10;
    const BANKER_20 = 20;
    const BANKER_30 = 30;
    if (
        max_tkt_horse_seln === 24 &&
        (slipId === TKT_AUP_FLX_6X_24 || slipId === TKT_AUP_FLX_6X_24_OS)
    ) {
        fieldMark = (TKT_BNK_24 + max_tkt_horse_seln + 1) * legIndex;
        startAt = fieldMark - (TKT_BNK_24 + max_tkt_horse_seln);
        loopEnd = startAt + TKT_BNK_24;
        fieldMark = loopEnd;
        let tmpBankerValue = 0;
        let bankerValue = 0;
        let nError = '';
        for (let i = startAt; i < loopEnd; i++) {
            if (selection[i] === '1') {
                //  banker marks on tkt
                //
                //  1   4   7   10
                //  2   5   8   20
                //  3   6   9
                tmpBankerValue = i - startAt + 1;

                if (numberRead === 0) {
                    if (tmpBankerValue === TKT_BNK_24) {
                        //  banker20 is marked
                        bankerValue = BANKER_20;
                    } else {
                        bankerValue = i - startAt + 1;
                    }
                    numberRead++;
                } else if (numberRead === 1) {
                    if (tmpBankerValue === TKT_BNK_24 - 1) {
                        //  banker10 is marked
                        bankerValue += BANKER_10;
                    } else if (tmpBankerValue === TKT_BNK_24) {
                        //  banker20 is marked
                        bankerValue += BANKER_20;
                    } else {
                        //  illegal mark
                        nError = ERROR_MSG.RID_EX_TKT_ILL_BANKER;
                        break; //  break for loop
                    }
                    //  by Jason Lau, 20091216
                    //  fix SQ 46357
                    if (bankerValue > max_tkt_horse_seln) {
                        nError = ERROR_MSG.RID_EX_TKT_ILL_BANKER;
                        break; //  break for loop
                    } else {
                        numberRead++;
                    }
                } else {
                    //  too many mark
                    nError = ERROR_MSG.RID_EX_TKT_ILL_BANKER;
                    break; //  break for loop
                }
            }
        }
        if (nError === ERROR_MSG.RID_NO_ERROR) {
            if (bankerValue !== 0) {
                betObj.Legs[legIndex - 1].Bankers.push(bankerValue);
            }
        }
        return nError;
    } else if (max_tkt_horse_seln === 34 && slipId === TKT_AUP_FLX_6X_34_OS) {
        // Q110: Overseas
        fieldMark = (TKT_BNK_34 + max_tkt_horse_seln + 1) * legIndex;
        startAt = fieldMark - (TKT_BNK_34 + max_tkt_horse_seln);
        loopEnd = startAt + TKT_BNK_34;
        fieldMark = loopEnd; // the real F mark

        let tmpBankerValue = 0;
        let bankerValue = 0;
        let nError = '';
        for (let i = startAt; i < loopEnd; i++) {
            if (selection[i] === '1') {
                //  banker marks on tkt
                //
                //  1   4   7   10
                //  2   5   8   20
                //  3   6   9   30
                tmpBankerValue = i - startAt + 1;

                if (numberRead === 0) {
                    if (tmpBankerValue === TKT_BNK_34) {
                        //  banker30 is marked
                        bankerValue = BANKER_30;
                    } else if (tmpBankerValue === TKT_BNK_34 - 1) {
                        //  banker20 is marked
                        bankerValue = BANKER_20;
                    } else {
                        bankerValue = i - startAt + 1;
                    }
                    numberRead++;
                } else if (numberRead === 1) {
                    if (tmpBankerValue === TKT_BNK_34 - 2) {
                        //  banker10 is marked
                        bankerValue += BANKER_10;
                    } else if (tmpBankerValue === TKT_BNK_34 - 1) {
                        //  banker20 is marked
                        bankerValue += BANKER_20;
                    } else if (tmpBankerValue === TKT_BNK_34) {
                        //  banker30 is marked
                        bankerValue += BANKER_30;
                    } else {
                        //  illegal mark
                        nError = ERROR_MSG.RID_EX_TKT_ILL_BANKER;
                        break; //  break for loop
                    }
                    //  by Jason Lau, 20091216
                    //  fix SQ 46357
                    if (bankerValue > max_tkt_horse_seln) {
                        nError = ERROR_MSG.RID_EX_TKT_ILL_BANKER;
                        break; //  break for loop
                    } else {
                        numberRead++;
                    }
                } else {
                    //  too many mark
                    nError = ERROR_MSG.RID_EX_TKT_ILL_BANKER;
                    break; //  break for loop
                }
            }
        }
        if (nError === ERROR_MSG.RID_NO_ERROR) {
            if (bankerValue !== 0) {
                betObj.Legs[legIndex - 1].Bankers.push(bankerValue);
            }
        }
        return nError;
    } else {
        fieldMark = (max_tkt_horse_seln * 2 + 1) * legIndex;

        startAt = fieldMark - max_tkt_horse_seln * 2;
        loopEnd = startAt + max_tkt_horse_seln;
        fieldMark = loopEnd; // the real F mark
        if (mb_type === '5') {
            let ssbankerNum = 0;
            switch (poolSymbol) {
                case FCT:
                    ssbankerNum = 2;
                    break;
                case TCE:
                    ssbankerNum = 3;
                    break;
                case QTT:
                    ssbankerNum = 4;
                    break;
            }
            for (let i = 0; i < ssbankerNum; i++) {
                const tmpSelfSelection = new SelfSelection();
                if (
                    selection[fieldMark + (max_tkt_horse_seln + 1) * i] === '1'
                ) {
                    tmpSelfSelection.IsFieldSelected = true;
                    if (selectedTrack === null) {
                        tmpSelfSelection.Bankers = [
                            1,
                            2,
                            3,
                            4,
                            5,
                            6,
                            7,
                            8,
                            9,
                            10,
                            11,
                            12,
                            13,
                            14,
                        ];
                    } else {
                        const enabledStarters = getStartersBySelectedRacePool(
                            selectedTrack,
                            betObj.Legs[legIndex - 1].RaceNo,
                            poolSymbol,
                            max_tkt_horse_seln
                        );
                        tmpSelfSelection.Bankers = enabledStarters.map(
                            (enabledStarter) => enabledStarter.Number
                        );
                    }
                } else {
                    const tmpStartAt = startAt + (max_tkt_horse_seln + 1) * i;
                    const tmpLoopEnd = loopEnd + (max_tkt_horse_seln + 1) * i;
                    for (let j = tmpStartAt; j < tmpLoopEnd; j++) {
                        if (selection[j] === '1') {
                            tmpSelfSelection.Bankers.push(j - tmpStartAt + 1);
                        }
                    }
                }
                betObj.Legs[legIndex - 1].SSBankers.push(tmpSelfSelection);
            }
        } else {
            if (RacingBetEntryCriteria[pool].tceQttType) {
                if (selection[fieldMark] === '1') {
                    return ERROR_MSG.RID_EX_TKT_TOO_MANY_BANKER;
                }
                if (
                    poolSymbol === TCE &&
                    legIndex === 1 &&
                    selection[fieldMark + (max_tkt_horse_seln + 1)] === '1'
                ) {
                    return ERROR_MSG.RID_EX_TKT_TOO_MANY_BANKER;
                }
                if (
                    poolSymbol === QTT &&
                    legIndex === 1 &&
                    selection[fieldMark + (max_tkt_horse_seln + 1) * 2] === '1'
                ) {
                    return ERROR_MSG.RID_EX_TKT_TOO_MANY_BANKER;
                }
            }

            for (let i = startAt; i < loopEnd; i++) {
                if (selection[i] === '1') {
                    betObj.Legs[legIndex - 1].Bankers.push(i - startAt + 1);
                    numberRead++;
                }
            }

            if (poolSymbol === TCE || poolSymbol === QTT) {
                // PSR2013 by Joan Zhong on 20130510 added QTT pool
                if (numberRead === 0) {
                    return ERROR_MSG.RID_EX_TKT_INS_SELECTION;
                }
                if (numberRead > 1) {
                    return ERROR_MSG.RID_EX_TKT_TOO_MANY_BANKER;
                }
                //  first banker has one mark, check second
                startAt += max_tkt_horse_seln + 1;
                loopEnd += max_tkt_horse_seln + 1;
                for (let i = startAt; i < loopEnd; i++) {
                    if (selection[i] === '1') {
                        betObj.Legs[legIndex - 1].Bankers.push(i - startAt + 1);
                        numberRead++;
                    }
                }
                if (poolSymbol === QTT) {
                    // PSR2013 by Joan Zhong on 20130510 added QTT pool
                    if (numberRead === 0) {
                        return ERROR_MSG.RID_EX_TKT_INS_SELECTION;
                    }
                    if (numberRead > 2) {
                        return ERROR_MSG.RID_EX_TKT_TOO_MANY_BANKER;
                    }

                    startAt += max_tkt_horse_seln + 1;
                    loopEnd += max_tkt_horse_seln + 1;
                    for (let i = startAt; i < loopEnd; i++) {
                        if (selection[i] === '1') {
                            betObj.Legs[legIndex - 1].Bankers.push(
                                i - startAt + 1
                            );
                            numberRead++;
                        }
                    }
                }
            }
        }
        return ERROR_MSG.RID_NO_ERROR;
    }
};

const setTktSelection = (
    slipId: number,
    pool: string,
    poolSymbol: string,
    selection: string[],
    legIndex: number,
    max_tkt_horse_seln: number,
    betObj: RacingBetObject,
    bankerBet: boolean,
    index: number,
    selectedTrack: EnabledTrack
): string => {
    let loop_end, no_read, fieldMark; //  by Ben Ou, on 2013/04/19. PSR2013, QTT. SelectPos is for banker & banker-multi

    let fieldMarked = false;
    no_read = 0;

    if (bankerBet) {
        if (slipId === TKT_AUP_FLX_6X_34_OS) {
            // Q110: Overseas
            fieldMark = (TKT_BNK_34 + max_tkt_horse_seln + 1) * index;
        } else if (
            slipId === TKT_AUP_FLX_6X_24 ||
            slipId === TKT_AUP_FLX_6X_24_OS
        ) {
            // Q110: Overseas
            fieldMark = (TKT_BNK_24 + max_tkt_horse_seln + 1) * index;
        } else if (
            poolSymbol === QTT &&
            RacingBetEntryCriteria[pool].maxBankerNum !== 0
        ) {
            fieldMark = (max_tkt_horse_seln * 3 + 1) * index;
        } else if (
            poolSymbol === FCT &&
            (Number(pool.substr(3)) === TCEQTT_TYPE.FCT_BANKER ||
                Number(pool.substr(3)) === TCEQTT_TYPE.FCT_BANKER_MULT)
        ) {
            fieldMark = (max_tkt_horse_seln * 1 + 1) * index;
        } else {
            fieldMark = (max_tkt_horse_seln * 2 + 1) * index;
        }
    } else {
        fieldMark = (max_tkt_horse_seln + 1) * index;
    }
    loop_end = fieldMark;
    let startAt = fieldMark - max_tkt_horse_seln;

    //  tce has two baneker selections with F box
    if (poolSymbol === TCE) {
        if (
            Number(pool.substr(3)) === TCEQTT_TYPE.TCE_BANKER_MULT ||
            Number(pool.substr(3)) === TCEQTT_TYPE.TCE_BANKER
        ) {
            fieldMark += max_tkt_horse_seln + 2;
            startAt += max_tkt_horse_seln + 2;
            loop_end += max_tkt_horse_seln + 2;
        }
    }
    //  by Ben Ou, on 2013/04/19.
    // 	PSR2013, QTT.
    // 	banker & banker-multi have one more banker
    if (poolSymbol === QTT) {
        if (
            Number(pool.substr(3)) === TCEQTT_TYPE.QTT_BANKER_MULT ||
            Number(pool.substr(3)) === TCEQTT_TYPE.QTT_BANKER
        ) {
            //  qtt banker bets has 3 banker seln max.,
            //  therefore offset 14+F+F+F position
            fieldMark += max_tkt_horse_seln + 3;
            startAt += max_tkt_horse_seln + 3;
            loop_end += max_tkt_horse_seln + 3;
        }
    }

    if (poolSymbol === FCT) {
        // by Samuel Chan, 20200606
        if (
            Number(pool.substr(3)) === TCEQTT_TYPE.FCT_BANKER_MULT ||
            Number(pool.substr(3)) === TCEQTT_TYPE.FCT_BANKER
        ) {
            fieldMark += max_tkt_horse_seln + 1;
            startAt += max_tkt_horse_seln + 1;
            loop_end += max_tkt_horse_seln + 1;
        }
    }

    //  read and check the field mark first
    if (selection[fieldMark] === '1') {
        //  by Ben Ou, on 2013/04/19. PSR2013, QTT. Set selection field mark
        betObj.Legs[legIndex - 1].IsFieldSelected = true;
        if (selectedTrack === null) {
            betObj.Legs[legIndex - 1].Selections = [
                1,
                2,
                3,
                4,
                5,
                6,
                7,
                8,
                9,
                10,
                11,
                12,
                13,
                14,
            ];
        } else {
            const enabledStarters = getStartersBySelectedRacePool(
                selectedTrack,
                betObj.Legs[legIndex - 1].RaceNo,
                poolSymbol,
                max_tkt_horse_seln
            );
            betObj.Legs[legIndex - 1].Selections = enabledStarters.map(
                (enabledStarter) => enabledStarter.Number
            );
        }

        fieldMarked = true;
    }
    //  loop for the selections
    //  '1' means have mark on it
    // VC8        for( int i = startAt; i < loop_end; i++ ) {
    let i;
    for (i = startAt; i < loop_end; i++) {
        if (selection[i] === '1') {
            betObj.Legs[legIndex - 1].Selections.push(i - startAt + 1);
            no_read++;
        }
    }
    //  selection cannot have field mark together with other marks
    if (fieldMarked) {
        if (no_read !== 0) {
            return ERROR_MSG.RID_EX_TKT_DUP_SELECTION;
        }
    }
    ////////////////////////////////////////////////////////////////////////////
    //
    //  check if there is any excess selections in tktDtl->selection
    //  only when it is an allup bet and this is the last valid leg to input
    //
    if (
        (poolSymbol === ALUP || poolSymbol === ATRIO) &&
        legIndex === betObj.Formula.Legs
    ) {
        i = loop_end + 1;
        while (selection[i]) {
            if (selection[i] === '1') {
                return ERROR_MSG.RID_EX_TKT_INS_RACE;
            }
            i++;
        }
    }
    return ERROR_MSG.RID_NO_ERROR;
};

const setSelection = (
    td: TICKET_DETAIL,
    max_tkt_horse_seln: number,
    betObj: RacingBetObject,
    selectedTrack: EnabledTrack
): string => {
    let status: string = ERROR_MSG.RID_NO_ERROR;
    let poolSymbol = '';
    const betPool = betObj.PoolType;
    // QPQTT QPTT
    if (betPool === QPTT || betPool === QPQTT) {
        for (let i = 1; i < MAX_TT_TYPE; i++) {
            if (td.selection[i] === '1') {
                betObj.Legs[0].QuickPickType = i;
                if (betPool === QPQTT) {
                    betObj.UnitBet = 100;
                    if (betObj.Legs[0].QuickPickType === QPQTT_TYPE.QPQTT_A) {
                        betObj.BetTotal = 2400;
                    } else if (
                        betObj.Legs[0].QuickPickType === QPQTT_TYPE.QPQTT_B
                    ) {
                        betObj.BetTotal = 12000;
                    } else if (
                        betObj.Legs[0].QuickPickType === QPQTT_TYPE.QPQTT_C
                    ) {
                        betObj.BetTotal = 36000;
                    }
                } else if (betPool === QPTT) {
                    if (betObj.Legs[0].QuickPickType === QPTT_TYPE.QPTT_A) {
                        betObj.Legs.push(new Leg());
                        betObj.Legs.push(new Leg());
                        betObj.Legs.push(new Leg());
                        betObj.Legs[3].RaceNo = betObj.Legs[0].RaceNo;
                        betObj.Legs[4].RaceNo = betObj.Legs[1].RaceNo;
                        betObj.Legs[5].RaceNo = betObj.Legs[2].RaceNo;
                        betObj.UnitBet = 1000;
                        betObj.BetTotal = 2000;
                        betObj.IsFlexiBet = false;
                    } else if (
                        betObj.Legs[0].QuickPickType === QPTT_TYPE.QPTT_B
                    ) {
                        betObj.UnitBet = 1000;
                        betObj.BetTotal = 4000;
                        betObj.IsFlexiBet = false;
                    } else if (
                        betObj.Legs[0].QuickPickType === QPTT_TYPE.QPTT_C
                    ) {
                        betObj.UnitBet = 200;
                        betObj.BetTotal = 12800;
                        betObj.IsFlexiBet = false;
                    } else if (
                        betObj.Legs[0].QuickPickType === QPTT_TYPE.QPTT_D
                    ) {
                        betObj.UnitBet = 500;
                        betObj.BetTotal = 13500;
                        betObj.IsFlexiBet = false;
                    }
                }
                betObj.Legs.forEach((leg) => {
                    leg.QuickPickType = i;
                });
                return status;
            }
        }
    }

    for (let currentLeg = 1; currentLeg <= betObj.Formula.Legs; currentLeg++) {
        poolSymbol = betObj.Legs[currentLeg - 1].AllUpPoolType;
        if (poolSymbol === '') {
            poolSymbol = betPool;
        }
        let pool = getPoolBySymbol(poolSymbol);
        pool = poolTypeMapPoolStr(pool);
        let tceQttType_Factor = -1,
            bankerPlaceNum = -1;
        if (
            td.mb_type === '1' ||
            td.mb_type === '2' ||
            td.mb_type === '3' ||
            td.mb_type === '4' ||
            td.mb_type === '5'
        ) {
            switch (pool) {
                case 'FCT':
                    bankerPlaceNum = 2;
                    tceQttType_Factor = 2;
                    break;
                case 'TCE':
                    bankerPlaceNum = 3;
                    tceQttType_Factor = 0;
                    break;
                case 'QTT':
                    bankerPlaceNum = 4;
                    tceQttType_Factor = 1;
                    break;
            }
        }
        betObj.Legs[currentLeg - 1].TceQttType =
            tceQttType_Factor !== -1
                ? Number(td.mb_type) + 5 * tceQttType_Factor
                : 0;
        pool =
            tceQttType_Factor !== -1
                ? pool + (Number(td.mb_type) + 5 * tceQttType_Factor)
                : pool;
        if (
            (RacingBetEntryCriteria[pool] &&
                RacingBetEntryCriteria[pool].maxBankerNum !== 0) ||
            td.mb_type === '5'
        ) {
            status = setTktBanker(
                td.ticket_id,
                pool,
                poolSymbol,
                td.selection,
                currentLeg,
                max_tkt_horse_seln,
                betObj,
                td.mb_type,
                selectedTrack
            );
        }
        // then check selection
        if (status === ERROR_MSG.RID_NO_ERROR) {
            //  bankerBet is to set the ticketdata offset
            let bankerBet = false;
            if (RacingBetEntryCriteria[pool].maxBankerNum === 0) {
                bankerBet = false;
                if (betObj.PoolType === ALUP || betObj.PoolType === ATRIO) {
                    bankerBet = true;
                }
            } else {
                bankerBet = true;
            }
            if (td.mb_type !== '5') {
                if (td.mb_type === '1') {
                    let loop = bankerPlaceNum;
                    while (status === ERROR_MSG.RID_NO_ERROR && loop > 0) {
                        status = setTktSelection(
                            td.ticket_id,
                            pool,
                            poolSymbol,
                            td.selection,
                            currentLeg,
                            max_tkt_horse_seln,
                            betObj,
                            bankerBet,
                            bankerPlaceNum - loop + 1,
                            selectedTrack
                        );
                        loop--;
                    }
                } else {
                    status = setTktSelection(
                        td.ticket_id,
                        pool,
                        poolSymbol,
                        td.selection,
                        currentLeg,
                        max_tkt_horse_seln,
                        betObj,
                        bankerBet,
                        currentLeg,
                        selectedTrack
                    );
                }
            }
        }
        //  if error, return
        if (status !== ERROR_MSG.RID_NO_ERROR) {
            break;
        }
    }
    return status;
};

const setValue = (td: TICKET_DETAIL, betObj: RacingBetObject): string => {
    const valueTable = [
        0,
        1,
        2,
        3,
        4,
        5,
        10,
        20,
        40,
        50,
        100,
        200,
        400,
        500,
        1000,
        2000,
        4000,
        5000,
        10000,
        20000,
        40000,
        50000,
        100000,
        200000,
        400000,
        500000,
    ];

    const status = ERROR_MSG.RID_NO_ERROR;
    let total = 0;
    let startAt = 0;
    let largeAmt = false;
    let smallAmt = false;
    //    char tktId = ticket.tktDtl()->ticket_id;
    //  by Ben Ou, on 2013/04/19. PSR2013, QTT. Accept larger id
    const tktId = td.ticket_id;
    //  unit value table is based on the ticket id
    //  some are started from $2 and some are $10
    switch (tktId) {
        //        case TKT_TRI :        //  comment out here due to the accident on 20080917
        case TKT_DBL: //  move here due to the accident on 20080917
        case TKT_TBL: //  move here due to the accident on 20080917
        case TKT_6UP: //  verified on 20080917
        case TKT_DT: //  verified on 20080917
        case TKT_TT: //  verified on 20080917
        case TKT_TCE_SINGLE: //  verified on 20080917
        case TKT_TCE_MULTI: //  verified on 20080917
        case TKT_3X7: //  verified on 20080917
        case TKT_6X63: //  verified on 20080917
        case TKT_DM_TRIO: //  verified on 20080917
        case TKT_DM_6UP: //  verified on 20080917
        case TKT_DM_TCE: //  verified on 20080917
            startAt = 1; //  increment one coz the next for loop of i will start at 0 instead of 1
            break;
        case TKT_AUP_3X: //  move here due to the accident on 20080917
        //  may need to confirm if $2, $3, $4, $5 were added on 200/1024 fir what purpose
        case TKT_TRI: //  move here due to the accident on 20080917
        case TKT_WIN: //  verified on 20080917
        case TKT_QIN: //  verified on 20080917
        case TKT_AUP_BWA_6X: //  verified on 20080917
        case TKT_WIN_SIMPLE:
        case TKT_PLA_SIMPLE:
        case TKT_QIN_SIMPLE:
        case TKT_QPL_SIMPLE:
        case TKT_CWA_LOCALOS:
        case TKT_CWB_LOCALOS:
        case TKT_CWC_LOCALOS:
        case TKT_CWA_SIMPLE:
        case TKT_CWB_SIMPLE:
        case TKT_CWC_SIMPLE:
            startAt = 5; //  increment one coz the next for loop of i will start at 0 instead of 1
            break;
        case TKT_AUP_CWA_FLX_3X:
        case TKT_AUP_CWA_FLX_3X_24:
        case TKT_AUP_FLX_3X:
        case TKT_TRI_FLX:
        case TKT_6UP_FLX:
        case TKT_TCE_FLX:
        case TKT_AUP_FLX_6X:
        case TKT_AUP_FLX_3X_NOS:
        case TKT_TRI_FLX_NOS:
        case TKT_6UP_FLX_NOS:
        case TKT_TCE_FLX_NOS:
        case TKT_AUP_FLX_6X_NOS:

        case TKT_AUP_FLX_3X_24: // Q309: 24 Starters
        case TKT_TRI_FLX_24: // Q309: 24 Starters
        case TKT_6UP_FLX_24: // Q309: 24 Starters
        case TKT_TCE_FLX_24: // Q309: 24 Starters
        case TKT_AUP_FLX_6X_24: // Q309: 24 Starters

        case TKT_AUP_FLX_3X_24_OS: //  Q110: Overseas
        case TKT_TRI_FLX_24_OS: //  Q110: Overseas
        case TKT_6UP_FLX_24_OS: //  Q110: Overseas
        case TKT_TCE_FLX_24_OS: //  Q110: Overseas
        case TKT_AUP_FLX_6X_24_OS: //  Q110: Overseas

        case TKT_QTT_FLX_OS:
        case TKT_QTT_FLX_NOS:
        case TKT_IWIN:
        case TKT_IWIN_OS:
        case TKT_6UP_FLX_34_OS: // double treble 6up oversea
        case TKT_TCE_FLX_34_OS: // tce oversea
        case TKT_AUP_CWA_FLX_3X_34_OS: // W/P/Q/CWA 3x oversea.
        case TKT_FCT_FLX: // fct local
        case TKT_FCT_FLX_34_OS: // fct oversea
        case TKT_AUP_FLX_3X_34_OS: // all up WPQ flexi bet 3x (Overseas Only)
        case TKT_TRI_FLX_34_OS: // all up TRIO flexi bet (Overseas Only)
        case TKT_AUP_FLX_6X_34_OS:
            startAt = 0;
            break;

        // the rest do not need to process value as they are using default
        case TKT_QPQTT_FLX_NOS:
        case TKT_QPQTT_FLX_OSNOS: // 	By YY Ngai, 06012014. MSR 2014. New bet slips for Quick Pick QTT (combined local and overseas)
        case TKT_QPTT:
        default:
            return status;
    }

    for (let i = 1; i < MAX_VAL_BOX + 1; i++) {
        switch (tktId) {
            case TKT_AUP_BWA_6X:
                if (valueTable[i + startAt] === 40000) {
                    // ticket ID 28 value jump from 40k to 50k snice 40K is not needed
                    startAt++;
                }
                break;
            case TKT_DM_TCE:
            case TKT_DM_TRIO:
                //        case TKT_TCS:       //  this checking was added here due to the accident on 20080917
                if (valueTable[i + startAt] === 400) {
                    startAt++;
                }
                break;
            case TKT_AUP_FLX_3X:
            case TKT_TRI_FLX:
            case TKT_6UP_FLX:
            case TKT_TCE_FLX:
            case TKT_AUP_FLX_6X:
            case TKT_AUP_CWA_FLX_3X:
            case TKT_AUP_CWA_FLX_3X_24:
            case TKT_IWIN:
            case TKT_IWIN_OS:
            case TKT_AUP_FLX_3X_NOS:
            case TKT_TRI_FLX_NOS:
            case TKT_6UP_FLX_NOS:
            case TKT_TCE_FLX_NOS:
            case TKT_AUP_FLX_6X_NOS:

            case TKT_AUP_FLX_3X_24: // Q309: 24 Starters
            case TKT_TRI_FLX_24: // Q309: 24 Starters
            case TKT_6UP_FLX_24: // Q309: 24 Starters
            case TKT_TCE_FLX_24: // Q309: 24 Starters
            case TKT_AUP_FLX_6X_24: // Q309: 24 Starters

            case TKT_AUP_FLX_3X_24_OS: // Q110: Overseas
            case TKT_TRI_FLX_24_OS: // Q110: Overseas
            case TKT_6UP_FLX_24_OS: // Q110: Overseas
            case TKT_TCE_FLX_24_OS: // Q110: Overseas
            case TKT_AUP_FLX_6X_24_OS: // Q110: Overseas

            //  by Ben Ou, on 2013/04/19. PSR2013, QTT. Accept larger id
            case TKT_QTT_FLX_OS:
            case TKT_QTT_FLX_NOS:
            case TKT_6UP_FLX_34_OS: // double treble 6up oversea
            case TKT_TCE_FLX_34_OS: // tce oversea
            case TKT_AUP_CWA_FLX_3X_34_OS: // W/P/Q/CWA 3x oversea.
            case TKT_FCT_FLX: // fct local
            case TKT_FCT_FLX_34_OS: // fct oversea
            case TKT_AUP_FLX_3X_34_OS: // all up WPQ flexi bet 3x (Overseas Only)
            case TKT_TRI_FLX_34_OS: // all up TRIO flexi bet (Overseas Only)
            case TKT_AUP_FLX_6X_34_OS:
                if (valueTable[i + startAt] === 3) {
                    // flexi bet does not need $3
                    startAt++;
                }
                break;

            case TKT_WIN_SIMPLE:
            case TKT_PLA_SIMPLE:
            case TKT_QIN_SIMPLE:
            case TKT_QPL_SIMPLE:
            case TKT_CWA_SIMPLE:
            case TKT_CWB_SIMPLE:
            case TKT_CWC_SIMPLE:
                if (
                    valueTable[i + startAt] === 40 ||
                    valueTable[i + startAt] === 400
                ) {
                    startAt++;
                }
                break;
            default:
                break;
        }
        if (td.value[i] === '1') {
            if (valueTable[i + startAt] >= 1000) {
                largeAmt = true;
            }
            if (valueTable[i + startAt] <= 50) {
                smallAmt = true;
            }
            total += valueTable[i + startAt];
        }
    }

    //  convert it to cint64 for storage
    const longTotal = total * 100;

    //    m_bFlexiBet = ticket.tktDtl()->addon_flag;
    if (betObj.IsFlexiBet) {
        betObj.BetTotal = Number(longTotal);
    } else {
        betObj.UnitBet = Number(longTotal);
    }
    // check unit bet value for OPT mode

    // now kiosk do not support OPT, so no need check
    // if (theTerminal.checkUnitValue()) {
    //     if (largeAmt && smallAmt) {
    //         status = ERROR_MSG.RID_EX_TKT_CHK_VALUE_MRK;
    //     }
    // }
    return status;
};

export const ticketDetailToBetObj = (req, res, next) => {
    const checkPoolStatus = req.checkPoolStatus;
    let status: string = ERROR_MSG.RID_NO_ERROR;
    const ticketDetail: TICKET_DETAIL = req.ticketDetail;
    const betObj: RacingBetObject = new RacingBetObject();
    status = setTrackDay(req, ticketDetail, betObj);

    if (status === ERROR_MSG.RID_NO_ERROR) {
        status = setRace(
            req.selectedTrack,
            ticketDetail,
            betObj,
            checkPoolStatus
        );
    }

    //  force this flag to false only for FF
    if (status === ERROR_MSG.RID_NO_ERROR && ticketDetail.pool[1] === FF) {
        ticketDetail.exot_flag = 0;
    }
    if (status === ERROR_MSG.RID_NO_ERROR && ticketDetail.addon_flag) {
        betObj.IsFlexiBet = true;
    }

    //  check if the pool is defined, check only exotic pools
    if (status === ERROR_MSG.RID_NO_ERROR) {
        if (ticketDetail.allup_flag === XPOOL) {
            betObj.PoolType = ALUP;
        } else {
            betObj.PoolType = ticketDetail.pool[1];
        }
    }

    //  if allup, validate the allup formula
    if (status === ERROR_MSG.RID_NO_ERROR) {
        //  check it by those constant defined in TTST.H
        if (ticketDetail.allup_flag || ticketDetail.allup_flag === XPOOL) {
            status = setFormula(ticketDetail, betObj);
        }
        if (
            status === ERROR_MSG.RID_NO_ERROR &&
            (betObj.PoolType === ALUP || betObj.PoolType === ATRIO)
        ) {
            for (let i = 0; i < betObj.Formula.Legs; i++) {
                if (ticketDetail.pool[1] === ATRIO) {
                    betObj.Legs[i].AllUpPoolType = TRIO;
                } else {
                    betObj.Legs[i].AllUpPoolType = ticketDetail.pool[1 + i];
                }
            }
        }
    }
    //  validate according to the pool's definition
    if (status === ERROR_MSG.RID_NO_ERROR) {
        if (is24Starters(ticketDetail.ticket_id)) {
            // Q309: 24 Starters
            status = setSelection(ticketDetail, 24, betObj, req.selectedTrack);
            // Logic of validation is a little bit different for 24 starters
        } else if (is34Starters(ticketDetail.ticket_id)) {
            status = setSelection(ticketDetail, 34, betObj, req.selectedTrack);
        } else {
            status = setSelection(ticketDetail, 14, betObj, req.selectedTrack);
        }

        //  check and update the bet value
        if (status === ERROR_MSG.RID_NO_ERROR) {
            status = setValue(ticketDetail, betObj);
        }

        if (status === ERROR_MSG.RID_NO_ERROR) {
            const betPool = betObj.PoolType;
            // QPQTT QPTT
            if (betPool === QPTT || betPool === QPQTT) {
                betObj.b_COMPUTER_QTT_TT = false;
                const resObj: ResponseObject = Object.assign(
                    {},
                    SUCCESS_RESPONSE,
                    {
                        body: betObj,
                    }
                );
                res.status(200).send(resObj);
                return;
            }
        }
    }
    if (status === ERROR_MSG.RID_NO_ERROR) {
        req.racingBetObject = betObj;
        req.enabledRaces =
            req.selectedTrack === null ? null : req.selectedTrack.EnabledRaces;
        next();
    } else {
        const resObj: ResponseObject = Object.assign({}, SUCCESS_RESPONSE);
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = status;
        res.status(200).send(resObj);
        return;
    }
};
