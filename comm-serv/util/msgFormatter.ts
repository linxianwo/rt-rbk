import { MarkSixBetObject } from '../../share/models/comm-serv/MarSix/MarkSixBetObject';
import {
    MK6_TYPE,
    GAME_TYPE,
    MK6_ENTRY_INDEX,
} from '../../share/models/comm-serv/MarSix/Enums';
import { RacingBetObject } from '../../share/models/comm-serv/Racing/RacingBetObject';
import { PoolSymbol } from '../../share/models/comm-serv/Racing/PoolType';
import {
    LegNo,
    QPTT_TYPE,
    TCEQTT_TYPE,
} from '../../share/models/comm-serv/Racing/Enums';
import { customer } from '../../share/main-proc/customer/customer';
import {
    CustomerType,
    CustomerLength,
} from '../../share/main-proc/customer/customer.enum';
import {
    MessageCode,
    Constansts,
    PCODE,
    ALLUP_TYPE,
    MaxValue,
    MSG_PCODE,
    SC_LEG_INDEX,
} from '../../share/models/comm-serv/CommonDefs';
import { Entry } from '../../share/models/comm-serv/Entry';
import { ByteArrayBuilder } from './byteArrayBuilder';
import { ComSvrException } from './comSvrException';
import {
    FootballBetObject,
    ODDS_INDICATION,
    SCBET_TYPE,
    Pool,
    Game,
    SHftCrsp,
    SHomeAwayDraw,
    SHandicap,
    SHandiHomeAwayDraw,
    SHighLow,
    SCornerHighLow,
    SCorrectScore,
    SHalfFullTime,
    STotalScore,
    SToQualify,
    SOddEven,
    SFirstScorer,
    SSpecial,
    TourGame,
    SChamp1stRun,
    SFinalist,
    SChampion,
    SGroupForecast,
    SGroupWinner,
    STopScorer,
} from '../../share/models/comm-serv/Football/FootballBetObject';
import { terminalConfig } from '../../share/main-proc/terminal-config/terminal-config';
import { internalParam } from '../../share/main-proc/internalParam/internalParam';
import { MSG_SIGN_ON } from '../../share/models/comm-serv/Messages';
import { kioskPlog } from '../../share/main-proc/kiosk-plog/kiosk-plog';
import { ERROR_MSG } from '../../share/models/response-common';

export class MsgFormatter {
    // private static TermConfig t = TermConfig.Instance;
    private static t = terminalConfig;
    constructor() {}
    //     //  Quick Pick TT message hard coded

    private static qpttSend: string[] = [
        'C@/C@/C@$A@.@@',
        'D@/C@/C@$A@.@@',
        'D@/D@/D@$B.@@',
        'A>C@/A>C@/A>C@$E.@@',
    ];

    private static qpqttSend: string[] = [
        'D@$$BD.@@',
        'E@$$AB@.@@',
        'F@$$CF@.@@',
    ];

    // Mark six formatter
    public static GetMarkSixMsgCodeBy(mk6: MarkSixBetObject): number {
        let msgCode = MessageCode.MC_NONE;
        const type = mk6.type;

        switch (type) {
            case MK6_TYPE.MK6_SINGLE:
            case MK6_TYPE.MK6_BANKER:
            case MK6_TYPE.MK6_MULTIPLE:
                msgCode = MessageCode.MC_MK6_S;
                break;
            case MK6_TYPE.MK6_4_SINGLES:
                msgCode = MessageCode.MC_MK6_M;
                break;
            case MK6_TYPE.MK6_RANDOM_SINGLES: //  by Jason Lau, 20100603, support Q310 MK6 requirement
                msgCode = MessageCode.MC_MK6_R;
                break; //        case MK6_TYPE.MK6_RANDOM_4_SINGLES:
            case MK6_TYPE.MK6_RANDOM_MULTIPLE:
                msgCode = MessageCode.MC_MK6_R;
                break;
            case MK6_TYPE.MK6_COMPUTER_RANDOM_BANKER:
            case MK6_TYPE.MK6_COMPUTER_RANDOM_MULTIPLE:
            case MK6_TYPE.MK6_COMPUTER_RANDOM_SINGLES:
                msgCode = MessageCode.MC_MK6_Q;
                break;
            default:
                break;
        }

        return msgCode;
    }

    public static SetMarkSixSMRBy(mk6: MarkSixBetObject): void {
        const type = mk6.type as MK6_TYPE;

        // switch (type) {
        //     case MK6_TYPE.MK6_SINGLE:
        //     case MK6_TYPE.MK6_BANKER:
        //     case MK6_TYPE.MK6_MULTIPLE:
        //         mk6.isSingle = true;
        //         break;
        //     case MK6_TYPE.MK6_4_SINGLES:
        //         mk6.is4Singles = true;
        //         break;
        //     case MK6_TYPE.MK6_RANDOM_SINGLES:      //  by Jason Lau, 20100603, support Q310 MK6 requirement
        //         mk6.isSingle = true;
        //         mk6.isRandom = true;
        //         break;                              //        case MK6_TYPE.MK6_RANDOM_4_SINGLES:
        //     case MK6_TYPE.MK6_RANDOM_MULTIPLE:
        //         mk6.isMultiple = true;
        //         mk6.isRandom = true;
        //         break;
        //     default:
        //         break;
        // }
    }

    public static FormatMarkSixMessage(
        msg: ByteArrayBuilder,
        msgCode: number,
        mk6: MarkSixBetObject
    ): boolean {
        let result = true;

        if (msgCode !== MessageCode.MC_NONE) {
            msg.AppendNewCust(customer.newCustomerFlag);
            msg.AppendMsgCode(msgCode); // MC_MK6_S:0x45 ; MC_MK6_M:(0x4c); MC_MK6_R:(0x4d)

            const lotType = mk6.lotteryType;
            const gmType = mk6.gmType;

            const btNewFormat = Constansts.LOT_NEW_FORMAT; // 0x71
            const nVerNum = 1; // version number
            let specialDraw = 0; //  normal draw : 0; special draw : 1
            const yr: number[] = [0x20, 0x20]; //  space by default
            const id: number[] = [0x20, 0x20, 0x20]; //  space by default
            if (mk6.isSnowBall) {
                specialDraw = 1;
            }
            //  by Jason Lau, 20100520
            //  Q310, support Partial Unit Investment
            if (mk6.isPui) {
                specialDraw = specialDraw | 0x08;
            }

            switch (mk6.type) {
                case MK6_TYPE.MK6_COMPUTER_RANDOM_SINGLES:
                case MK6_TYPE.MK6_COMPUTER_RANDOM_MULTIPLE:
                case MK6_TYPE.MK6_COMPUTER_RANDOM_BANKER:
                    specialDraw = specialDraw | 0x02;
                    break;
            }

            msg.AppendAscii(btNewFormat);
            msg.AppendBIN6(nVerNum);
            msg.AppendBIN6(lotType); // 0, 1? should always be 0
            msg.AppendBIN6(gmType);
            msg.AppendBIN6(specialDraw); // only use bit0,bit3
            msg.AppendFixStr(Buffer.from(yr), 2);
            msg.AppendSeparator();
            msg.AppendFixStr(Buffer.from(id), 3);
            msg.AppendSeparator();

            if (gmType === GAME_TYPE.GAME_NORMAL) {
                // || gmType == GAME_TYPE.GAME_ADD_ON
                result = this.FormatMk6Message(msg, mk6);
            }
            //                 else
            //                 {  // cc game
            //                     result = FormatCCGameMessage(msg, mk6);
            //                 }
        }

        return result;
    }

    private static FormatMk6Message(
        msg: ByteArrayBuilder,
        mk6: MarkSixBetObject
    ): boolean {
        const result = true;
        const numOfEntry = mk6.numOfEntries;
        const draws = mk6.numOfDraws;
        const quickPick = mk6.qpNumOfSeln;
        const selection: Entry = null;

        msg.AppendBIN6(draws);

        switch (mk6.type) {
            case MK6_TYPE.MK6_SINGLE:
            case MK6_TYPE.MK6_BANKER:
            case MK6_TYPE.MK6_MULTIPLE:
            case MK6_TYPE.MK6_COMPUTER_RANDOM_SINGLES:
            case MK6_TYPE.MK6_COMPUTER_RANDOM_MULTIPLE:
            case MK6_TYPE.MK6_COMPUTER_RANDOM_BANKER:
                if (mk6.bankers.selections.length > 0) {
                    // bankers
                    MsgFormatter.packSelection(msg, mk6.bankers); // memcpy(selection, mk6.bankers(), MAX_MARK6_SELN);
                    msg.AppendAscii(Constansts.BANKER_INDICATOR); // msg << CScmpOutAsciiChar('>');
                }

                if (mk6.isField) {
                    msg.AppendAscii(Constansts.FIELD_INDICATOR); // msg << CScmpOutAsciiChar(')');
                } else {
                    MsgFormatter.packSelection(
                        msg,
                        mk6.selections[MK6_ENTRY_INDEX.FIRST_ENTRY]
                    );
                    // memcpy(selection, mk6.selections(), MAX_MARK6_SELN);
                }
                break;
            case MK6_TYPE.MK6_4_SINGLES:
                for (const sel of mk6.selections) {
                    MsgFormatter.packSelection(msg, sel);
                    msg.AppendSeparator();
                }
                break;
            case MK6_TYPE.MK6_RANDOM_SINGLES:
                msg.AppendAscii(Constansts.SINGLE_SIGN); // CScmpOutAsciiChar('S');
                msg.AppendSeparator(); // << CScmpOutAsciiChar('/');
                // by Jason Lau, 20100602
                // support Q310 MK6 requirement
                // msg << CScmpOutN9(1, 4);
                //  << CScmpOutBin(1, nNumOfEntry);//msg << CScmpOutN9( 1, nNumOfEntry );
                // by Ben, 20160323 - MK6 enhancement, fix RCQ72451 the No.of entry should be type "B" not "9"
                msg.AppendBIN6(numOfEntry);
                break;
            case MK6_TYPE.MK6_RANDOM_MULTIPLE:
                msg.AppendAscii(Constansts.MULTIPLE_SIGN);
                // msg << CScmpOutAsciiChar('M');
                msg.AppendSeparator();
                // msg << CScmpOutAsciiChar('/');
                msg.AppendBIN6(quickPick);
                // msg << CScmpOutBin(1, quickPick);
                break;
            default:
                break;
        }
        // mk6 random
        // if (mk6.isRandom) {// || mk6.isQp
        //     // x single-entries
        //     if (mk6.isSingle) { // if (mk6.qpNumOfSeln == 6)  || (MK6_TYPE)mk6.type == MK6_TYPE.MK6_RANDOM_SINGLES
        //         msg.AppendAscii(Constansts.SINGLE_SIGN); // CScmpOutAsciiChar('S');
        //         msg.AppendSeparator(); // << CScmpOutAsciiChar('/');
        //         //  by Jason Lau, 20100602
        //         //  support Q310 MK6 requirement
        //         //            msg << CScmpOutN9( 1, 4 );
        //         // << CScmpOutBin(1, nNumOfEntry);//msg << CScmpOutN9( 1, nNumOfEntry );
        //         // by Ben, 20160323-MK6 enhancement, fix RCQ72451 the No. of entry should be type "B" not "9"
        //         msg.AppendBIN6(numOfEntry);
        //     } else if (mk6.isMultiple) {//// 1 multiple-entries || (MK6_TYPE)mk6.type == MK6_TYPE.MK6_RANDOM_MULTIPLE
        //         msg.AppendAscii(Constansts.MULTIPLE_SIGN);
        //         // msg << CScmpOutAsciiChar('M');
        //         msg.AppendSeparator();
        //         // msg << CScmpOutAsciiChar('/');
        //         msg.AppendBIN6(quickPick);
        //         // msg << CScmpOutBin(1, quickPick);
        //     }
        // } else {// mk6 single, multiple, banker, multi-single

        //     if (mk6.is4Singles) { // (MK6_TYPE)mk6.type == MK6_TYPE.MK6_4_SINGLES
        //         for (let i = 0; i < mk6.selections.length; i++) {
        //             // memcpy(selection, mk6.selections(i), MAX_MARK6_SELN);
        //             selection = mk6.selections[i];
        //             MsgFormatter.packSelection(msg, selection);
        //             msg.AppendSeparator();
        //             // msg << CScmpOutAsciiChar('/');
        //         }
        //     } else if (mk6.isSingle) {
        //         // bankers
        //         if (mk6.hasBanker) {
        //             // memcpy(selection, mk6.bankers(), MAX_MARK6_SELN);
        //             selection = mk6.bankers;
        //             MsgFormatter.packSelection(msg, selection);
        //             msg.AppendAscii(Constansts.BANKER_INDICATOR);
        //             // msg << CScmpOutAsciiChar('>');
        //         }

        //         if (mk6.isField) {
        //             msg.AppendAscii(Constansts.FIELD_INDICATOR);
        //             // msg << CScmpOutAsciiChar(')');
        //         } else {
        //             selection = mk6.selections[MK6_ENTRY_INDEX.FIRST_ENTRY];
        //             // memcpy(selection, mk6.selections(), MAX_MARK6_SELN);
        //             MsgFormatter.packSelection(msg, selection);
        //         }
        //     }
        // }
        msg.AppendMoney(0);
        // msg << CScmpOutMoney(0L);

        return result;
    }
    // endregion

