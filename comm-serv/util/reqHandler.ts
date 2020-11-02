import {
    Messages,
    MSG_Football_REPLY,
    MSG_MarkSix_REPLY,
} from '../../share/models/comm-serv/Messages';
import { ByteArrayBuilder } from './byteArrayBuilder';
import { ComSvrException } from './comSvrException';
import { logger } from '../../share/utils/logs';
import { customer } from '../../share/main-proc/customer/customer';
import { CustomerType } from '../../share/main-proc/customer/customer.enum';
import { stringify } from 'querystring';
import {
    MessageCode,
    Constansts,
    PCODE,
    HFT_ODDS,
    HDC_ODDS,
} from '../../share/models/comm-serv/CommonDefs';
import { SimReply } from '../../share/models/comm-serv/SimReply';
import { MK6_TYPE } from '../../share/models/comm-serv/MarSix/Enums';
import { PoolSymbol } from '../../share/models/comm-serv/Racing/PoolType';
import {
    QPTT_TYPE,
    QPQTT_TYPE,
} from '../../share/models/comm-serv/Racing/Enums';
import { MarkSixBetObject } from '../../share/models/comm-serv/MarSix/MarkSixBetObject';
import { HttpSend } from '../httpsend/HttpSend';
import { terminalConfig } from '../../share/main-proc/terminal-config/terminal-config';
import { TerminalMode } from '../httpsend/Constant';
import { Configs } from '../../share/main-proc/terminal-config/configs.enum';
import { ERROR_MSG } from '../../share/models/response-common';
import {
    ODDS_INDICATION2,
    FootballBetObject,
    ODDS_INDICATION,
    Game,
    SHomeAwayDraw,
    SHandiHomeAwayDraw,
    SHandicap,
    STotalScore,
    SCornerHighLow,
    SHighLow,
    OOE_Result,
    HAD_Result,
} from '../../share/models/comm-serv/Football/FootballBetObject';
import { Entry } from '../../share/models/comm-serv/Entry';
import { theOddsServ } from '../addon/commservwrapper';

export type ReqHandlerCallBack = (replyMsg: any) => void;
export class ReqHandler {
    private static _instance: ReqHandler;

    constructor() {}

    public static getInstance(): ReqHandler {
        if (this._instance == null) {
            this._instance = new ReqHandler();
        }
        return this._instance;
    }