    // region Racing formatter
    public static FormatPlaceRacingMessage(
        msg: ByteArrayBuilder,
        bet: RacingBetObject
    ): boolean {
        const result = true;
        msg.AppendNewCust(customer.newCustomerFlag);
        msg.AppendMsgCode(MessageCode.MC_BET);
        msg.AppendAscii(bet.Meeting);
        msg.AppendAscii(bet.RaceDay);
        if (RacingBetObject.IsAllup(bet)) {
            msg.AppendAscii(PoolSymbol.ALUP);
        } else {
            msg.AppendAscii(bet.PoolType);
        }
        // region AllUp
        if (RacingBetObject.IsAllup(bet)) {
            const combs = bet.Formula.Combs;
            const legs = bet.Formula.Legs;
            msg.AppendN9(legs);
            msg.AppendSeparator(Constansts.EVENT_SEP);
            msg.AppendN9(combs);
            msg.AppendSeparator();
        }
        // endregion

        const isMultiLegs = bet.Legs.length > 1 ? true : false;
        for (let i = 0; i < bet.Legs.length; i++) {
            const currLeg = bet.Legs[i];
            //  to convert to individual pool for xpool
            let tmpPool = bet.PoolType;
            if (RacingBetObject.IsAllup(bet)) {
                tmpPool = currLeg.AllUpPoolType;
            }

            if (
                tmpPool === PoolSymbol.TT &&
                bet.b_COMPUTER_QTT_TT &&
                i === LegNo.ForthLeg
            ) {
                msg.AppendSeparator('|');
            } else if (isMultiLegs && i !== LegNo.FirstLeg) {
                msg.AppendSeparator(); // leg separator
            }

            switch (tmpPool) {
                case PoolSymbol.WIN:
                case PoolSymbol.PLA:
                case PoolSymbol.WP:
                // case PoolSymbol.AWIN:
                // case PoolSymbol.APLA:
                // case PoolSymbol.AWP:
                case PoolSymbol.DBL:
                case PoolSymbol.TBL:
                case PoolSymbol.SIXUP:
                case PoolSymbol.BWA:
                case PoolSymbol.BWB:
                case PoolSymbol.BWC:
                case PoolSymbol.BWD:
                case PoolSymbol.CWA: // by ben 14/2/27, cw add cases
                case PoolSymbol.CWB:
                case PoolSymbol.CWC:
                    // race must be inputted in FIRST_LEG
                    // and while it is a all-up pool
                    //
                    if (i === LegNo.FirstLeg || RacingBetObject.IsAllup(bet)) {
                        msg.AppendBIN6(currLeg.RaceNo);
                        msg.AppendSeparator(Constansts.RACE_SEP);
                    }
                    //  for all-up
                    if (RacingBetObject.IsAllup(bet)) {
                        msg.AppendAscii(currLeg.AllUpPoolType);
                    }
                    if (currLeg.IsFieldSelected) {
                        msg.AppendSeparator(Constansts.FIELD_INDICATOR);
                    } else {
                        for (const horseNo of currLeg.Selections) {
                            msg.AppendBIN6(horseNo);
                        }
                    }
                    break;

                case PoolSymbol.QIN:
                case PoolSymbol.QPL:
                case PoolSymbol.QQP:
                // case PoolSymbol.AQIN:
                // case PoolSymbol.AQPL:
                // case PoolSymbol.AQQP:
                case PoolSymbol.IWN:
                    // Race No.
                    if (i === LegNo.FirstLeg || RacingBetObject.IsAllup(bet)) {
                        msg.AppendBIN6(currLeg.RaceNo);
                        msg.AppendSeparator(Constansts.RACE_SEP);
                    }
                    //  for all-up
                    if (RacingBetObject.IsAllup(bet)) {
                        msg.AppendAscii(currLeg.AllUpPoolType);
                    }
                    if (currLeg.Bankers.length > 0) {
                        for (const banker of currLeg.Bankers) {
                            msg.AppendBIN6(banker);
                        }
                        msg.AppendSeparator(Constansts.BANKER_INDICATOR);
                    }
                    // Selections
                    if (currLeg.IsFieldSelected) {
                        msg.AppendSeparator(Constansts.FIELD_INDICATOR);
                    } else {
                        for (const horseNo of currLeg.Selections) {
                            msg.AppendBIN6(horseNo);
                        }
                    }
                    break;

                // case PoolSymbol.ATRIO:
                case PoolSymbol.DT:
                case PoolSymbol.TT:
                case PoolSymbol.FF:
                    if (i === LegNo.FirstLeg || RacingBetObject.IsAllup(bet)) {
                        msg.AppendBIN6(currLeg.RaceNo);
                        msg.AppendSeparator(Constansts.RACE_SEP);
                    }
                    //  Bankers
                    if (currLeg.Bankers.length > 0) {
                        for (const banker of currLeg.Bankers) {
                            msg.AppendBIN6(banker);
                        }
                        msg.AppendSeparator(Constansts.BANKER_INDICATOR);
                    }
                    // Selections
                    if (currLeg.IsFieldSelected) {
                        msg.AppendSeparator(Constansts.FIELD_INDICATOR);
                    } else {
                        for (const horseNo of currLeg.Selections) {
                            msg.AppendBIN6(horseNo);
                        }
                    }
                    break;
                case PoolSymbol.QPTT:
                    let entry = 1; // default value:1
                    if (currLeg.QuickPickType === QPTT_TYPE.QPTT_A) {
                        entry = 2;
                    }
                    msg.AppendBIN6(entry);
                    // msg << CScmpOutBin(1, bet.numOfEntryOfQptt());          // only one entry per bet
                    msg.AppendBIN6(currLeg.RaceNo);
                    msg.AppendSeparator(Constansts.RACE_SEP);
                    msg.AppendFixStr(
                        MsgFormatter.qpttSend[currLeg.QuickPickType - 1]
                    );
                    return true;
                    break;
                case PoolSymbol.QPQTT:
                    msg.AppendBIN6(1); // in this stage, support 1 entry only
                    msg.AppendBIN6(currLeg.RaceNo);
                    msg.AppendSeparator(Constansts.RACE_SEP);
                    msg.AppendFixStr(
                        MsgFormatter.qpqttSend[currLeg.QuickPickType - 1]
                    );
                    return true;
                    break;
                case PoolSymbol.TRIO:
                    msg.AppendBIN6(currLeg.RaceNo);
                    msg.AppendSeparator(Constansts.RACE_SEP);
                    //  for all-up
                    if (RacingBetObject.IsAllup(bet)) {
                        msg.AppendAscii(currLeg.AllUpPoolType);
                    }
                    //  Bankers
                    if (currLeg.Bankers.length > 0) {
                        for (const banker of currLeg.Bankers) {
                            msg.AppendBIN6(banker);
                        }
                        msg.AppendSeparator(Constansts.BANKER_INDICATOR);
                    }
                    // Selections
                    if (currLeg.IsFieldSelected) {
                        msg.AppendSeparator(Constansts.FIELD_INDICATOR);
                    } else {
                        for (const horseNo of currLeg.Selections) {
                            msg.AppendBIN6(horseNo);
                        }
                    }
                    break;
                case PoolSymbol.TCE:
                case PoolSymbol.QTT: //  by Ben Ou, on 2013/03/26. PSR2013, QTT. Format qtt message
                case PoolSymbol.FCT:
                    if (!MsgFormatter.FormatTCEMessage(msg, bet, i)) {
                        return false;
                    }
                    break;

                default:
                    throw new ComSvrException(
                        ERROR_MSG.RID_EX_TKT_POOL_NOT_DEFINE
                    );
                    break;
            }
        }
        if (bet.PoolType !== PoolSymbol.QPTT) {
            // QPTT has hard code value set
            if (bet.IsFlexiBet) {
                msg.AppendSeparator(Constansts.DOLLAR_SIGN);
                msg.AppendMoney(bet.BetTotal);
            } else {
                msg.AppendMoney(bet.UnitBet); // should have no pay amount
            }
        }

        if (bet.b_COMPUTER_QTT_TT) {
            msg.AppendSeparator(Constansts.CHAR_SLASH);
            msg.AppendBIN6(0x41);
        }
        return result;
    }
    // endregion

    //     // region FootBall formatter
    public static FormatScBetMsg(
        msg: ByteArrayBuilder,
        scbet: FootballBetObject,
        indicator: number
    ): number {
        msg.AppendNewCust(customer.newCustomerFlag);
        msg.AppendMsgCode(MessageCode.MC_SC_BET);

        indicator = this.FormatScIndicator(msg, scbet, indicator);
        this.FormatScAllupCombination(msg, scbet);
        if (scbet.scBetType === SCBET_TYPE.MATCH_BET) {
            this.formatSelections(msg, scbet);
        } else if (scbet.scBetType === SCBET_TYPE.TOUR_BET) {
            this.formatTGameSelections(msg, scbet);
        }

        msg.AppendMoney(scbet.unitBet);
        // if (scbet.bConfimedByUser) {
        //     const ctID = scbet.counterOfferID.toBytesLE();
        //     for (let i = 0; i < ctID.length; i++) {
        //         msg.AppendAscii(ctID[i]);
        //     }
        // }

        return indicator;
    }
    //     // endregion

    //     // endregion

    //     // region 3-CustomerServ
    public static FormatESCAccountAccessMessage(
        msg: ByteArrayBuilder
    ): boolean {
        // New cust flag must be append before the msg code
        msg.AppendNewCust(customer.newCustomerFlag);
        msg.AppendMsgCode(MessageCode.MC_ESC);

        msg.AppendFixStr(Constansts.MSC_SUBCODE_ESC_ACCT_ACS); // ESC subcode -- 01 -- H
        msg.AppendN9Ascii(this.t.branchNumber, 4); // centre #(Branh number)
        msg.AppendN9Ascii(this.t.windowNumber, 3); // window number

        msg.AppendFixStr('0000000000000000'); // Card number for eWallet -- H
        // msg.AppendFixStr(0.ToString("00")); // CMS reject code -- 0 -- N
        // msg.AppendFixStr('00'); // CMS reject code -- 0 -- N
        // msg.AppendSeparator('!');
        // msg.AppendN9(2, 1); // Card type for eWallet -- 2 -- 9

        // TODO: Formatting QR code value into this message when QR code scanner service is done.
        // QR type -- length is 2 -- 9
        // QR code session ID -- length is 10 -- 9
        // QR code hash value -- length is 64 -- X

        return true;
    }

    public static FormatESCAccountReleaseMessage(
        msg: ByteArrayBuilder /*, MSG_ESC_REL escRelease*/
    ): boolean {
        // New cust flag must be append before the msg code
        msg.AppendNewCust(false);
        msg.AppendMsgCode(MessageCode.MC_ESC);

        msg.AppendFixStr(Constansts.MSC_SUBCODE_ESC_ACCT_REL); // ESC subcode
        msg.AppendN9Ascii(this.t.branchNumber, 4); // centre #(Branh number)
        msg.AppendN9Ascii(this.t.windowNumber, 3); // window number
        msg.AppendFixStr('0000000000000000'); // Account number
        msg.AppendN9(0, 1); // Release code
        // QR code session ID -- length is 10 -- 9
        // msg.AppendNF(customer.AccountNumber); // QRC account number -- length is 8 -- 9
        // Customer.Instance.History    // First txn
        // Customer.Instance.History    // Last txn
        msg.AppendMoney(customer.SellTotal); // Bet amount
        msg.AppendMoney(customer.Deposit); // Top-up amount
        msg.AppendMoney(customer.TotalWithdrawal); // Cash-out amount
        msg.AppendMoney(customer.Balance); // Balance
        return true;
    }
    public static FormatQRCAccountAccessMessage(
        msg: ByteArrayBuilder,
        para: string[]
    ): boolean {
        // New cust flag must be append before the msg code
        msg.AppendNewCust(customer.newCustomerFlag);
        msg.AppendMsgCode(MessageCode.MC_ESC);

        msg.AppendFixStr(Constansts.MSC_SUBCODE_QRC_ACCT_ACS, 2); // ESC subcode -- 01 -- H
        msg.AppendN9Ascii(this.t.branchNumber, 4); // centre #(Branh number)
        msg.AppendN9Ascii(this.t.windowNumber, 3); // window number
        msg.AppendFixStr('0000000000000000', 16); // Card number for eWallet -- H
        // msg.AppendFixStr(0.ToString("00")); // CMS reject code -- 0 -- N
        // msg.AppendFixStr('00'); // CMS reject code -- 0 -- N
        // msg.AppendSeparator('!');
        // msg.AppendN9(2, 1); // Card type for eWallet -- 2 -- 9

        // TODO: Formatting QR code value into this message when QR code scanner service is done.
        // QR type -- length is 2 -- 9
        // QR code session ID -- length is 10 -- 9
        // QR code hash value -- length is 64 -- X
        msg.AppendFixStr(para[0], 68);
        return true;
    }

    public static FormatQRCAccountReleaseMessage(
        msg: ByteArrayBuilder,
        para: string[] /*, MSG_ESC_REL escRelease*/
    ): boolean {
        // New cust flag must be append before the msg code
        msg.AppendNewCust(false);
        msg.AppendMsgCode(MessageCode.MC_ESC);
        msg.AppendFixStr(Constansts.MSC_SUBCODE_QRC_ACCT_REL, 2); // ESC subcode
        msg.AppendN9Ascii(this.t.branchNumber, 4); // centre #(Branh number)
        msg.AppendN9Ascii(this.t.windowNumber, 3); // window number
        msg.AppendFixStr('0000000000000000', 16); // Card number for eWallet

        msg.AppendN9(customer.ReleaseCode, 1); // relese code: 0-normal, 1-card removed, 2-EFT time-out/unpost
        // QR code session ID -- length is 10 -- 9
        msg.AppendFixStr(para[0], 68); // QR code value with checksum length=68
        msg.AppendFixStr(customer.AccountNumber, 8); // QRC account number -- length is 8 -- 9
        // Customer.Instance.History    // First txn
        // Customer.Instance.History    // Last txn
        // if ( Customer.Instance.History.getCount ) weitigong
        let firstTxn = '0000';
        const lastTxn = '0000';
        if (customer.history.iCount >= 2) {
            firstTxn = customer.getAccountAccessTXN();
            // lastTxn = customer.setAccountAccessTXN;
        }
        msg.AppendFixStr(firstTxn, 4);
        msg.AppendFixStr(lastTxn, 4);

        msg.AppendMoney(customer.SellTotal); // Bet amount
        msg.AppendMoney(customer.PayTotal); // Top-up amount
        msg.AppendMoney(customer.TotalWithdrawal); // Cash-out amount
        msg.AppendMoney(customer.Balance); // Balance
        return true;
    }

    public static FormatPayBetMessage(
        msg: ByteArrayBuilder,
        param: object /*string tsn, PayMethod method*/
    ): boolean {
        const obj = param as string[];
        const tsn = obj[0];
        if (tsn.length > MaxValue.MAX_TSN_LEN_19) {
            return false;
        }

        msg.AppendNewCust(customer.newCustomerFlag);
        msg.AppendMsgCode(MessageCode.MC_PAY);
        msg.AppendNF(tsn);
        msg.AppendSeparator();

        const method = parseInt(obj[1], 10);
        msg.AppendN9(method, 1);
        msg.AppendSeparator();
        msg.AppendN9(Constansts.PPF_RACE | Constansts.PPF_FLEXI, 1); // What's FLIXI ???

        return true;
    }

    public static FormatTbDepositMessage(
        msg: ByteArrayBuilder,
        param: object /*string accountNumber, long amount*/
    ): boolean {
        const obj = param as string[];
        const accountNumber = obj[0];
        if (accountNumber.length !== CustomerLength.TB_ACCOUNT_LENGTH) {
            return false;
        }

        msg.AppendNewCust(customer.newCustomerFlag);
        msg.AppendMsgCode(MessageCode.MC_TBD);
        msg.AppendFixStr(accountNumber, CustomerLength.TB_ACCOUNT_LENGTH);

        const amount = parseInt(obj[1], 10);
        msg.AppendMoney(amount);
        return true;
    }
    //     // endregion

    //     // region 4-RPCDelegate

    //     // endregion

    //     // region 5-StaffServ
    public static FormatSignOnMessage(
        msg: ByteArrayBuilder,
        signOn: MSG_SIGN_ON
    ): boolean {
        const result = false;

        msg.AppendNewCust(true); // setNewCust(true);
        msg.AppendMsgCode(MessageCode.MC_SIGN_ON); // setMsgCode( MC_SIGN_ON );
        const staffIDN9_str = msg.ConvertToN9(signOn.staffId);
        msg.AppendFixStr(staffIDN9_str, 6); // operator number
        msg.AppendSeparator();
        msg.AppendN9(parseInt(this.t.branchNumber, 10), 4); // centre #(Branh number)
        msg.AppendSeparator();
        msg.AppendN9(parseInt(this.t.windowNumber, 10), 3); // window number
        msg.AppendSeparator();
        const staffPinN9_str = msg.ConvertToN9(signOn.staffPin);
        msg.AppendFixStr(staffPinN9_str, 6); // operator pin
        msg.AppendSeparator();
        msg.AppendN9(0, 6); // supervisor #
        msg.AppendSeparator();
        msg.AppendN9(0, 6); // supervisor pin
        msg.AppendSeparator();
        msg.AppendN9(this.t.onCourse ? 1 : 0, 1); // on-off course
        msg.AppendSeparator();
        msg.AppendN9(Number.parseInt(this.t.version), 2); // app version
        msg.AppendSeparator();

        let appVersion = Number.parseInt(this.t.version); // = t.InternalParam.Version;
        // region receiptVersion
        let receiptVersion = this.t.receiptVersion; // = t.InternalParam.ReceiptVersion;
        if (receiptVersion === 0) {
            msg.AppendN9(appVersion, 2); // app version
        } else {
            msg.AppendN9(receiptVersion, 2); // slides version
        }
        msg.AppendSeparator();
        // endregion

        // region slidesVersion
        let slidesVersion = this.t.slideVersion; // = t.InternalParam.SlidesVersion;
        // var slidesVersion = 20; // call theTerminal interface
        if (slidesVersion === 0) {
            msg.AppendN9(appVersion, 2); // app version
        } else {
            msg.AppendN9(slidesVersion, 2); // slides version
        }
        msg.AppendSeparator();
        // endregion

        // region currentDate

        //  DateTime currentDate = new DateTime(1981, 12, 25, 10, 15, 18);

        msg.AppendDDMMMYY(new Date(internalParam.currentDate)); // = t.InternalParam.CurrentDate);
        msg.AppendSeparator();
        // endregion

        // region NGBT_SVT
        // if (t.InternalParam.Machine == MachineType.MACH_MTBT)
        // {
        //     if (t.Config.TerminalType == TermType.TERM_SVT)
        //     {
        //         msg.AppendN9(Constansts.MTBT_SVT, 1);
        //         msg.AppendSeparator();
        //     }
        //     else
        //     {
        //         msg.AppendN9(Constansts.MTBT_OPT, 1);
        //         msg.AppendSeparator();
        //     }
        // }
        // else
        // {
        //     if (t.Config.TerminalType == TermType.TERM_SVT)
        //     {
        msg.AppendN9(Constansts.KIOSK, 1);
        msg.AppendSeparator();
        //     }
        //     else
        //     {
        //         msg.AppendN9(Constansts.NGBT_OPT, 1);
        //         msg.AppendSeparator();
        //     }
        // }
        // endregion

        msg.AppendAscii(Constansts.DOLLAR_SIGN);

        // # region minTicketTotal
        // var minTicketTotal = 10;
        const minTicketTotal = 10; // = this.t.configs.supervisorConfig..MinTicketTotal;
        msg.AppendN9(minTicketTotal, String(minTicketTotal).length);

        // endregion

        return result;
    }
    public static FormatSignOffMessage(
        msg: ByteArrayBuilder,
        shroffSignOff: boolean
    ): boolean {
        let result = false;
        msg.AppendNewCust(true); // setNewCust(true);
        msg.AppendMsgCode(MessageCode.MC_SIGN_OFF); // setMsgCode( MC_SIGN_OFF );
        //  signoff statistic
        //

        msg.AppendFixStr(msg.ConvertInt2BCD(0), 3); // ConvertInt2BCD(0) 0
        // msg << CScmpOutFixStr(3, convertInt2Bcd(theErrorLog.getCount(ERRLOG_ESC_READ), tmp));
        msg.AppendFixStr(msg.ConvertInt2BCD(0), 3);
        // msg << CScmpOutFixStr(3, convertInt2Bcd(theErrorLog.getCount(ERRLOG_ESC_WRITE), tmp));
        msg.AppendFixStr(msg.ConvertInt2BCD(0), 3);
        // msg << CScmpOutFixStr(3, convertInt2Bcd(theErrorLog.getCount(ERRLOG_ESC_DATA), tmp));
        msg.AppendFixStr(msg.ConvertInt2BCD(0), 3);
        // msg << CScmpOutFixStr(3, convertInt2Bcd(theErrorLog.getCount(ERRLOG_MAG_READ), tmp));
        msg.AppendFixStr(msg.ConvertInt2BCD(0), 3);
        // msg << CScmpOutFixStr(3, convertInt2Bcd(theErrorLog.getCount(ERRLOG_MAG_DATA), tmp));
        msg.AppendFixStr(msg.ConvertInt2BCD(kioskPlog.printedReceipt), 3);
        // msg << CScmpOutFixStr(3, convertInt2Bcd(theErrorLog.getCount(ERRLOG_PRINTED_RCPT), tmp));  //  no. of receipt printed
        msg.AppendFixStr(msg.ConvertInt2BCD(kioskPlog.paperOut), 3);
        // msg << CScmpOutFixStr(3, convertInt2Bcd(theErrorLog.getCount(ERRLOG_PAPER_OUT), tmp));
        msg.AppendFixStr(msg.ConvertInt2BCD(kioskPlog.printerFault), 3);
        // msg << CScmpOutFixStr(3, convertInt2Bcd(theErrorLog.getCount(ERRLOG_PRINTER_FAULT), tmp));  //  all printer error excluding paper out
        msg.AppendFixStr(msg.ConvertInt2BCD(kioskPlog.scanFed), 3);
        // msg << CScmpOutFixStr(3, convertInt2Bcd(theErrorLog.getCount(ERRLOG_SCAN_FEED), tmp));  //  no. of ticket fed in
        msg.AppendFixStr(msg.ConvertInt2BCD(kioskPlog.scanJammed), 3);
        // msg << CScmpOutFixStr(3, convertInt2Bcd(theErrorLog.getCount(ERRLOG_SCAN_JAMED), tmp));
        msg.AppendFixStr(msg.ConvertInt2BCD(kioskPlog.scanRead), 3);
        // msg << CScmpOutFixStr(3, convertInt2Bcd(theErrorLog.getCount(ERRLOG_SCAN_READ), tmp));  //  no. of tickets that scanner recognised as invalid
        msg.AppendFixStr(msg.ConvertInt2BCD(kioskPlog.tktMarking), 3);
        // msg << CScmpOutFixStr(3, convertInt2Bcd(theErrorLog.getCount(ERRLOG_TKT_MARKING), tmp));  //  no. of valid tickets that reject betting rules
        msg.AppendFixStr(msg.ConvertInt2BCD(0), 3);
        // msg << CScmpOutFixStr(3, convertInt2Bcd(theErrorLog.getCount(ERRLOG_NVRAM_RW), tmp));  //  read data from buffer or write data in buffer failed
        msg.AppendFixStr(msg.ConvertInt2BCD(0), 3);
        // msg << CScmpOutFixStr(3, convertInt2Bcd(theErrorLog.getCount(ERRLOG_NVRAM_IO), tmp));  //  access NVRAM (the actual HW) directly failed
        msg.AppendFixStr(msg.ConvertInt2BCD(0), 3);
        // msg << CScmpOutFixStr(3, convertInt2Bcd(theErrorLog.getCount(ERRLOG_PINPAD), tmp));
        msg.AppendFixStr(msg.ConvertInt2BCD(0), 3);
        // msg << CScmpOutFixStr(3, convertInt2Bcd(theErrorLog.getCount(ERRLOG_ACCESORY_1), tmp));  //  sysmon IO
        msg.AppendFixStr(msg.ConvertInt2BCD(0), 3);
        // msg << CScmpOutFixStr(3, convertInt2Bcd(theErrorLog.getCount(ERRLOG_ACCESORY_2), tmp));  //  common scanner error
        msg.AppendFixStr(msg.ConvertInt2BCD(0), 3);
        // msg << CScmpOutFixStr(3, convertInt2Bcd(theErrorLog.getCount(ERRLOG_ACCESORY_3), tmp));  //  tkt sell count

        msg.AppendFixStr(msg.ConvertInt2BCD(0), 3);
        // msg << CScmpOutFixStr(3, convertInt2Bcd(theErrorLog.getCount(ERRLOG_RESERVE_1), tmp));
        msg.AppendFixStr(msg.ConvertInt2BCD(0), 3); // 20
        // msg << CScmpOutFixStr(3, convertInt2Bcd(theErrorLog.getCount(ERRLOG_RESERVE_2), tmp));
        msg.AppendSeparator();
        //     if (t.Config.TerminalType == TermType.TERM_SVT)
        //     {
        msg.AppendN9(0, 1);
        //     }
        //     else
        //     {
        //         if (shroffSignOff)
        //             msg.AppendN9(1, 1);  //  shroff
        //         else
        //             msg.AppendN9(0, 1); //  term then
        //     }

        return result;
    }