    SimulateReply(request: Messages): ByteArrayBuilder {
        customer.custType = CustomerType.CUST_QRC;
        let simReply = '';
        const betObject = request.betObj;
        const msgCode = request.messageCode;

        HttpSend.getInstance().fnIncMSN();

        const cv = false;
        simReply += String.fromCharCode(msgCode);

        // region simulate
        switch (msgCode) {
            case MessageCode.MC_RDT_RQST:
                {
                    simReply += SimReply.TRAINING_MODE_RDT;
                }
                break;

            case MessageCode.MC_SIGN_ON:
                {
                    simReply += SimReply.SIGN_ON_REPLY;
                }
                break;

            case MessageCode.MC_SIGN_OFF:
                {
                    simReply += SimReply.SIGN_OFF_REPLY;
                }
                break;
            case MessageCode.MC_CHANGE_PSWD:
                {
                }
                break;
            case MessageCode.MC_AUTHMASK:
                {
                    simReply += SimReply.GET_STAFF_AUTH_REPLY;
                }
                break;
            case MessageCode.MC_MK6_S:
            case MessageCode.MC_MK6_M:
                {
                    if (customer.isQRCCustomer) {
                        simReply += SimReply.MK6_AC_SINGLE;
                    } else {
                        simReply += SimReply.MK6_CB_SINGLE;
                    }
                }
                break;

            case MessageCode.MC_MK6_R:
                {
                    const type = betObject.type;
                    if (customer.isQRCCustomer) {
                        // Account
                        switch (type) {
                            case MK6_TYPE.MK6_RANDOM_SINGLES:
                                simReply += SimReply.MK6_AC_RANDOM_SINGLE;
                                break;
                            case MK6_TYPE.MK6_RANDOM_MULTIPLE:
                                simReply += SimReply.MK6_AC_RANDOM_MULTIPE;
                                break;
                            // case MK6_TYPE.MK6_COMPUTER_RANDOM_SINGLES:
                            // case MK6_TYPE.MK6_COMPUTER_RANDOM_MULTIPLE:
                            // case MK6_TYPE.MK6_COMPUTER_RANDOM_BANKER:
                            //     simReply += SimReply.MK6_AC_SINGLE;
                            //     break;
                            default:
                                break;
                        }
                    } else {
                        // Cash
                        switch (type) {
                            case MK6_TYPE.MK6_RANDOM_SINGLES:
                                simReply += SimReply.MK6_CB_RANDOM_SINGLE;
                                break;
                            case MK6_TYPE.MK6_RANDOM_MULTIPLE:
                                simReply += SimReply.MK6_CB_RANDOM_MULTIPE;
                                break;
                            // case MK6_TYPE.MK6_COMPUTER_RANDOM_SINGLES:
                            // case MK6_TYPE.MK6_COMPUTER_RANDOM_MULTIPLE:
                            // case MK6_TYPE.MK6_COMPUTER_RANDOM_BANKER:
                            //     simReply += SimReply.MK6_CB_SINGLE;
                            //     break;
                            default:
                                break;
                        }
                    }
                }
                break;
            case MessageCode.MC_MK6_Q:
                {
                    const type = betObject.type;
                    if (customer.isQRCCustomer) {
                        // Account
                        switch (type) {
                            case MK6_TYPE.MK6_COMPUTER_RANDOM_SINGLES:
                            case MK6_TYPE.MK6_COMPUTER_RANDOM_MULTIPLE:
                            case MK6_TYPE.MK6_COMPUTER_RANDOM_BANKER:
                                simReply += SimReply.MK6_AC_SINGLE;
                                break;
                            default:
                                break;
                        }
                    } else {
                        // Cash
                        switch (type) {
                            case MK6_TYPE.MK6_COMPUTER_RANDOM_SINGLES:
                            case MK6_TYPE.MK6_COMPUTER_RANDOM_MULTIPLE:
                            case MK6_TYPE.MK6_COMPUTER_RANDOM_BANKER:
                                simReply += SimReply.MK6_CB_SINGLE;
                                break;
                            default:
                                break;
                        }
                    }
                }
                break;

            case MessageCode.MC_BET:
                {
                    if (customer.isQRCCustomer) {
                        if (betObject.PoolType === PoolSymbol.QPTT) {
                            // region QP_TT Reply
                            const qptt_Type = betObject.Legs[0].QuickPickType;
                            if (qptt_Type === QPTT_TYPE.QPTT_A) {
                                // entry is 2
                                simReply += SimReply.QPTT_A_REPLY_2;
                            } else if (qptt_Type === QPTT_TYPE.QPTT_B) {
                                simReply += SimReply.QPTT_B_REPLY;
                            } else if (qptt_Type === QPTT_TYPE.QPTT_C) {
                                simReply += SimReply.QPTT_C_REPLY;
                            } else if (qptt_Type === QPTT_TYPE.QPTT_D) {
                                simReply += SimReply.QPTT_D_REPLY;
                            }
                            // endregion
                        } else if (betObject.PoolType === PoolSymbol.QPQTT) {
                            // #region QP_QTT Reply
                            const qpqtt_Type = betObject.Legs[0].QuickPickType;
                            if (qpqtt_Type === QPQTT_TYPE.QPQTT_A) {
                                simReply += SimReply.QPQTT_A_REPLY;
                            } else if (qpqtt_Type === QPQTT_TYPE.QPQTT_B) {
                                simReply += SimReply.QPQTT_B_REPLY;
                            } else if (qpqtt_Type === QPQTT_TYPE.QPQTT_C) {
                                simReply += SimReply.QPQTT_C_REPLY;
                            }
                            // # endregion
                        } else {
                            // #region Other Reply
                            if (betObject.IsFlexiBet) {
                                simReply += SimReply.FLEXI_BET_REPLY;
                            } else {
                                simReply += SimReply.BET_REPLY;
                            }
                            // #endregion
                        }
                    }
                }
                break;

            //    case MC_CASH_IN:
            //    case MC_CASH_OUT:
            //        {
            //            memcpy(&rpyBuf[1], CANCEL_REPLY, SHORT_TIME_LEN + MAX_DATE_LEN + 1);
            //            rpySz = SHORT_TIME_LEN + MAX_DATE_LEN + 1 + 1;
            //        }

            //    case MC_SC_BET:
            //        {
            //        }
            //        break;

            //    case MC_MK6_S:
            //        break;

            //    case MC_MK6_M:
            //        break;

            //    case MC_MK6_R:
            //        break;

            //    case MC_CVI:
            //        break;

            //    case MC_CVC:
            //        {
            //            memcpy(&rpyBuf[1], CVCASH_REPLY, sizeof(CVCASH_REPLY));
            //            rpySz = sizeof(CVCASH_REPLY) + 1;
            //        }
            //        break;

            //    case MC_ERR_REPLY:
            //        break;

            //    case MC_CANCEL:
            //        {
            //            if (cv)
            //            {
            //                memcpy(&rpyBuf[1], ESC_CANCEL_REPLY, sizeof(ESC_CANCEL_REPLY));
            //                rpySz = sizeof(ESC_CANCEL_REPLY) + 1;
            //            }
            //            else
            //            {
            //                memcpy(&rpyBuf[1], CANCEL_REPLY, sizeof(CANCEL_REPLY));
            //                rpySz = sizeof(CANCEL_REPLY) + 1;
            //            }
            //        }
            //        break;

            //    case MC_TBD:
            //        {
            //            strcpy((char*)&rpyBuf[1], TB_DEP_REPLY);
            //            rpySz = sizeof(TB_DEP_REPLY) + 1;
            //        }
            //        break;

            //    case MC_EFT:
            //        break;

            case MessageCode.MC_ESC:
                {
                    if (
                        ByteArrayBuilder.BytesToString([
                            request.message[2],
                            request.message[3],
                        ]) === Constansts.MSC_SUBCODE_QRC_ACCT_ACS
                    ) {
                        simReply = 'A' + SimReply.ACCOUNT_ACS_REPLY;
                    } else if (
                        ByteArrayBuilder.BytesToString([
                            request.message[2],
                            request.message[3],
                        ]) === Constansts.MSC_SUBCODE_QRC_ACCT_REL
                    ) {
                        simReply = 'A' + SimReply.ACCOUNT_REL_REPLY;
                    }
                    // if (request.message.length === 5) { // QRCAccountAccess
                    // simReply = 'A' + SimReply.MCESC_REPLY;
                    // } else { // QRCAccountRelease
                    //   simReply = 'AA@AA$@.@@$@.@@$@.@@!AAAAAAAA';
                    // }
                }
                break;
            // case MessageCode.MC_PAY:
            //     {
            //         simReply = 'A' + SimReply.MC_PAY;
            //     }
            //     break;
            case MessageCode.MC_TBD:
                {
                    simReply = 'A' + SimReply.MC_TBD;
                }
                break;
            //    case MC_ESC_TRANS:
            //        {
            //            memcpy(&rpyBuf[1], ESC_CASHING_REPLY, strlen(ESC_CASHING_REPLY));
            //            rpySz = strlen(ESC_CASHING_REPLY) + 1;
            //        }
            //        break;

            case MessageCode.MC_PAY:
                {
                    const bPartialPay = false,
                        bFlexi = false;
                    const i = 0; //  to assign diff reply when training mode
                    if (bFlexi) {
                        //    memcpy(&rpyBuf[1], CB_PP_REPLY, sizeof(CB_PP_REPLY));
                        //    rpySz = sizeof(CB_PP_REPLY) + 1;
                        simReply = 'A' + SimReply.CB_PP_REPLY;
                    } else if (bPartialPay) {
                        //    memcpy(&rpyBuf[1], PARTIAL_PAY_REPLY[i], strlen(PARTIAL_PAY_REPLY[i]));
                        //    rpySz = strlen(PARTIAL_PAY_REPLY[i]) + 1;a
                        simReply = 'A' + SimReply.PARTIAL_PAY_REPLY[i];
                    } else if (cv) {
                        //    memcpy(&rpyBuf[1], CV_PAY_REPLY, sizeof(CV_PAY_REPLY));
                        //    rpySz = sizeof(CV_PAY_REPLY) + 1;
                        //    rpyBuf[rpySz - 2] = 'B';
                        simReply =
                            'A' +
                            SimReply.PARTIAL_PAY_REPLY[i].substr(-2) +
                            'B' +
                            SimReply.PARTIAL_PAY_REPLY[i].substr(-1, 1);
                    } else {
                        //    memcpy(&rpyBuf[1], NORMAL_PAY_REPLY, sizeof(NORMAL_PAY_REPLY));
                        //    rpySz = sizeof(NORMAL_PAY_REPLY) + 1;
                        simReply = 'A' + SimReply.NORMAL_PAY_REPLY;
                    }
                }
                break;
            case MessageCode.MC_TEST_TKT:
                {
                    simReply = 'A563432';
                }
                break;
            //    case MC_CANENQ:     // by Chris Chan, 20130502, PSR2013 R0, BR A35a, Ticket Cancellation Control
            //        {
            //            memcpy(&rpyBuf[1], CANCEL_ENQ_REPLY, sizeof(CANCEL_ENQ_REPLY));
            //            rpySz = sizeof(CANCEL_ENQ_REPLY) + 1;
            //        }
            //        break;

            //    case MC_AUTHMASK:   // by Chris Chan, 20130502, PSR2013 R0, BR A35a, Ticket Cancellation Control
            //        {
            //            memcpy(&rpyBuf[1], GET_STAFF_AUTH_REPLY, sizeof(GET_STAFF_AUTH_REPLY));
            //            rpySz = sizeof(GET_STAFF_AUTH_REPLY) + 1;
            //        }
            //        break;

            //    default:
            //        break;
        }

        // rpy = new CScmpInPktStream(rpyBuf, rpySz);
        // return rpy;
        // #endregion

        // string test = "Reply Test";
        //// simulate the RPC callback return different message, e.g. msn error, retry.
        // Task.Factory.StartNew(() =>
        // {
        //    Thread.Sleep(2000);
        //    RxPS.Publish<ReplyMsg>(Events.COMMS_REPLY, new ReplyMsg() { message = "The Request Is Retrying...", messageCode = 123 });
        //    Thread.Sleep(2000);
        //    RxPS.Publish<ReplyMsg>(Events.COMMS_REPLY, new ReplyMsg() { message = "Please Wait...", messageCode = 123 });
        //    Thread.Sleep(2000);
        //    RxPS.Publish<ReplyMsg>(Events.COMMS_REPLY, new ReplyMsg() { message = "Be Patient...", messageCode = 123 });

        // });
        // Thread.Sleep(10000);
        const bytearray = new ByteArrayBuilder();
        bytearray.Append(simReply);
        return bytearray;
    }

    SimulateTrainingMarksixRandomReply(
        bet: MarkSixBetObject,
        reply: MSG_MarkSix_REPLY
    ) {
        if (bet.qpNumOfSeln === 6) {
            //strcpy( (char*)reply.seln, RANDOM_MK6_S_REPLY );

            //Q310 Peter See 20100722 ($20 - 2 entries for Training mode)
            //**************************************************************star feng 20150302 1-10 entries for Training mode
            switch (bet.numOfEntries) {
                case 1:
                    {
                        const selectionArray: string[] = SimReply.RANDOM_MK6_S_1_ENTRIES_REPLY.split(
                            '/'
                        );

                        for (const selectionStr of selectionArray) {
                            const entry = new Entry();
                            for (const selection of selectionStr) {
                                entry.selections.push(
                                    selection.charCodeAt(0) & 0x3f
                                );
                            }
                            reply.selections.push(entry);
                        }
                    }
                    break;
                case 2:
                    {
                        const selectionArray: string[] = SimReply.RANDOM_MK6_S_2_ENTRIES_REPLY.split(
                            '/'
                        );

                        for (const selectionStr of selectionArray) {
                            const entry = new Entry();
                            for (const selection of selectionStr) {
                                entry.selections.push(
                                    selection.charCodeAt(0) & 0x3f
                                );
                            }
                            reply.selections.push(entry);
                        }
                    }
                    break;
                case 3:
                    {
                        const selectionArray: string[] = SimReply.RANDOM_MK6_S_3_ENTRIES_REPLY.split(
                            '/'
                        );

                        for (const selectionStr of selectionArray) {
                            const entry = new Entry();
                            for (const selection of selectionStr) {
                                entry.selections.push(
                                    selection.charCodeAt(0) & 0x3f
                                );
                            }
                            reply.selections.push(entry);
                        }
                    }
                    break;
                case 4:
                    {
                        const selectionArray: string[] = SimReply.RANDOM_MK6_S_REPLY.split(
                            '/'
                        );

                        for (const selectionStr of selectionArray) {
                            const entry = new Entry();
                            for (const selection of selectionStr) {
                                entry.selections.push(
                                    selection.charCodeAt(0) & 0x3f
                                );
                            }
                            reply.selections.push(entry);
                        }
                    }
                    break;
                case 5:
                    {
                        const selectionArray: string[] = SimReply.RANDOM_MK6_S_5_ENTRIES_REPLY.split(
                            '/'
                        );

                        for (const selectionStr of selectionArray) {
                            const entry = new Entry();
                            for (const selection of selectionStr) {
                                entry.selections.push(
                                    selection.charCodeAt(0) & 0x3f
                                );
                            }
                            reply.selections.push(entry);
                        }
                    }
                    break;
                case 6:
                    {
                        const selectionArray: string[] = SimReply.RANDOM_MK6_S_6_ENTRIES_REPLY.split(
                            '/'
                        );

                        for (const selectionStr of selectionArray) {
                            const entry = new Entry();
                            for (const selection of selectionStr) {
                                entry.selections.push(
                                    selection.charCodeAt(0) & 0x3f
                                );
                            }
                            reply.selections.push(entry);
                        }
                    }
                    break;
                case 7:
                    {
                        const selectionArray: string[] = SimReply.RANDOM_MK6_S_7_ENTRIES_REPLY.split(
                            '/'
                        );

                        for (const selectionStr of selectionArray) {
                            const entry = new Entry();
                            for (const selection of selectionStr) {
                                entry.selections.push(
                                    selection.charCodeAt(0) & 0x3f
                                );
                            }
                            reply.selections.push(entry);
                        }
                    }
                    break;
                case 8:
                    {
                        const selectionArray: string[] = SimReply.RANDOM_MK6_S_8_ENTRIES_REPLY.split(
                            '/'
                        );

                        for (const selectionStr of selectionArray) {
                            const entry = new Entry();
                            for (const selection of selectionStr) {
                                entry.selections.push(
                                    selection.charCodeAt(0) & 0x3f
                                );
                            }
                            reply.selections.push(entry);
                        }
                    }
                    break;
                case 9:
                    {
                        const selectionArray: string[] = SimReply.RANDOM_MK6_S_9_ENTRIES_REPLY.split(
                            '/'
                        );

                        for (const selectionStr of selectionArray) {
                            const entry = new Entry();
                            for (const selection of selectionStr) {
                                entry.selections.push(
                                    selection.charCodeAt(0) & 0x3f
                                );
                            }
                            reply.selections.push(entry);
                        }
                    }
                    break;
                case 10:
                    {
                        const selectionArray: string[] = SimReply.RANDOM_MK6_S_10_ENTRIES_REPLY.split(
                            '/'
                        );

                        for (const selectionStr of selectionArray) {
                            const entry = new Entry();
                            for (const selection of selectionStr) {
                                entry.selections.push(
                                    selection.charCodeAt(0) & 0x3f
                                );
                            }
                            reply.selections.push(entry);
                        }
                    }
                    break;
                default:
                    //strcpy( (char*)reply.seln, RANDOM_MK6_S_1_ENTRIES_REPLY );
                    break;
            }
            //if ( theTerminal.isNewM6UnitBetValueEnabled() ) {
            //	strcpy( (char*)reply.seln, RANDOM_MK6_S_2_ENTRIES_REPLY );
            //}
            //else{
            //	strcpy( (char*)reply.seln, RANDOM_MK6_S_REPLY );
            //}
            //**************************************************************
        } else {
            const entry = new Entry();
            let cnt = 0;
            for (const selection of SimReply.RANDOM_MK6_M_REPLY) {
                entry.selections.push(selection.charCodeAt(0) & 0x3f);
                cnt++;
                if (cnt === bet.qpNumOfSeln) break;
            }
            reply.selections.push(entry);
        }
        reply.drawDate = SimReply.DRAW_DATE;
        // by Ethan, 20190114, Sp21a eWallet Enhancement

        reply.bcn = SimReply.BCN_REPLY_19;
        reply.tsn = SimReply.CB_TSN_REPLY_19;
        reply.unitBet = SimReply.UNIT_BET;
        reply.total = SimReply.BET_TOTAL_REPLY;
        HttpSend.getInstance().fnIncMSN();

        // if (bet.gmType === GAME_ADD_ON) {
        //     byte tmp[NUM_OF_ADD_ON_NUM];
        //     memcpy(tmp, MK6_ADDON_REPLY, NUM_OF_ADD_ON_NUM);
        //     for (int i = 0; i < NUM_OF_ADD_ON_NUM; i++ ) {
        //         tmp[i] = tmp[i] & 0x3f;
        //     }
        //     lot.setAddOnSeln(tmp);
        // }
        // By Chris Chan, 20130524
        // PSR2013 R0
        // BR A35a, Ticket Cancellation Control
        return true;
    }
    private checkFGS(scBet: FootballBetObject): boolean {
        const bFind = true;

        // if (scBet.scBetType === SCBET_TYPE.MATCH_BET &&
        //     scBet.game().getPoolCode() === PCODE.PC_FGS) {

        //     bFind = false;

        //     const m = theOddsServ.getMatch(scBet.game().matchNumber(), scBet.game().matchDay());
        //     int listSz = m -> getPlayerList().GetCount(),
        //         cxtCnt = scBet.game().numOfContexts(),
        //         combination = -1,
        //         i = 0, j = 0;
        //     CPlayer player;
        //     POSITION pos;

        //     for (i = 0; i < cxtCnt; i++) {
        //         bFind = false;
        //         combination = scBet.game().context(i).getScContext().S_FirstScorer.playerID;
        //         for (j = 0; j < listSz; j++) {
        //             if (combination == 0 ||      //  NOSCORER
        //                 combination == 120 ||      //  HOME OTHERS
        //                 combination == 220) { //  AWAY OTHERS
        //                 bFind = true;
        //                 break;          // break j loop
        //             }
        //             else {
        //                 pos = m -> getPlayerList().FindIndex(j);
        //                 if (pos) {
        //                     player = m -> getPlayerList().GetAt(pos);
        //                     if (combination == player.combination()) {
        //                         bFind = true;
        //                         break;  // break j loop
        //                     }
        //                 }
        //             }
        //         }
        //     }
        // }
        return bFind;
    }