    public static FormatChangePasswordMessage(
        msg: ByteArrayBuilder,
        para: string[]
    ): boolean {
        let result = false;

        const obj: string[] = para;
        const staffID = obj[0];
        const oldPassword = obj[1];
        const newPassword = obj[2];

        msg.AppendNewCust(false);
        msg.AppendMsgCode(MessageCode.MC_CHANGE_PSWD);
        const staffIDN9_str = msg.ConvertToN9(staffID);
        msg.AppendFixStr(staffIDN9_str, 6);
        msg.AppendSeparator();
        const staffOldPinN9_str = msg.ConvertToN9(oldPassword);
        msg.AppendFixStr(staffOldPinN9_str);
        msg.AppendSeparator();
        const staffNewPinN9_str = msg.ConvertToN9(newPassword);
        msg.AppendFixStr(staffNewPinN9_str);

        result = true;

        return result;
    }
    public static FormatGetStaffAuthorityMessage(
        msg: ByteArrayBuilder,
        para: string[]
    ): boolean {
        // ]@@@@@@/IIIIII/A
        let result = false;

        const obj: string[] = para;
        const staffID = obj[0];
        const password = obj[1];
        const rqtPurpose = obj[2]; // int.Parse(obj[2]);

        msg.AppendNewCust(customer.newCustomerFlag);
        msg.AppendMsgCode(MessageCode.MC_AUTHMASK);
        const staffIDN9_str = msg.ConvertToN9(staffID);
        msg.AppendFixStr(staffIDN9_str, 6);
        msg.AppendSeparator();
        const staffPinN9_str = msg.ConvertToN9(password);
        msg.AppendFixStr(staffPinN9_str, 6);
        msg.AppendSeparator();
        msg.AppendBIN6(Number.parseInt(rqtPurpose));

        result = true;

        return result;
    }
    //     // endregion

    //     // region 6-TerminalServ

    //     // endregion

    //     // region Private Member
    private static packSelection(
        msg: ByteArrayBuilder,
        seln: Entry,
        firstIndex = 0
    ) {
        for (let index = firstIndex; index < seln.selections.length; ++index) {
            msg.AppendBIN6(seln.selections[index]);
        }
    }

    //     private static string ConvertInt2BCD(int i)
    //     {
    //         byte[] bytes = new byte[3];
    //         bytes[2] = ShortToBCD(i, 12);
    //         bytes[1] = ShortToBCD(i, 6);
    //         bytes[0] = ShortToBCD(i, 0);
    //         return Encoding.ASCII.GetString(bytes);
    //     }
    //     private static byte ShortToBCD(int i, int shiftRNumber)
    //     {

    //         byte BCD6Mask = 0x40;
    //         int currNum = (i >> shiftRNumber);
    //         byte sixBit = (byte)(currNum & 0x3f);
    //         return (byte)(sixBit | BCD6Mask);

    //     }

    private static FormatTCEMessage(
        msg: ByteArrayBuilder,
        bet: RacingBetObject,
        legNo: number
    ): boolean {
        const currLeg = bet.Legs[legNo];
        msg.AppendBIN6(currLeg.RaceNo);
        msg.AppendSeparator(Constansts.RACE_SEP);

        const t = currLeg.TceQttType;
        switch (t) {
            case TCEQTT_TYPE.TCE_SINGLE:
            case TCEQTT_TYPE.QTT_SINGLE:
            case TCEQTT_TYPE.FCT_SINGLE:
                // region TCE_SINGLE & QTT_SINGLE
                // TCE_SINGLE:only three horses
                // QTT_SINGLE:only four horses
                for (const horseNo of currLeg.Selections) {
                    msg.AppendBIN6(horseNo);
                }
                // endregion
                break;
            case TCEQTT_TYPE.TCE_MULTIPLE:
            case TCEQTT_TYPE.QTT_MULTIPLE:
            case TCEQTT_TYPE.FCT_MULTIPLE:
                // region TCE_MULTIPLE & QTT_MULTIPLE
                //  Bankers
                if (currLeg.Bankers.length > 0) {
                    for (const banker of currLeg.Bankers) {
                        msg.AppendBIN6(banker);
                    }
                    msg.AppendSeparator(Constansts.BANKER_INDICATOR);
                }
                // Selections
                if (currLeg.IsFieldSelected) {
                    msg.AppendSeparator(Constansts.FIELD_INDICATOR);
                } else {
                    for (const horseNo of currLeg.Selections) {
                        msg.AppendBIN6(horseNo);
                    }
                }
                msg.AppendSeparator(Constansts.MULTIPLE_INDICATOR);
                // endregion
                break;
            case TCEQTT_TYPE.TCE_BANKER:
            case TCEQTT_TYPE.TCE_BANKER_MULT:
            case TCEQTT_TYPE.QTT_BANKER:
            case TCEQTT_TYPE.QTT_BANKER_MULT:
            case TCEQTT_TYPE.FCT_BANKER:
            case TCEQTT_TYPE.FCT_BANKER_MULT:
                // region TCE_BANKER & TCE_BANKER_MULT & QTT_BANKER & QTT_BANKER_MULT
                //  Bankers
                if (currLeg.Bankers.length > 0) {
                    for (const banker of currLeg.Bankers) {
                        msg.AppendBIN6(banker);
                    }
                    msg.AppendSeparator(Constansts.BANKER_INDICATOR);
                }
                // Selections
                if (currLeg.IsFieldSelected) {
                    msg.AppendSeparator(Constansts.FIELD_INDICATOR);
                } else {
                    for (const horseNo of currLeg.Selections) {
                        msg.AppendBIN6(horseNo);
                    }
                }
                if (
                    t === TCEQTT_TYPE.TCE_BANKER_MULT ||
                    t === TCEQTT_TYPE.QTT_BANKER_MULT ||
                    t === TCEQTT_TYPE.FCT_BANKER_MULT
                ) {
                    msg.AppendSeparator(Constansts.MULTIPLE_INDICATOR);
                }
                // endregion
                break;
            case TCEQTT_TYPE.FCT_MULT_BANKER: // seft selection
                const firstSelectionE =
                    currLeg.SSBankers[Constansts.FIRST_BANKER];
                if (firstSelectionE.IsFieldSelected) {
                    msg.AppendSeparator(Constansts.FIELD_INDICATOR);
                } else {
                    for (let i = 0; i < firstSelectionE.Bankers.length; i++) {
                        msg.AppendBIN6(firstSelectionE.Bankers[i]);
                    }
                }
                msg.AppendSeparator(Constansts.BANKER_INDICATOR);
                // second horse
                const secondSelectionE =
                    currLeg.SSBankers[Constansts.SECOND_BANKER];
                if (secondSelectionE.IsFieldSelected) {
                    msg.AppendSeparator(Constansts.FIELD_INDICATOR);
                } else {
                    for (let i = 0; i < secondSelectionE.Bankers.length; i++) {
                        msg.AppendBIN6(secondSelectionE.Bankers[i]);
                    }
                }

                if (t === TCEQTT_TYPE.FCT_MULT_BANKER) {
                    msg.AppendSeparator(Constansts.FCT_MULTIPLE_INDICATOR);
                }

                break;
            case TCEQTT_TYPE.TCE_MULT_BANKER: // seft selection
                // region TCE_MULT_BANKER(*)
                // first horse
                const firstSelection =
                    currLeg.SSBankers[Constansts.FIRST_BANKER];
                if (firstSelection.IsFieldSelected) {
                    msg.AppendSeparator(Constansts.FIELD_INDICATOR);
                } else {
                    for (let i = 0; i < firstSelection.Bankers.length; i++) {
                        msg.AppendBIN6(firstSelection.Bankers[i]);
                    }
                }
                msg.AppendSeparator(Constansts.BANKER_INDICATOR);
                // second horse
                const secondSelection =
                    currLeg.SSBankers[Constansts.SECOND_BANKER];
                if (secondSelection.IsFieldSelected) {
                    msg.AppendSeparator(Constansts.FIELD_INDICATOR);
                } else {
                    for (let i = 0; i < secondSelection.Bankers.length; i++) {
                        msg.AppendBIN6(secondSelection.Bankers[i]);
                    }
                }
                msg.AppendSeparator(Constansts.BANKER_INDICATOR);
                // third horse
                const thirdSelection =
                    currLeg.SSBankers[Constansts.THIRD_BANKER];
                if (thirdSelection.IsFieldSelected) {
                    msg.AppendSeparator(Constansts.FIELD_INDICATOR);
                } else {
                    for (let i = 0; i < thirdSelection.Bankers.length; i++) {
                        msg.AppendBIN6(thirdSelection.Bankers[i]);
                    }
                }

                // endregion
                break;
            case TCEQTT_TYPE.QTT_MULT_BANKER: // seft selection
                // region QTT_MULT_BANKER(*)
                // first horse
                const firstHorse = currLeg.SSBankers[Constansts.FIRST_BANKER];
                if (firstHorse.IsFieldSelected) {
                    msg.AppendSeparator(Constansts.FIELD_INDICATOR);
                } else {
                    for (let i = 0; i < firstHorse.Bankers.length; i++) {
                        msg.AppendBIN6(firstHorse.Bankers[i]);
                    }
                }
                msg.AppendSeparator(Constansts.BANKER_INDICATOR);
                // second horse
                const secondHorse = currLeg.SSBankers[Constansts.SECOND_BANKER];
                if (secondHorse.IsFieldSelected) {
                    msg.AppendSeparator(Constansts.FIELD_INDICATOR);
                } else {
                    for (let i = 0; i < secondHorse.Bankers.length; i++) {
                        msg.AppendBIN6(secondHorse.Bankers[i]);
                    }
                }
                msg.AppendSeparator(Constansts.BANKER_INDICATOR);
                // third horse
                const thirdHorse = currLeg.SSBankers[Constansts.THIRD_BANKER];
                if (thirdHorse.IsFieldSelected) {
                    msg.AppendSeparator(Constansts.FIELD_INDICATOR);
                } else {
                    for (let i = 0; i < thirdHorse.Bankers.length; i++) {
                        msg.AppendBIN6(thirdHorse.Bankers[i]);
                    }
                }
                msg.AppendSeparator(Constansts.BANKER_INDICATOR);

                // fourth horse
                const fourthHorse = currLeg.SSBankers[Constansts.FOURTH_BANKER];
                if (fourthHorse.IsFieldSelected) {
                    msg.AppendSeparator(Constansts.FIELD_INDICATOR);
                } else {
                    for (let i = 0; i < fourthHorse.Bankers.length; i++) {
                        msg.AppendBIN6(fourthHorse.Bankers[i]);
                    }
                }

                // endregion
                break;
            default:
                break;
        }
        return true;
    }

    private static FormatScIndicator(
        msg: ByteArrayBuilder,
        scbet: FootballBetObject,
        indicator: number
    ): number {
        let indicator2 = 0x40;
        let indicator3 = 0x40; // by Ben, 20151204, BE need this indicator while any ML pools included
        // int     nVerNum     = 2;        //  new version for Q405
        // int     nVerNum     = 3;        //  new version for Q408 [Peter See @ 14/08/2008]
        const nVerNum = 4; //  new version for Multiple line [Ben @ 04/12/2015]
        let bMultiLegs = false;
        let pc = PCODE.PC_XXX;
        switch (scbet.oddsIndicator) {
            case ODDS_INDICATION.FIXED_ODDS_WITH_ODDS:
                indicator = indicator | FootballBetObject.FOWO_MASK;
                break;
            case ODDS_INDICATION.PARI_MUTUEL:
                indicator = indicator | FootballBetObject.PARI_MASK;
                break;
            case ODDS_INDICATION.FIXED_ODDS_WITHOUT_ODDS:
                indicator = indicator | FootballBetObject.FOWOO_MASK;
                break;
        }

        if (scbet.bonusLevel > 1) {
            indicator = indicator | FootballBetObject.BONUS_MASK;
        }
        if (
            scbet.scBetType === SCBET_TYPE.MATCH_BET &&
            scbet.game().getPool().bMultiLegs
        ) {
            indicator = indicator | FootballBetObject.PCID_MASK;
            bMultiLegs = true;
        }
        if (scbet.quickPick) {
            indicator = indicator | FootballBetObject.QP_MASK;
        }
        //  always new msg format in Q305
        indicator = indicator | FootballBetObject.NEWMSG_MASK;

        //  finished 1st indicator

        //  start 2nd indicator
        if (
            scbet.scBetType === SCBET_TYPE.MATCH_BET &&
            scbet.game().getPoolCode() === PCODE.PC_STB
        ) {
            indicator2 = indicator2 | FootballBetObject.STB_MASK;
            pc = PCODE.PC_STB;
        }
        //  only for all up bet, does not include Section Bet & Multi-legs pool
        if (
            (scbet.allUpType === ALLUP_TYPE.NORMAL_ALLUP ||
                scbet.allUpType === ALLUP_TYPE.XPOOL_ALLUP) &&
            !bMultiLegs &&
            pc !== PCODE.PC_STB
        ) {
            indicator2 = indicator2 | FootballBetObject.ALUP_MASK;
        }
        if (scbet.bInPlayBet) {
            indicator2 = indicator2 | FootballBetObject.INPLAY_MASK;
        }
        //  finished 2nd indicator

        //  start 3rd indicator
        if (
            scbet.oddsIndicator === ODDS_INDICATION.FIXED_ODDS_WITHOUT_ODDS &&
            nVerNum >= 4 &&
            scbet.hasMLPool()
            /*&& theTerminal.isMultiLinesEnabled()*/ // always true
        ) {
            // TODO(victor):
            indicator3 = indicator3 | FootballBetObject.ML_CON_MASK;
        }

        msg.AppendBIN6(indicator);
        msg.AppendBIN6(nVerNum);
        msg.AppendBIN6(indicator2);
        msg.AppendBIN6(indicator3);

        return indicator;
    }
    private static FormatScAllupCombination(
        msg: ByteArrayBuilder,
        scbet: FootballBetObject
    ): boolean {
        let count = 0;
        let setNum = 0;
        let pc = PCODE.PC_XXX;

        const nCombination = scbet.allUp.combination;
        const nLeg = scbet.allUp.leg;
        let nDigit1 = 0;
        let nDigit2 = 0;
        let nDigit3 = 0;

        if (scbet.scBetType === SCBET_TYPE.MATCH_BET) {
            count = scbet.getNumOfGames();
            pc = scbet.game().getPoolCode();
        } else {
            count = scbet.getNumOfTGames();
            pc = scbet.tgame().getPoolCode();
        }

        const pool = new Pool(pc);
        if (pool.bMultiLegs) {
            if (scbet.quickPick) {
                if (pc === PCODE.PC_HFMP6) {
                    // no. of simple pool count of HaFu6 quick pick must be 6
                    msg.AppendN9(Constansts.NO_OF_LEGS_OF_HAFU6, 1);
                } else {
                    //  PC_HFMP8
                    // no. of simple pool count of HaFu8 quick pick must be 8
                    msg.AppendN9(Constansts.NO_OF_LEGS_OF_HAFU8, 1);
                }

                //  2 entries for HaFu6 quick pick
                msg.AppendN9(2, 1);
            } else {
                // stream out the simple pool count
                msg.AppendN9(count, 1);
                // since this is a non-allup bet, a zero should be streamed out
                msg.AppendN9(0, 1);
            }
        } else if (pc === PCODE.PC_SPCM || pc === PCODE.PC_SPCT) {
            // stream out the simple pool count
            msg.AppendN9(count, 1);
            // since this is a non-allup bet, a zero should be streamed out
            msg.AppendN9(0, 1);
        } else if (pc === PCODE.PC_STB) {
            msg.AppendN9(count, 1); // send no. of legs (4 or 8 for section bet)
            setNum = scbet.game().nItemNum;
            msg.AppendN9(setNum, 1); // send set no. 1..5
        } else if (count > 1) {
            msg.AppendN9(count, 1);
            if (nCombination < 10) {
                msg.AppendN9(nCombination, 1);
            } else if (nCombination >= 10 && nCombination < 100) {
                nDigit1 = Math.floor(nCombination / 10);
                nDigit2 = nCombination % 10;

                msg.AppendN9(nDigit1, 1);
                msg.AppendN9(nDigit2, 1);
            } else if (nCombination >= 100) {
                nDigit1 = Math.floor(nCombination / 100);
                nDigit2 = Math.floor((nCombination % 100) / 10);
                nDigit3 = nCombination % 10;

                msg.AppendN9(nDigit1, 1);
                msg.AppendN9(nDigit2, 1);
                msg.AppendN9(nDigit3, 1);
            }
        } else {
            // stream out the simple pool count
            msg.AppendN9(1, 1);
            msg.AppendN9(0, 1);
        }

        msg.AppendAscii(Constansts.CHAR_SLASH);
        return true;
    }
    ////////////////////////////////////////////////////////////////////////////////
    //
    //  formatPool(CScmpOutPktStream&, CGame&)
    //
    //  stream out pool, match number, and match day
    //
    ////////////////////////////////////////////////////////////////////////////////
    private static formatPool(
        msg: ByteArrayBuilder,
        game: Game,
        gmIndex: number,
        isQp: boolean
    ) {
        const loByte = (game.matchNumber & 0x3f) | 0x40;
        const hiByte = (game.matchNumber >> 6) | 0x40;
        const mDay = (game.matchDay + 1) | 0x60;

        let bFormatMatch = false;

        const pc = game.pool.code;
        // stream out pool code
        switch (pc) {
            //  REMARK:
            //  matchDay is stored in game of the range from 0x00 to 0x06,
            //  which are corresponding to Sunday to Saturday;
            //
            //  However, the message format is ranged from 0x01 to 0x07,
            //  which are corresponding to Sunday to Saturday.
            //
            //  So, increment by one before streaming out
            //
            case PCODE.PC_STB: // added for section bet and treat it as AHAD
            case PCODE.PC_HAD:
            case PCODE.PC_AHAD:
                msg.AppendBIN6(MSG_PCODE.MSC_HAD);
                break;
            case PCODE.PC_FHAD:
                msg.AppendBIN6(MSG_PCODE.MSC_FHAD);
                break;
            case PCODE.PC_FTS: // Mar2011 M2
                msg.AppendBIN6(MSG_PCODE.MSC_FTS);
                break;
            case PCODE.PC_HHAD:
            case PCODE.PC_AHHAD:
                msg.AppendBIN6(MSG_PCODE.MSC_HHAD);
                break;
            case PCODE.PC_HDC:
                msg.AppendBIN6(MSG_PCODE.MSC_HDC);
                break;
            case PCODE.PC_CRS:
            case PCODE.PC_CRSP:
            case PCODE.PC_ACRS:
                msg.AppendBIN6(MSG_PCODE.MSC_CRS);
                break;
            // by Ken Lam, MSR2012 FCRS
            case PCODE.PC_FCRS:
                msg.AppendBIN6(MSG_PCODE.MSC_FCRS);
                break;
            case PCODE.PC_HFT:
            case PCODE.PC_HFTP:
                msg.AppendBIN6(MSG_PCODE.MSC_HAFU);
                break;
            case PCODE.PC_TTG:
                msg.AppendBIN6(MSG_PCODE.MSC_TTG);
                break;
            case PCODE.PC_HIL:
                msg.AppendBIN6(MSG_PCODE.MSC_HILO);
                break;
            // MR2011 FHLO
            case PCODE.PC_FHLO:
                msg.AppendBIN6(MSG_PCODE.MSC_FHLO);
                break;
            // MR2011 CHLO
            case PCODE.PC_CHLO:
                msg.AppendBIN6(MSG_PCODE.MSC_CHLO);
                break;
            case PCODE.PC_TQL: //  Q407
                msg.AppendBIN6(MSG_PCODE.MSC_TQL);
                break;
            case PCODE.PC_NTS: //  Q408 Peter See 09/08/2008
                msg.AppendBIN6(MSG_PCODE.MSC_NTS);
                break;
            case PCODE.PC_ETS: //  Q408 Peter See 09/08/2008
                msg.AppendBIN6(MSG_PCODE.MSC_ETS);
                break;
            case PCODE.PC_OOE:
                msg.AppendBIN6(MSG_PCODE.MSC_OOE);
                break;
            case PCODE.PC_FGS:
                msg.AppendBIN6(MSG_PCODE.MSC_FGS);
                break;
            case PCODE.PC_HCSP:
                msg.AppendBIN6(MSG_PCODE.MSC_HCS);
                break;
            case PCODE.PC_THFP:
                if (gmIndex === SC_LEG_INDEX.SC_LEG1) {
                    msg.AppendBIN6(MSG_PCODE.MSC_HAFU);
                }
                break;
            case PCODE.PC_HFMP6:
                if (
                    gmIndex === SC_LEG_INDEX.SC_LEG1 ||
                    gmIndex ===
                        SC_LEG_INDEX.SC_LEG1 + Constansts.NO_OF_LEGS_OF_HAFU6
                ) {
                    msg.AppendBIN6(MSG_PCODE.MSC_HFM);
                }
                break;
            case PCODE.PC_HFMP8:
                if (
                    gmIndex === SC_LEG_INDEX.SC_LEG1 ||
                    gmIndex ===
                        SC_LEG_INDEX.SC_LEG1 + Constansts.NO_OF_LEGS_OF_HAFU8
                ) {
                    msg.AppendBIN6(MSG_PCODE.MSC_HFM);
                }
                break;
            case PCODE.PC_DHCP:
                if (gmIndex === SC_LEG_INDEX.SC_LEG1) {
                    msg.AppendBIN6(MSG_PCODE.MSC_DHC);
                }
                break;
            case PCODE.PC_SPCM:
                msg.AppendBIN6(MSG_PCODE.MSC_SPCM);
                break;
        }

        if (!game.getPool().bMultiLegs) {
            bFormatMatch = true;
        } else {
            switch (pc) {
                case PCODE.PC_THFP:
                case PCODE.PC_DHCP:
                    if (gmIndex === SC_LEG_INDEX.SC_LEG1) {
                        bFormatMatch = true;
                    }
                    break;
                case PCODE.PC_HFMP6:
                    if (
                        gmIndex === SC_LEG_INDEX.SC_LEG1 ||
                        gmIndex ===
                            SC_LEG_INDEX.SC_LEG1 +
                                Constansts.NO_OF_LEGS_OF_HAFU6
                    ) {
                        //  2nd entry
                        bFormatMatch = true;
                    }
                    break;
                case PCODE.PC_HFMP8:
                    if (
                        gmIndex === SC_LEG_INDEX.SC_LEG1 ||
                        gmIndex ===
                            SC_LEG_INDEX.SC_LEG1 +
                                Constansts.NO_OF_LEGS_OF_HAFU8
                    ) {
                        //  2nd entry
                        bFormatMatch = true;
                    }
                    break;
            }
        }

        if (bFormatMatch) {
            msg.AppendBIN6(mDay);
            msg.AppendBIN6(loByte);
            msg.AppendBIN6(hiByte);
        }

        // Q408: Peter See 28/08/2008
        // Ref: OLTP <--> BT Gateway Message Spec
        // ***********************************************
        if (pc === PCODE.PC_NTS || pc === PCODE.PC_ETS) {
            const itemNum = game.nItemNum | 0x40;
            // int tempInt = 1;
            // int itemNum =  ( (byte)tempInt ) | 0x40;

            msg.AppendBIN6(itemNum);
        }
        // ***********************************************

        if (pc === PCODE.PC_SPCM) {
            const itemNum = game.nItemNum;
            msg.AppendBIN6(itemNum);
        }
    }
    ////////////////////////////////////////////////////////////////////////////////
    //
    //  formatHCSP(CScmpOutPktStream&, CGame&)
    //
    //  special handling for HCSP
    //
    ////////////////////////////////////////////////////////////////////////////////
    private static formatHCSP(msg: ByteArrayBuilder, gm: Game) {
        const BIT6_ON = 0x40;
        const MAX_SCORE = 5; //  maximum score for a team
        const OTHER_3 = 3; //  for HO, DO, AO
        const ADDITIONAL_OFFSET = 5; // RHO modified according to new message type, additional number of bits for offset
        const NUM_OF_BITS_IN_BYTE = 6; // RHO modified according to new message type, number of bits in a byte
        const fieldSep = ')';
        const hfTimeSep = '#';

        let bFirstHalf = true;
        let bField = false;
        const cxtCnt = gm.numOfContexts;
        let halfCxtCnt = 0;
        const numOfBits = Math.floor(
            ((MAX_SCORE + 1) * (MAX_SCORE + 1) + OTHER_3 + ADDITIONAL_OFFSET) /
                NUM_OF_BITS_IN_BYTE
        );
        let bytePos = 0;
        let bitPos = 0;
        let bitNumber = 0;

        // RHO cater for new message type open an array for no. of score 0 to 5 ie = 6+ 1 for AO HO & DO
        const bitmap6 = Buffer.alloc(MAX_SCORE + 2);

        for (let k = 0; k < numOfBits; k++) {
            bitmap6[k] = BIT6_ON; // set bit 6 by default
        }

        let hcsp = new SHftCrsp();

        msg.AppendAscii(MAX_SCORE | BIT6_ON);
        // msg << CScmpOutAsciiChar(MAX_SCORE | BIT6_ON);  //RHO stream out Max score for a team

        for (let i = 0; i < cxtCnt; i++) {
            hcsp = gm.context(i).scContext as SHftCrsp;

            //  stream out when extracting scores in the first half is finished
            //
            if (hcsp.firstHalf !== bFirstHalf) {
                bFirstHalf = false;

                // RHO MOD MAX_SCORE
                for (let j = 0; j < numOfBits; j++) {
                    msg.AppendBIN6(bitmap6[j]);
                    // msg << CScmpOutBin(1, bitmap6[j]);    //  stream out half time scores
                    bitmap6[j] = BIT6_ON;
                }

                if (bField) {
                    msg.AppendAscii(fieldSep);
                    // msg << fieldSep;                        //  field indicator
                    bField = false; //  reset it to false after streaming out
                }
                halfCxtCnt = 0;
                msg.AppendAscii(hfTimeSep);
                // msg << hfTimeSep;                           //  half/full time seperator
            }

            if (hcsp.homeScores === Constansts.CRS_O_VALUE) {
                if (hcsp.awayScores === Constansts.CRS_H_O_VALUE) {
                    bitNumber =
                        (MAX_SCORE + 1) * (MAX_SCORE + 1) +
                        Constansts.CRS_H_O_VALUE;
                } else if (hcsp.awayScores === Constansts.CRS_A_O_VALUE) {
                    bitNumber =
                        (MAX_SCORE + 1) * (MAX_SCORE + 1) +
                        Constansts.CRS_A_O_VALUE;
                } else {
                    //  DRAW_OTHERS
                    bitNumber =
                        (MAX_SCORE + 1) * (MAX_SCORE + 1) +
                        Constansts.CRS_D_O_VALUE;
                }
            } else {
                // bitNumber = hcsp.homeScores * 5 + hcsp.awayScores;
                // RHO MOD according to bit setting by the order of(Home scord x (max scord for a team+1) + Awayscor)
                bitNumber = hcsp.homeScores * (MAX_SCORE + 1) + hcsp.awayScores;
            }

            if (!bField && hcsp.field) {
                bField = true;
            }

            bytePos = Math.floor(bitNumber / 6);
            bitPos = bitNumber % 6;
            bitmap6[bytePos] = bitmap6[bytePos] | (1 << bitPos);
            halfCxtCnt++;
        }

        // RHO MOD MAX_SCORE
        for (let j = 0; j < numOfBits; j++) {
            msg.AppendBIN6(bitmap6[j]);
            // msg << CScmpOutBin(1, bitmap6[j]);            //  stream out full time scores
        }

        //  if context count == 0, means that the scbet should be input from UI (scbetEntry)
        //  so, pack for both halves
        //
        if (cxtCnt === 0) {
            msg.AppendAscii(hfTimeSep);
            // msg << hfTimeSep;                               //  half/full time seperator

            // RHO MOD MAX_SCORE
            for (let j = 0; j < numOfBits; j++) {
                msg.AppendBIN6(bitmap6[j]);
                // msg << CScmpOutBin(1, bitmap6[j]);        //  stream out full time scores
            }
        }

        if (bField) {
            msg.AppendAscii(fieldSep);
            // msg << fieldSep;
        } //  field indicator
    }
    private static replacePos(strObj: string, index, replacetext: string) {
        const str =
            strObj.substr(0, index) +
            replacetext +
            strObj.substring(index + 1, strObj.length);
        return str;
    }
    ////////////////////////////////////////////////////////////////////////////////
    //
    //  convertHdcChar2Bcd(char *)
    //
    //  convert HDC condtion from characters to BCD6
    //
    //  2nd param len in the length of the final output of condition
    //
    ////////////////////////////////////////////////////////////////////////////////
    private static convertHdcChar2Bcd(condition: string, len: number): any {
        // convert to BCD 6 for digit 1 & 3
        // format as 5.5 or 5 for start = '+'
        //
        if (condition[0] === '+') {
            // if '+" discard and left shift 1 byte convert 1st digit to BCD
            //
            condition = this.replacePos(
                condition,
                0,
                String.fromCharCode(
                    (condition[1].charCodeAt(0) - '0'.charCodeAt(0)) | 0x40
                )
            );
            // condition[0] = ( condition[1] - '0' ) | 0x40;
            // no need to send if .0
            //
            if (condition[2] === '.' && condition[3] !== '0') {
                // shift the '.' to the left
                //
                condition = this.replacePos(condition, 1, condition[2]);
                // condition[1] = condition[2];
                // convert the 5 to BCD
                //
                condition = this.replacePos(condition, 2, condition[3]);
                condition = condition.slice(0, 3);
                // condition[2] = (condition[3] - '0') | 0x40;
                // condition[3] = NULL;
                len = 3;
            } else {
                condition = condition.slice(0, 1);
                // condition[1] = NULL;
                len = 1;
            }
        } else if (condition[0] === '-') {
            // just format the [1] & [3] to BCD
            // special case if -0.0
            if (condition[1] === '0' && condition[3] === '0') {
                condition = this.replacePos(
                    condition,
                    0,
                    String.fromCharCode(
                        (condition[1].charCodeAt(0) - '0'.charCodeAt(0)) | 0x40
                    )
                );
                condition = condition.slice(0, 1);
                // condition[0] = (condition[1] - '0') | 0x40;
                // condition[1] = NULL;
                len = 1;
            } else {
                condition = this.replacePos(
                    condition,
                    1,
                    String.fromCharCode(
                        (condition[1].charCodeAt(0) - '0'.charCodeAt(0)) | 0x40
                    )
                );
                // condition[1] = (condition[1] - '0') | 0x40;

                if (condition[2] === '.' && condition[3] !== '0') {
                    condition = this.replacePos(
                        condition,
                        3,
                        String.fromCharCode(
                            (condition[3].charCodeAt(0) - '0'.charCodeAt(0)) |
                                0x40
                        )
                    );
                    condition = condition.slice(0, 4);
                    // condition[3] = (condition[3] - '0') | 0x40;
                    //     condition[4] = NULL;
                    len = 4;
                } else {
                    condition = condition.slice(0, 2);
                    // condition[2] = NULL;
                    len = 2;
                }
            }
        } else if (condition[2] === '.') {
            // 20130613, CHLO when corner line >= 10
            condition = this.replacePos(
                condition,
                0,
                String.fromCharCode(
                    ((condition[0].charCodeAt(0) - '0'.charCodeAt(0)) * 10 +
                        (condition[1].charCodeAt(0) - '0'.charCodeAt(0))) |
                        0x40
                )
            );
            // condition[0] = ((condition[0] - '0') * 10 + (condition[1] - '0')) | 0x40;

            if (condition[2] === '.' && condition[3] !== '0') {
                condition = this.replacePos(condition, 1, '.');
                condition = this.replacePos(
                    condition,
                    2,
                    String.fromCharCode(
                        (condition[3].charCodeAt(0) - '0'.charCodeAt(0)) | 0x40
                    )
                );
                condition = condition.slice(0, 3);
                // condition[1] = '.';
                // condition[2] = (condition[3] - '0') | 0x40;
                // condition[3] = NULL;
                len = 3;
            } else {
                condition = condition.slice(0, 1);
                // condition[1] = NULL;
                len = 1;
            }
        } else if (condition.length !== 1 && condition.length === 2) {
            // by Samuel Chan, 20130702
            // SQ#60487: oddsServ will remove ".0" for corner line greater that 10, so need 1 more case
            condition = this.replacePos(
                condition,
                0,
                String.fromCharCode(
                    ((condition[0].charCodeAt(0) - '0'.charCodeAt(0)) * 10 +
                        (condition[1].charCodeAt(0) - '0'.charCodeAt(0))) |
                        0x40
                )
            );
            condition = condition.slice(0, 1);

            // condition[0] = ((condition[0] - '0') * 10 + (condition[1] - '0')) | 0x40;
            // condition[1] = NULL;
            len = 1;
        } else {
            //  HILO
            condition = this.replacePos(
                condition,
                0,
                String.fromCharCode(
                    (condition[0].charCodeAt(0) - '0'.charCodeAt(0)) | 0x40
                )
            );
            // condition[0] = (condition[0] - '0') | 0x40;
            // no need to send if .0
            //
            if (condition[1] === '.' && condition[2] !== '0') {
                // convert the 5 to BCD
                //
                condition = this.replacePos(
                    condition,
                    2,
                    String.fromCharCode(
                        (condition[2].charCodeAt(0) - '0'.charCodeAt(0)) | 0x40
                    )
                );
                condition = condition.slice(0, 3);
                // condition[2] = (condition[2] - '0') | 0x40;
                // condition[3] = NULL;
                len = 3;
            } else {
                condition = condition.slice(0, 1);
                // condition[1] = NULL;
                len = 1;
            }
        }
        let result = { condition: condition, len: len };
        return result;
    }