    public SimulateTrainingFootballReply(
        scbet: FootballBetObject,
        reply: MSG_Football_REPLY
    ): boolean {
        let bRet = true;
        if (this.checkFGS(scbet)) {
            // no need to pack send message
            reply.OddsFlag = 0;
            reply.date = Constansts.TRAINING_DATE;
            reply.time = Constansts.TRAINING_TIME;
            // by Ethan, 20190114, Sp21a eWallet Enhancement

            reply.tsn = Constansts.ESC_TSN_REPLY_19;
            reply.txn = Constansts.ESC_TXN_REPLY;

            reply.total = Constansts.BET_TOTAL_REPLY;

            if (
                scbet.oddsIndicator === ODDS_INDICATION.FIXED_ODDS_WITHOUT_ODDS
            ) {
                //this.getOdds(scbet);
            }

            // RHO add to supprot STB section bet bonus
            if (scbet.oddsIndicator2 === ODDS_INDICATION2.SECTION_BET) {
                for (let i = 0; i < 3; i++) {
                    reply.poolBonus[i].pc = PCODE.PC_STB;
                    reply.poolBonus[i].singlePoolBonus = 0;
                }

                // RHO for training mode hardcode a fixed bonus for 8x or 4x pool
                if (scbet.bonusLevel === 8) {
                    // VC8                            for ( i = 0; i < scbet.getBonusLevel(); i++) {
                    for (let i = 0; i < scbet.bonusLevel; i++) {
                        reply.allUpBonus[i] = 8888;
                    }
                } else if (scbet.bonusLevel === 4) {
                    // VC8 for ( i = 0; i < scbet.getBonusLevel(); i++) {
                    for (let i = 0; i < scbet.bonusLevel; i++) {
                        reply.allUpBonus[i] = 4444;
                    }
                }
            }
            // else { // RHO don't care about bonus for other pool other than STB in training mode
            // processBonus(*rpy, reply, scbet.getBonusLevel() );
            // }
            HttpSend.getInstance().fnIncMSN();
            // theTerminal.incMsn();
        } else {
            // by Samuel Chan, 20140724
            // MSR2015, The MFC control cannot display Chinese character out of CP due to project setting multi-byte
            // To convert widechar to multibyte, the send in/out message & hardware information should be byte array not short array.
            bRet = false;
            throw new ComSvrException(ERROR_MSG.RID_EX_TKT_ILL_SELECTION);
        }
        return bRet;
    }
    // getOdds(scbet: FootballBetObject) {
    //     let gameCount = 0;
    //     let contextCount = 0;
    //     let linenum = 0; // by Star, 2015/09/10, Multiple Lines, store line number
    //     let day, number, pool, comb;
    //     let odds;
    //     // use the gameList to set odds for each context
    //     //
    //     gameCount = scbet.getNumOfGames();
    //     for (let i = 0; i < gameCount; i++) {
    //         // copy the current game for iteration
    //         let game: Game = scbet.game(i);
    //         // get the context count
    //         contextCount = game.numOfContexts;
    //         for (let j = 0; j < contextCount; j++) {
    //             day = game.matchDay;
    //             number = game.matchNumber;
    //             pool = game.getPool().code;
    //             linenum = game.nItemNum; // by Star, 2015/09/10, Multiple Lines, get item line number
    //             switch (pool) {
    //                 case PCODE.PC_HAD:
    //                 case PCODE.PC_AHAD:
    //                 case PCODE.PC_FHAD:
    //                 case PCODE.PC_FTS: //	Mar2011 M2
    //                     {
    //                         //comb = game.context(j).getScContext().S_HomeAwayDraw.result;
    //                         const S_HomeAwayDraw = game.context(j)
    //                             .scContext as SHomeAwayDraw;
    //                         comb = S_HomeAwayDraw.result;
    //                         odds = theOddsServ.getOdds64(
    //                             day,
    //                             number,
    //                             pool,
    //                             comb
    //                         );
    //                     }
    //                     break;
    //                 case PCODE.PC_HHAD:
    //                 case PCODE.PC_AHHAD:
    //                     {
    //                         //comb = game.context(j).getScContext().S_HandiHomeAwayDraw.result;
    //                         const S_HandiHomeAwayDraw = game.context(j)
    //                             .scContext as SHandiHomeAwayDraw;
    //                         comb = S_HandiHomeAwayDraw.result;
    //                         odds = theOddsServ.getOdds64(
    //                             day,
    //                             number,
    //                             pool,
    //                             comb
    //                         );
    //                         //char cond[HHAD_COND_LEN+1] = {0x00,0x00,0x00};
    //                         let cond: string = '';
    //                         theOddsServ.getHhadCondChar(
    //                             game.matchDay,
    //                             game.matchNumber,
    //                             cond
    //                         );
    //                         game.context(j).setHhadCond(cond);
    //                     }
    //                     break;
    //                 case PCODE.PC_HDC:
    //                     {
    //                         //comb = game.context(j).getScContext().S_Handicap.result;
    //                         const S_Handicap = game.context(j)
    //                             .scContext as SHandicap;
    //                         comb = S_Handicap.result;
    //                         odds = theOddsServ.getOdds64(
    //                             day,
    //                             number,
    //                             pool,
    //                             comb
    //                         );
    //                         //char cond1[HDC_COND_LEN+1] = {0x00,0x00,0x00,0x00,0x00};
    //                         //char cond2[HDC_COND_LEN+1] = {0x00,0x00,0x00,0x00,0x00};
    //                         let cond1: string = '';
    //                         let cond2: string = '';
    //                         theOddsServ.getHdcCondChar(
    //                             game.matchDay,
    //                             game.matchNumber,
    //                             HDC_ODDS.HDC_CONDITION1,
    //                             cond1
    //                         );
    //                         theOddsServ.getHdcCondChar(
    //                             game.matchDay,
    //                             game.matchNumber,
    //                             HDC_ODDS.HDC_CONDITION2,
    //                             cond2
    //                         );
    //                         game.context(j).setHdcCond(cond1, cond2);
    //                     }
    //                     break;
    //                 case PCODE.PC_TTG:
    //                     //comb = game.context(j).getScContext().S_TotalScore.totalScore;
    //                     const S_TotalScore = game.context(j)
    //                         .scContext as STotalScore;
    //                     comb = S_TotalScore.totalScore;
    //                     odds = theOddsServ.getOdds64(day, number, pool, comb);
    //                     break;
    //                 case PCODE.PC_CRS:
    //                 case PCODE.PC_ACRS:
    //                 case PCODE.PC_FCRS: //by Ken Lam, MSR2012 FCRS
    //                     // scbet.convert2Combination(PC_CRS,
    //                     scbet.convert2Combination(
    //                         pool, //modified by Ken Lam, MSR2012 FCRS
    //                         game.context(j).scContext.S_CorrectScore.homeScores,
    //                         game.context(j).scContext.S_CorrectScore.awayScores,
    //                         comb
    //                     );
    //                     odds = theOddsServ.getOdds64(day, number, pool, comb);
    //                     break;
    //                 case PCODE.PC_CHLO: //	PSR2013 CHLO, 20130610
    //                     {
    //                         //if( theTerminal.isMultiLinesEnabled()==false ) { //by Ben, 2015/12/09, fix send BE message format
    //                         //comb = game.context(j).getScContext().S_CornerHighLow.hilo;
    //                         const S_CornerHighLow = game.context(j)
    //                             .scContext as SCornerHighLow;
    //                         comb = S_CornerHighLow.hilo;
    //                         odds = theOddsServ.getOdds64(
    //                             day,
    //                             number,
    //                             pool,
    //                             comb,
    //                             linenum
    //                         ); // by Star, 2015/09/10, Multiple Lines, pass line number as param to get this line odds
    //                         // char corner1[CHLO_CORNER_LEN+1] = {0x00,0x00,0x00,0x00,0x00};
    //                         // char corner2[CHLO_CORNER_LEN+1] = {0x00,0x00,0x00,0x00,0x00};
    //                         let corner1: string = '';
    //                         let corner2: string = '';
    //                         theOddsServ.getHiloScore(
    //                             game.matchDay,
    //                             game.matchNumber,
    //                             HDC_ODDS.HDC_CONDITION1,
    //                             corner1,
    //                             pool,
    //                             linenum
    //                         ); // by Star, 2015/09/10, Multiple Lines, pass line number as param to get this line odds
    //                         theOddsServ.getHiloScore(
    //                             game.matchDay,
    //                             game.matchNumber,
    //                             HDC_ODDS.HDC_CONDITION2,
    //                             corner2,
    //                             pool,
    //                             linenum
    //                         ); // by Star, 2015/09/10, Multiple Lines, pass line number as param to get this line odds
    //                         game.context(j).setComparedCorners(
    //                             corner1,
    //                             corner2
    //                         );
    //                         //	}
    //                         //	else
    //                         //		continue;
    //                     }
    //                     break;
    //                 case PCODE.PC_HIL:
    //                 case PCODE.PC_FHLO: //	MR2011 FHLO
    //                     {
    //                         //	if( theTerminal.isMultiLinesEnabled()==false ) { //by Ben, 2015/12/09, fix send BE message format
    //                         //comb = game.context(j).getScContext().S_HighLow.hilo;
    //                         const S_HighLow = game.context(j)
    //                             .scContext as SHighLow;
    //                         comb = S_HighLow.hilo;
    //                         odds = theOddsServ.getOdds64(
    //                             day,
    //                             number,
    //                             pool,
    //                             comb,
    //                             linenum
    //                         ); // by Star, 2015/09/10, Multiple Lines, pass line number as param to get this line odds
    //                         // char score1[HILO_SCORE_LEN+1] = {0x00,0x00,0x00,0x00};
    //                         // char score2[HILO_SCORE_LEN+1] = {0x00,0x00,0x00,0x00};
    //                         let score1 = '';
    //                         let score2 = '';
    //                         //	MR2011 FHLO
    //                         //	by Samuel Chan, 20110902
    //                         //	also pass pool code to indicate Hil or FHLO
    //                         theOddsServ.getHiloScore(
    //                             game.matchDay,
    //                             game.matchNumber,
    //                             HDC_ODDS.HDC_CONDITION1,
    //                             score1,
    //                             pool,
    //                             linenum
    //                         ); // by Star, 2015/09/10, Multiple Lines, pass line number as param to get this line odds
    //                         theOddsServ.getHiloScore(
    //                             game.matchDay,
    //                             game.matchNumber,
    //                             HDC_ODDS.HDC_CONDITION2,
    //                             score2,
    //                             pool,
    //                             linenum
    //                         ); // by Star, 2015/09/10, Multiple Lines, pass line number as param to get this line odds
    //                         game.context(j).setComparedScores(score1, score2);
    //                         //	}
    //                         //	else
    //                         //		continue;
    //                     }
    //                     break;
    //                 case PCODE.PC_FGS:
    //                     comb = game.context(j).getPlayerId_combination();
    //                     odds = theOddsServ.getOdds64(day, number, pool, comb);
    //                     break;
    //                 case PCODE.PC_OOE:
    //                     comb = game.context(j).scContext.S_OddEven.odd;
    //                     {
    //                         if (comb == OOE_Result.OOE_EVEN)
    //                             comb = OOE_Result.OOE_EVEN;
    //                         else comb = OOE_Result.OOE_ODD;
    //                     }
    //                     odds = theOddsServ.getOdds64(day, number, pool, comb);
    //                     break;
    //                 case PCODE.PC_TQL: //  Q407
    //                     comb = game.context(j).scContext.S_ToQualify.result;
    //                     odds = theOddsServ.getOdds64(day, number, pool, comb);
    //                     break;
    //                 case PCODE.PC_HFT: {
    //                     let half, full;
    //                     half = game.context(j).scContext.S_HalfFullTime
    //                         .halfTimeResult;
    //                     full = game.context(j).scContext.S_HalfFullTime
    //                         .halfTimeResult;
    //                     if (
    //                         half == HAD_Result.HOME_WIN &&
    //                         full == HAD_Result.HOME_WIN
    //                     )
    //                         comb = HFT_ODDS.HFT1_1;
    //                     else if (
    //                         half == HAD_Result.HOME_WIN &&
    //                         full == HAD_Result.DRAW
    //                     )
    //                         comb = HFT_ODDS.HFT1_X;
    //                     else if (
    //                         half == HAD_Result.HOME_WIN &&
    //                         full == HAD_Result.AWAY_WIN
    //                     )
    //                         comb = HFT_ODDS.HFT1_2;
    //                     else if (
    //                         half == HAD_Result.DRAW &&
    //                         full == HAD_Result.HOME_WIN
    //                     )
    //                         comb = HFT_ODDS.HFTX_1;
    //                     else if (
    //                         half == HAD_Result.DRAW &&
    //                         full == HAD_Result.DRAW
    //                     )
    //                         comb = HFT_ODDS.HFTX_X;
    //                     else if (
    //                         half == HAD_Result.DRAW &&
    //                         full == HAD_Result.AWAY_WIN
    //                     )
    //                         comb = HFT_ODDS.HFTX_2;
    //                     else if (
    //                         half == HAD_Result.AWAY_WIN &&
    //                         full == HAD_Result.HOME_WIN
    //                     )
    //                         comb = HFT_ODDS.HFT2_1;
    //                     else if (
    //                         half == HAD_Result.AWAY_WIN &&
    //                         full == HAD_Result.DRAW
    //                     )
    //                         comb = HFT_ODDS.HFT2_X;
    //                     else if (
    //                         half == HAD_Result.AWAY_WIN &&
    //                         full == HAD_Result.AWAY_WIN
    //                     )
    //                         comb = HFT_ODDS.HFT2_2;
    //                     odds = theOddsServ.getOdds64(day, number, pool, comb);
    //                     break;
    //                 }
    //                 case PCODE.PC_CRSP:
    //                 case PCODE.PC_HCSP:
    //                 case PCODE.PC_HFTP:
    //                 //            case PC_HFMP:
    //                 case PCODE.PC_HFMP6:
    //                 case PCODE.PC_HFMP8:
    //                 case PCODE.PC_THFP:
    //                 case PCODE.PC_CHP:
    //                 default:
    //                     break;
    //             }
    //             game.context(j).odds = odds;
    //         } // for
    //     }
    // }

    ProcessRequest(msg: Messages, callback: ReqHandlerCallBack) {
        let bb = Array.prototype.map
            .call(msg.message, (d) => d.toString(16))
            .join(' ');
        logger.info('msgFormat :' + bb);
        logger.info('msgFormat :' + msg.message.toString());

        const http = HttpSend.getInstance();
        http.sendRecvMonitorThread(msg, callback, true);
    }

    ProcessUnsolicitedRequest(msg: Messages, callback: ReqHandlerCallBack) {
        const http = HttpSend.getInstance();
        http.unsolicitedSend(msg, callback);
    }
}