    ////////////////////////////////////////////////////////////////////////////////
    //
    //  format  scbet handicap conditions
    //
    //  for both HDC and HHAD
    //
    ////////////////////////////////////////////////////////////////////////////////
    private static formatHandicapCondition(
        msg: ByteArrayBuilder,
        scCxt: any,
        pc: PCODE
    ) {
        let outLen = 0;
        const charLen = 0;

        //  by Jason Lau, 0n 23/12/2004
        //  use static vairable instead
        //  and uses the MAX one -- HDC_COND_LEN + 1
        // char condition[HDC_COND_LEN + 1];
        let condition = '';
        let split = false;
        //  memset the whole char array no matter it is HDC or HHAD
        // memset(condition, 0, HDC_COND_LEN + 1);

        if (pc === PCODE.PC_HDC) {
            const S_Handicap = scCxt as SHandicap;
            condition = S_Handicap.firstHandicap;
            split = S_Handicap.split;
            // memcpy(condition, & scCxt.S_Handicap.firstHandicap, HDC_COND_LEN);
        } else if (pc === PCODE.PC_HHAD) {
            const S_HandiHomeAwayDraw = scCxt as SHandiHomeAwayDraw;
            condition = S_HandiHomeAwayDraw.handicap;
            // memcpy(condition, & scCxt.S_HandiHomeAwayDraw.handicap, HHAD_COND_LEN);
        } else if (pc === PCODE.PC_HIL || pc === PCODE.PC_FHLO) {
            const S_HighLow = scCxt as SHighLow;
            condition = S_HighLow.comparedScores1;
            split = S_HighLow.split;
            // memcpy(condition, & scCxt.S_HighLow.comparedScores1, HILO_SCORE_LEN);
        } else if (pc === PCODE.PC_CHLO) {
            // PSR2013 CHLO, 20130610
            // 20130611
            const S_CornerHighLow = scCxt as SCornerHighLow;
            split = S_CornerHighLow.split;
            if (S_CornerHighLow.comparedCorner1[1] === '.') {
                condition = S_CornerHighLow.comparedCorner1.slice(
                    0,
                    S_CornerHighLow.comparedCorner1.length - 1
                );
                // tslint:disable-next-line: max-line-length
                // memcpy(condition, & scCxt.S_CornerHighLow.comparedCorner1, CHLO_CORNER_LEN - 1); // corner line < 10, e.g., 9.5 (len == 3)
            } else {
                condition = S_CornerHighLow.comparedCorner1;
                // memcpy(condition, & scCxt.S_CornerHighLow.comparedCorner1, CHLO_CORNER_LEN); // corner line >= 10, i.e., 10.0 (len == 4)
            }
        }

        let result = this.convertHdcChar2Bcd(condition, outLen);
        outLen = result.len;
        condition = result.condition;
        msg.AppendFixStr(condition, outLen);
        // msg << CScmpOutFixStr(outLen, condition);

        //  memset the whole char array no matter it is HDC or HHAD
        // memset(condition, 0, HDC_COND_LEN + 1);
        condition = '';

        if (split === true) {
            outLen = 0;
            if (pc === PCODE.PC_HDC) {
                const S_Handicap = scCxt as SHandicap;
                condition = S_Handicap.secondHandicap;
                // memcpy(condition, & scCxt.S_Handicap.secondHandicap, HDC_COND_LEN);
            } else if (pc === PCODE.PC_HIL || pc === PCODE.PC_FHLO) {
                const S_HighLow = scCxt as SHighLow;
                condition = S_HighLow.comparedScores2;
                // memcpy(condition, & scCxt.S_HighLow.comparedScores2, HILO_SCORE_LEN);
            } else if (pc === PCODE.PC_CHLO) {
                // PSR2013 CHLO, 20130610
                // 20130611
                const S_CornerHighLow = scCxt as SCornerHighLow;
                if (S_CornerHighLow.comparedCorner2[1] === '.') {
                    condition = S_CornerHighLow.comparedCorner2.slice(
                        0,
                        S_CornerHighLow.comparedCorner2.length - 1
                    );
                    // memcpy(condition, & scCxt.S_CornerHighLow.comparedCorner2, CHLO_CORNER_LEN - 1);
                } else {
                    // corner line < 10, e.g., 9.5 (len == 3)
                    condition = S_CornerHighLow.comparedCorner2;
                    // memcpy(condition, & scCxt.S_CornerHighLow.comparedCorner2, CHLO_CORNER_LEN);
                } // corner line >= 10, i.e., 10.0 (len == 4)
            }
            let result = this.convertHdcChar2Bcd(condition, outLen);
            outLen = result.len;
            condition = result.condition;
            msg.AppendFixStr(condition, outLen);
            // msg << CScmpOutFixStr(outLen, condition);
        }

        //    delete [] condition;
    }
    private static formatTOFP(msg: ByteArrayBuilder, tgame: TourGame) {
        const plusSep = '+';
        const fieldSep = ')';
        const runUpSep = '#';

        let i = 0,
            nChampCnt = 0;
        const nCxtCnt = tgame.numOfContexts;

        for (i = 0; i < nCxtCnt; i++) {
            const S_Champ1stRun = tgame.context(i).scContext as SChamp1stRun;
            if (S_Champ1stRun.bChampion) {
                nChampCnt++;
            }
        }

        for (i = 0; i < nChampCnt; i++) {
            if (i > 0) {
                msg.AppendSeparator(plusSep);
                // msg << plusSep;
            }
            const S_Champ1stRun = tgame.context(i).scContext as SChamp1stRun;
            msg.AppendBIN6(S_Champ1stRun.nTeamNo);
            // msg << CScmpOutBin(1, tgame.context(i).getScContext().S_Champ1stRun.nTeamNo);
        }

        const S_Champ1stRun0 = tgame.context().scContext as SChamp1stRun;
        if (S_Champ1stRun0.bField) {
            msg.AppendSeparator(fieldSep);
            // msg << fieldSep;
        }

        msg.AppendSeparator(runUpSep);
        // msg << runUpSep;

        for (i = nChampCnt; i < nCxtCnt; i++) {
            if (i > nChampCnt) {
                msg.AppendSeparator(plusSep);
                // msg << plusSep;
            }
            const S_Champ1stRun = tgame.context(i).scContext as SChamp1stRun;
            msg.AppendBIN6(S_Champ1stRun.nTeamNo);
            // msg << CScmpOutBin(1, tgame.context(i).getScContext().S_Champ1stRun.nTeamNo);
        }

        const S_Champ1stRunCnt = tgame.context(nChampCnt)
            .scContext as SChamp1stRun;
        if (S_Champ1stRunCnt.bField) {
            msg.AppendSeparator(fieldSep);
            // msg << fieldSep;
        }
    }
    ////////////////////////////////////////////////////////////////////////////////
    //
    //  REMARK: assume those input groups have been in ascending order
    //
    ////////////////////////////////////////////////////////////////////////////////
    private static formatADTP(msg: ByteArrayBuilder, tgame: TourGame) {
        const plusSep = '+';
        const fieldSep = ')';

        let i = 0;
        const cxtCnt = tgame.numOfContexts;
        let nGrpNo = 0,
            nLastGrpNo = 0;

        for (i = 0; i < tgame.numOfContexts; i++) {
            const finlst = tgame.context(i).scContext as SFinalist;
            if (i === 0) {
                // 1st context
                msg.AppendBIN6(finlst.nGrpNo);
                msg.AppendBIN6(finlst.nTeamNo);
                // msg << CScmpOutBin(1, finlst.nGrpNo);
                // msg << CScmpOutBin(1, finlst.nTeamNo);
                //  check field
                if (finlst.bField) {
                    msg.AppendAscii(fieldSep);
                    // msg << fieldSep;
                }
                nLastGrpNo = finlst.nGrpNo;
            } else if (i > 0 && i < cxtCnt - 1) {
                nGrpNo = finlst.nGrpNo;
                msg.AppendAscii(plusSep);
                msg.AppendBIN6(finlst.nGrpNo);
                msg.AppendBIN6(finlst.nTeamNo);
                // msg << plusSep;
                // msg << CScmpOutBin(1, finlst.nGrpNo);
                // msg << CScmpOutBin(1, finlst.nTeamNo);

                //  check field
                if (finlst.bField) {
                    msg.AppendAscii(fieldSep);
                    // msg << fieldSep;
                }

                nLastGrpNo = nGrpNo;
            } else {
                //  last context
                msg.AppendAscii(plusSep);
                msg.AppendBIN6(finlst.nGrpNo);
                msg.AppendBIN6(finlst.nTeamNo);
                // msg << plusSep;
                // msg << CScmpOutBin(1, finlst.nGrpNo);
                // msg << CScmpOutBin(1, finlst.nTeamNo);

                //  check field
                if (finlst.bField) {
                    msg.AppendAscii(fieldSep);
                    // msg << fieldSep;
                }
            }
        }
    }

    ////////////////////////////////////////////////////////////////////////////////
    //
    //  REMARK: assume those input selections are ascending order in group and must
    //          be correct data
    //
    ////////////////////////////////////////////////////////////////////////////////
    private static formatTContexts(
        msg: ByteArrayBuilder,
        tgame: TourGame,
        indicator: number
    ) {
        const plusSep = '+';
        const runUpSep = '#';

        const pc = tgame.getPoolCode();
        let i = 0;
        const cnt = tgame.numOfContexts;

        switch (pc) {
            case PCODE.PC_TOFP:
                this.formatTOFP(msg, tgame);
                break;
            case PCODE.PC_ADTP:
                this.formatADTP(msg, tgame);
                break;
            default:
                for (i = 0; i < cnt; i++) {
                    // add  a '+' proir to the selection after the first selection
                    if (i > 0) {
                        msg.AppendAscii(plusSep);
                        // msg << plusSep;
                    }

                    switch (pc) {
                        case PCODE.PC_CHP:
                            const S_Champion = tgame.context(i)
                                .scContext as SChampion;
                            if (S_Champion.nTeamNo === 64) {
                                msg.AppendBIN6(0);
                                // msg << CScmpOutBin(1, 0);
                            } else {
                                msg.AppendBIN6(S_Champion.nTeamNo);
                                // msg << CScmpOutBin(1, scCxt.S_Champion.nTeamNo);
                            }
                            break;
                        case PCODE.PC_GPF:
                            const S_GrpForcst = tgame.context(i)
                                .scContext as SGroupForecast;
                            msg.AppendBIN6(S_GrpForcst.nWinner);
                            msg.AppendBIN6(S_GrpForcst.nRunnerUp);
                            // msg << CScmpOutBin(1, scCxt.S_GrpForcst.nWinner);
                            // //            msg << runUpSep;
                            // msg << CScmpOutBin(1, scCxt.S_GrpForcst.nRunnerUp);
                            break;
                        case PCODE.PC_GPW:
                            const S_GrpWin = tgame.context(i)
                                .scContext as SGroupWinner;
                            msg.AppendBIN6(S_GrpWin.nWinner);
                            // msg << CScmpOutBin(1, scCxt.S_GrpWin.nWinner);
                            break;
                        case PCODE.PC_TPS:
                            {
                                const S_TopScorer = tgame.context(i)
                                    .scContext as STopScorer;
                                let nSeln = S_TopScorer.nSeln;
                                if (nSeln === Constansts.TPS_OTHERS) {
                                    nSeln = 0;
                                }
                                msg.AppendBIN6(nSeln);
                                // msg << CScmpOutBin(1, nSeln);
                            }
                            break;
                        /*  SPECIAL POOL*/
                        case PCODE.PC_SPCT:
                            const S_Special = tgame.context(i)
                                .scContext as SSpecial;
                            if (S_Special.nSeln === Constansts.TPS_OTHERS) {
                                msg.AppendBIN6(1);
                                // msg << CScmpOutBin(1, 0);
                            } else {
                                msg.AppendBIN6(S_Special.nSeln);
                                // msg << CScmpOutBin(1, scCxt.S_Special.nSeln);
                            }
                            break;
                        case PCODE.PC_JKC: //  novelty
                            {
                                const S_Special1 = tgame.context(i)
                                    .scContext as SSpecial;
                                msg.AppendBIN6(S_Special1.nSeln);
                                // msg << CScmpOutBin(1, scCxt.S_Special.nSeln);
                            }
                            break;
                    }

                    if (indicator === ODDS_INDICATION.FIXED_ODDS_WITH_ODDS) {
                        msg.AppendOdds(tgame.context(i).odds);
                        // msg << CScmpOutOdds(tgame.context(i).getOdds());
                    }
                }
                break;
        }
    }

    private static formatContexts(
        msg: ByteArrayBuilder,
        game: Game,
        indicator: number
    ) {
        const pool = game.getPoolCode();
        // get the context count
        //
        const contextCount = game.numOfContexts;

        for (let j = 0; j < contextCount; j++) {
            // add  a '+' proir to the selection after the first selection
            if (j > 0 && pool !== PCODE.PC_HFMP6 && pool !== PCODE.PC_HFMP8) {
                msg.AppendAscii('+');
                // msg << CScmpOutAsciiChar('+');            //  plus seperator
            }

            const scCxt = game.context(j).scContext;

            // get game selection according to cpool
            switch (pool) {
                case PCODE.PC_STB: // RHO send out selections same as HAD for section bet
                case PCODE.PC_NTS: // Q408
                case PCODE.PC_ETS: // Q408
                case PCODE.PC_HAD:
                case PCODE.PC_AHAD:
                case PCODE.PC_FHAD:
                case PCODE.PC_FTS: // Mar2011 M2
                    {
                        const s_homeawaydraw = scCxt as SHomeAwayDraw;
                        msg.AppendN9(s_homeawaydraw.result);
                        // msg << CScmpOutN9(1, scCxt.S_HomeAwayDraw.result);
                    }
                    break;
                case PCODE.PC_HHAD:
                case PCODE.PC_AHHAD:
                    const S_HomeAwayDraw = scCxt as SHomeAwayDraw;
                    msg.AppendN9(S_HomeAwayDraw.result);
                    // msg << CScmpOutN9(1, scCxt.S_HomeAwayDraw.result);
                    if (indicator === ODDS_INDICATION.FIXED_ODDS_WITH_ODDS) {
                        this.formatHandicapCondition(msg, scCxt, pool);
                    }
                    break;
                case PCODE.PC_HDC:
                    const S_Handicap = scCxt as SHandicap;
                    msg.AppendN9(S_Handicap.result);
                    // msg << CScmpOutN9(1, scCxt.S_Handicap.result);
                    if (indicator === ODDS_INDICATION.FIXED_ODDS_WITH_ODDS) {
                        this.formatHandicapCondition(msg, scCxt, pool);
                    }
                    break;
                case PCODE.PC_FCRS: // by Ken Lam, MSR2012 FCRS
                case PCODE.PC_CRS:
                case PCODE.PC_ACRS:
                case PCODE.PC_CRSP:
                    const S_CorrectScore = scCxt as SCorrectScore;
                    msg.AppendBIN6(S_CorrectScore.homeScores);
                    msg.AppendBIN6(S_CorrectScore.awayScores);
                    // msg << CScmpOutBin(1, scCxt.S_CorrectScore.homeScores);
                    // msg << CScmpOutBin(1, scCxt.S_CorrectScore.awayScores);
                    break;
                case PCODE.PC_HFT:
                case PCODE.PC_HFTP:
                case PCODE.PC_THFP:
                //            case PCODE.PC_HFMP:
                case PCODE.PC_HFMP6:
                case PCODE.PC_HFMP8:
                    const S_HalfFullTime = scCxt as SHalfFullTime;
                    msg.AppendN9(S_HalfFullTime.halfTimeResult);
                    msg.AppendN9(S_HalfFullTime.fullTimeResult);
                    // msg << CScmpOutN9(1, scCxt.S_HalfFullTime.halfTimeResult);
                    // msg << CScmpOutN9(1, scCxt.S_HalfFullTime.fullTimeResult);
                    break;
                case PCODE.PC_TTG:
                    const S_TotalScore = scCxt as STotalScore;
                    msg.AppendBIN6(S_TotalScore.totalScore);
                    // msg << CScmpOutBin(1, scCxt.S_TotalScore.totalScore);
                    break;
                case PCODE.PC_HIL:
                case PCODE.PC_FHLO: // MR2011 FHLO
                    const S_HighLow = scCxt as SHighLow;
                    msg.AppendN9(S_HighLow.hilo);
                    // msg << CScmpOutN9(1, scCxt.S_HighLow.hilo);
                    // stream out OOU compared scores
                    if (indicator === ODDS_INDICATION.FIXED_ODDS_WITH_ODDS) {
                        // by Ben, 2015/12/02, fix sendout format
                        this.formatHandicapCondition(msg, scCxt, pool);
                    }
                    break;
                case PCODE.PC_CHLO: // PSR2013 CHLO,	20130610
                    const S_CornerHighLow = scCxt as SCornerHighLow;
                    msg.AppendN9(S_CornerHighLow.hilo);
                    // msg << CScmpOutN9(1, scCxt.S_CornerHighLow.hilo);
                    // stream out OOU compared scores
                    if (indicator === ODDS_INDICATION.FIXED_ODDS_WITH_ODDS) {
                        // by Ben, 2015/12/02, fix sendout format
                        this.formatHandicapCondition(msg, scCxt, pool);
                    }
                    break;
                case PCODE.PC_TQL: //  Q407
                    const S_ToQualify = scCxt as SToQualify;
                    msg.AppendN9(S_ToQualify.result);
                    // msg << CScmpOutN9(1, scCxt.S_ToQualify.result);
                    break;
                case PCODE.PC_OOE:
                    const S_OddEven = scCxt as SOddEven;
                    msg.AppendN9(S_OddEven.odd);
                    // msg << CScmpOutN9(1, scCxt.S_OddEven.odd);
                    break;
                case PCODE.PC_FGS:
                    const S_FirstScorer = scCxt as SFirstScorer;
                    msg.AppendBIN6(this.convertFGS(S_FirstScorer.playerID));
                    // msg << CScmpOutBin(1, convertFGS(scCxt.S_FirstScorer.playerID));
                    break;
                case PCODE.PC_SPCM:
                    const S_Special = scCxt as SSpecial;
                    msg.AppendN9(S_Special.nSeln);
                    // msg << CScmpOutN9(1, scCxt.S_Special.nSeln);
                    break;
                default:
                    break;
            } // switch

            //  if FIXED_ODDS_WITH_ODDS, stream out odds
            if (
                indicator ===
                    ODDS_INDICATION.FIXED_ODDS_WITH_ODDS /*theTerminal.isMultiLinesEnabled() &&*/ ||
                pool === PCODE.PC_HIL ||
                pool === PCODE.PC_FHLO ||
                pool === PCODE.PC_CHLO
            ) {
                msg.AppendOdds(game.context(j).odds);
                // msg << CScmpOutOdds(game.context(j).getOdds());
            }
        }

        switch (pool) {
            case PCODE.PC_THFP:
            //    case PCODE.HFMP:
            case PCODE.PC_HFMP6:
            case PCODE.PC_HFMP8:
                {
                    const S_HalfFullTime = game.context()
                        .scContext as SHalfFullTime;
                    if (!game.bVoidLeg && S_HalfFullTime.field) {
                        msg.AppendAscii(')');
                        // msg << CScmpOutAsciiChar(')');
                    }
                }
                break;
            case PCODE.PC_CRSP:
                {
                    const S_CorrectScore = game.context()
                        .scContext as SCorrectScore;
                    if (S_CorrectScore.field) {
                        msg.AppendAscii(')');
                        // msg << CScmpOutAsciiChar(')');
                    }
                }
                break;
            default:
                break;
        }
    }

    private static formatSelections(
        msg: ByteArrayBuilder,
        scbet: FootballBetObject
    ): void {
        const gmCnt = scbet.getNumOfGames();
        const isQp = scbet.quickPick;

        // sort through the gameList for current pool
        //
        for (let i = 0; i < gmCnt; i++) {
            const game = scbet.game(i);
            const pool = game.pool.code;

            if (i > 0) {
                if (pool === PCODE.PC_HFMP8 || pool === PCODE.PC_HFMP6) {
                    if (
                        isQp &&
                        ((i === Constansts.NO_OF_LEGS_OF_HAFU6 &&
                            pool === PCODE.PC_HFMP6) ||
                            (i === Constansts.NO_OF_LEGS_OF_HAFU8 &&
                                pool === PCODE.PC_HFMP8))
                    ) {
                        msg.AppendAscii(Constansts.CHAR_BACKSLASH);
                    } else {
                        // add  a '/' proir to the selection after the first game
                        msg.AppendAscii(Constansts.CHAR_SLASH);
                    }
                } else {
                    // add  a '/' proir to the selection after the first game
                    msg.AppendAscii(Constansts.CHAR_SLASH);
                }
            }
            this.formatPool(msg, game, i, isQp);

            //  since HCSP uses bitmap to format contexts, NOT one by one,
            //  do HCSP seperately
            //  REMARK: it can still be done game by game
            //
            if (pool === PCODE.PC_HCSP || pool === PCODE.PC_DHCP) {
                this.formatHCSP(msg, game);
            } else {
                this.formatContexts(msg, game, scbet.oddsIndicator);
            }
        }
    }
    ////////////////////////////////////////////////////////////////////////////////
    //
    //  formatTPool(CScmpOutPktStream&, CTGame&)
    //
    //  stream out pool, tournament number, and event day or group number
    //
    ////////////////////////////////////////////////////////////////////////////////
    private static formatTPool(
        msg: ByteArrayBuilder,
        tg: TourGame,
        gmIndex: number
    ) {
        let hiByte = 0,
            loByte = 0;
        const noDayMk = 0 | 0x60;
        const pc = tg.getPool().code;

        loByte = (tg.nTourNo & 0x3f) | 0x40;

        // stream out pool code
        switch (pc) {
            case PCODE.PC_CHP:
                msg.AppendBIN6(MSG_PCODE.MSC_CHP);
                // msg << CScmpOutBin(1, MSC_CHP);
                break;
            case PCODE.PC_TOFP:
                msg.AppendBIN6(MSG_PCODE.MSC_TOF);
                // msg << CScmpOutBin(1, MSC_TOF);
                break;
            case PCODE.PC_ADTP:
                msg.AppendBIN6(MSG_PCODE.MSC_ADT);
                // msg << CScmpOutBin(1, MSC_ADT);
                hiByte = (tg.nGrpEvtNo & 0x3f) | 0x40;
                break;
            case PCODE.PC_GPF:
                msg.AppendBIN6(MSG_PCODE.MSC_GPF);
                // msg << CScmpOutBin(1, MSC_GPF);
                hiByte = (tg.nGrpEvtNo & 0x3f) | 0x40;
                break;
            case PCODE.PC_GPW:
                msg.AppendBIN6(MSG_PCODE.MSC_GPW);
                // msg << CScmpOutBin(1, MSC_GPW);
                hiByte = (tg.nGrpEvtNo & 0x3f) | 0x40;
                break;
            case PCODE.PC_SPCT:
            case PCODE.PC_JKC: //  novelty
                msg.AppendBIN6(MSG_PCODE.MSC_SPCT);
                // msg << CScmpOutBin(1, MSC_SPCT);
                hiByte = (tg.nGrpEvtNo & 0x3f) | 0x40;
                break;
            case PCODE.PC_TPS:
                msg.AppendBIN6(MSG_PCODE.MSC_TPS);
                // msg << CScmpOutBin(1, MSC_TPS);
                hiByte = (tg.nGrpEvtNo & 0x3f) | 0x40;
                break;
            default:
                throw new ComSvrException(
                    ERROR_MSG.RID_COMSERV_ERR_UNKNOWPOOLCODE
                );
                // AfxMessageBox(_T("Remember to handls SPC"));
                break;
        }

        msg.AppendBIN6(noDayMk);
        msg.AppendBIN6(loByte);
        msg.AppendBIN6(hiByte);
        // msg << CScmpOutBin(1, noDayMk);     //  indicate tournament pool
        // msg << CScmpOutBin(1, loByte);
        // msg << CScmpOutBin(1, hiByte);

        /*  SPECIAL POOL*/
        if (pc === PCODE.PC_SPCT || pc === PCODE.PC_JKC) {
            const item = tg.nItemNum;
            msg.AppendBIN6(item);
            // msg << CScmpOutBin(1, item);
        }
    }

    private static formatTGameSelections(
        msg: ByteArrayBuilder,
        scbet: FootballBetObject
    ) {
        const slashSep = '/';

        const count = scbet.getNumOfTGames();

        // sort through the gameList for current pool
        //
        for (let i = 0; i < count; i++) {
            if (i > 0) {
                msg.AppendSeparator(slashSep);
                // msg << slashSep;
            }
            const tgame = scbet.tgame(i);
            this.formatTPool(msg, tgame, i);
            this.formatTContexts(msg, tgame, scbet.oddsIndicator);
        }
    }

    private static convertFGS(nPlayerId: number): number {
        let id = 0;
        switch (nPlayerId) {
            case 120:
                id = 41;
                break;
            case 220:
                id = 42;
                break;
            case 0:
                id = 43;
                break;
            default:
                if (nPlayerId < 120 && nPlayerId > 100) {
                    id = nPlayerId - 100;
                } else if (nPlayerId < 220 && nPlayerId > 200) {
                    id = nPlayerId - 200 + 20;
                } else {
                    id = 0;
                }
        }
        return id;
    }
    public static FormatSignOnMessage_new(
        msg: ByteArrayBuilder,
        signOn: MSG_SIGN_ON,
        branchNumber = this.t.branchNumber,
        windowNumber = this.t.windowNumber,
        course = this.t.onCourse,
        version = this.t.version,
        receiptVersion = this.t.receiptVersion,
        slidesVersion = this.t.slideVersion,
        currentDate = internalParam.currentDate
    ): boolean {
        const result = false;

        msg.AppendNewCust(true); // setNewCust(true);
        msg.AppendMsgCode(MessageCode.MC_SIGN_ON); // setMsgCode( MC_SIGN_ON );
        const staffIDN9_str = msg.ConvertToN9(signOn.staffId);
        msg.AppendFixStr(staffIDN9_str, 6); // operator number
        msg.AppendSeparator();
        msg.AppendN9(parseInt(branchNumber, 10), 4); // centre #(Branh number)
        msg.AppendSeparator();
        msg.AppendN9(parseInt(windowNumber, 10), 3); // window number
        msg.AppendSeparator();
        const staffPinN9_str = msg.ConvertToN9(signOn.staffPin);
        msg.AppendFixStr(staffPinN9_str, 6); // operator pin
        msg.AppendSeparator();
        msg.AppendN9(0, 6); // supervisor #
        msg.AppendSeparator();
        msg.AppendN9(0, 6); // supervisor pin
        msg.AppendSeparator();
        msg.AppendN9(course ? 1 : 0, 1); // on-off course
        msg.AppendSeparator();
        msg.AppendN9(Number.parseInt(version), 2); // app version
        msg.AppendSeparator();

        let appVersion = Number.parseInt(version); // = t.InternalParam.Version;
        // region receiptVersion

        if (receiptVersion === 0) {
            msg.AppendN9(appVersion, 2); // app version
        } else {
            msg.AppendN9(receiptVersion, 2); // slides version
        }
        msg.AppendSeparator();
        // endregion

        // region slidesVersion
        // = t.InternalParam.SlidesVersion;
        // var slidesVersion = 20; // call theTerminal interface
        if (slidesVersion === 0) {
            msg.AppendN9(appVersion, 2); // app version
        } else {
            msg.AppendN9(slidesVersion, 2); // slides version
        }
        msg.AppendSeparator();
        msg.AppendDDMMMYY(new Date(currentDate)); // = t.InternalParam.CurrentDate);
        msg.AppendSeparator();

        msg.AppendN9(Constansts.KIOSK, 1);
        msg.AppendSeparator();

        msg.AppendAscii(Constansts.DOLLAR_SIGN);

        const minTicketTotal = 10; // = this.t.configs.supervisorConfig..MinTicketTotal;
        msg.AppendN9(minTicketTotal, String(minTicketTotal).length);

        // endregion

        return result;
    }
}
