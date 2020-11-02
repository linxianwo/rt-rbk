import { ByteArrayBuilder } from './byteArrayBuilder';
import {
    MSG_MarkSix_REPLY,
    MSG_BET_REPLY,
    MSG_Football_REPLY,
    MSG_ESC_ACC_ACS_REPLY,
    MSG_QRC_ACC_REL_REPLY,
    MSG_PAY_REPLY,
    MSG_TB_DEP_REPLY,
    MSG_SIGN_ON_REPLY,
    MSG_SIGN_OFF_REPLY,
    MSG_OPT_FUNC_REPLY,
    MSG_STAFF_AUTH_REPLY,
    MSG_GET_RDT_REPLY,
} from '../../share/models/comm-serv/Messages';
import { MarkSixBetObject } from '../../share/models/comm-serv/MarSix/MarkSixBetObject';
import {
    MessageCode,
    MaxValue,
    Constansts,
    PayIndicator,
    PartialPayTkt,
    PCODE,
    MSG_PCODE,
} from '../../share/models/comm-serv/CommonDefs';
import { customer } from '../../share/main-proc/customer/customer';
import { CustomerType } from '../../share/main-proc/customer/customer.enum';
import { MK6_TYPE } from '../../share/models/comm-serv/MarSix/Enums';
import { Entry } from '../../share/models/comm-serv/Entry';
import { RacingBetObject } from '../../share/models/comm-serv/Racing/RacingBetObject';
import { PoolSymbol } from '../../share/models/comm-serv/Racing/PoolType';
import { ComSvrException } from './comSvrException';
import { logger } from '../../share/utils/logs';
import {
    ResponseObject,
    ResponseObjectCode,
    ERROR_MSG,
} from '../../share/models/response-common';
import { SYSTEM_ERROR } from '../../share/models/errorMessage';
import { internalParam } from '../../share/main-proc/internalParam/internalParam';
import { terminalConfig } from '../../share/main-proc/terminal-config/terminal-config';
import {
    FootballBetObject,
    SCBET_TYPE,
    SHandicap,
    SHandiHomeAwayDraw,
    SCornerHighLow,
    SHighLow,
    Context,
    ODDS_INDICATION2,
} from '../../share/models/comm-serv/Football/FootballBetObject';
import { StringDecoder } from 'string_decoder';
import { MsgFormatter } from './msgFormatter';
import { strict } from 'assert';
import { constants } from 'os';

export class ReplyProcessor {
    // region 1-BCServ

    // endregion

    // region 2 - BettingServ

    public static ProcessMarkSixReply(
        msgReply: ByteArrayBuilder,
        mk6Reply: MSG_MarkSix_REPLY,
        mk6: MarkSixBetObject
    ): boolean {
        let result = true;

        try {
            if (msgReply.GetMsgCode() === MessageCode.MC_ERR_REPLY) {
                result = false;
                mk6Reply.errorText = msgReply.GetErrorText();
            } else {
                let offset = 1;

                mk6Reply.drawDate = msgReply.ExtractFixStr(
                    offset,
                    MaxValue.MAX_DATE_LEN
                );
                offset += MaxValue.MAX_DATE_LEN;

                mk6Reply.drawYr = msgReply.ExtractFixStr(offset, 2);
                offset += mk6Reply.drawYr.length;

                offset++; // skip '/'

                mk6Reply.drawID = msgReply.ExtractFixStr(offset, 3);
                offset += mk6Reply.drawID.length;

                offset++; // skip '/'
                offset++; // // skip game tpye since already known

                mk6Reply.tsn = ReplyProcessor.getTsn(msgReply, offset);
                offset += mk6Reply.tsn.length;

                offset++; // skip '/'

                const tempXXN = ReplyProcessor.getTxnBcn(msgReply, offset);
                offset += tempXXN.length;

                // Assume the customer is QRC customer
                if (customer.isQRCCustomer) {
                    if (tempXXN.length === MaxValue.MAX_TXN_LEN) {
                        mk6Reply.txn = tempXXN;
                    }
                } else {
                    if (
                        tempXXN.length === MaxValue.MAX_BCN_LEN ||
                        tempXXN.length === MaxValue.MAX_BCN_LEN_19
                    ) {
                        mk6Reply.bcn = tempXXN;
                    }
                }

                const type = mk6.type;

                if (
                    type === MK6_TYPE.MK6_RANDOM_SINGLES ||
                    type === MK6_TYPE.MK6_RANDOM_MULTIPLE
                ) {
                    mk6Reply.total = msgReply.ExtractMoney_();
                    offset = msgReply.Position;
                    offset++; // skip '/'
                    offset++; // skip the 'S' or 'M'
                    offset++; // skip '/' again

                    const selectionLength = msgReply.ExtractFindByte(
                        offset,
                        Constansts.DOLLAR_SIGN.charCodeAt(0)
                    );
                    const selections = msgReply.ExtractFixStr(
                        offset,
                        selectionLength
                    );
                    offset += selections.length;

                    const selectionArray: string[] = selections.split('/');

                    for (const selectionStr of selectionArray) {
                        const entry = new Entry();
                        for (const selection of selectionStr) {
                            entry.selections.push(
                                selection.charCodeAt(0) & 0x3f
                            );
                        }
                        mk6Reply.selections.push(entry);
                    }

                    mk6Reply.unitBet = msgReply.ExtractMoney_();
                } else {
                    mk6Reply.total = msgReply.ExtractMoney_();
                    mk6Reply.unitBet = msgReply.ExtractMoney_();
                    // no addon, right? yes
                }
            }
        } catch (err) {
            if (err instanceof ComSvrException) {
                result = false;
                throw err;
            } else {
                result = false;
                throw err;
            }
        }

        return result;
    }

    public static ProcessPlaceRacingReply(
        msgReply: ByteArrayBuilder,
        bet: RacingBetObject,
        reply: MSG_BET_REPLY
    ): boolean {
        // win "DNNNNNNNNNNNNNNNNNNN/ABCD$A@@.@@"
        // all-up win 2X1 2*1+2>3*1+2 DNNNNNNNNNNNNNNNNNNN/@GIA/A@$B@.@@@@$A@@.@@
        let result = true;
        if (msgReply.GetMsgCode() === MessageCode.MC_ERR_REPLY) {
            result = false;
            reply.errorText = msgReply.GetErrorText();
        } else {
            if (bet.PoolType === PoolSymbol.QPQTT) {
                result = ReplyProcessor.ProcessQPQTTReply(msgReply, bet, reply);
            } else if (bet.PoolType === PoolSymbol.QPTT) {
                result = ReplyProcessor.ProcessQPTTReply(msgReply, reply);
            } else {
                result = ReplyProcessor.ProcessBetReply(msgReply, bet, reply);
            }
        }

        return result;
    }

    public static convertBcd2Str(instr: string): string {
        let out = '';
        for (let i = 0; i < instr.length; ++i) {
            if (instr[i] >= '@' && instr[i] <= 'I') {
                out += String.fromCharCode(
                    instr[i].charCodeAt(0) -
                        '@'.charCodeAt(0) +
                        '0'.charCodeAt(0)
                );
            } else {
                out += String.fromCharCode(instr[i].charCodeAt(0) - 9);
            }
        }
        return out;
    }
    // PSR2013 CHLO, 20130613
    public static convertBin6ToStr(instr: string): string {
        let out = '';
        for (let i = 0; i < instr.length; ++i) {
            if (instr[i] >= '@' && instr[i] <= 'I') {
                out += String.fromCharCode(
                    instr[i].charCodeAt(0) -
                        '@'.charCodeAt(0) +
                        '0'.charCodeAt(0)
                );
            } else if (instr[i] > 'I' && instr[i] <= 'h') {
                out += String.fromCharCode(
                    instr[i].charCodeAt(0) -
                        Math.floor('@'.charCodeAt(0)) / 10 +
                        '0'.charCodeAt(0)
                );
                out += String.fromCharCode(
                    ((instr[i].charCodeAt(0) - '@'.charCodeAt(0)) % 10) +
                        '0'.charCodeAt(0)
                );
            } else {
                out += String.fromCharCode(instr[i].charCodeAt(0) - 9);
            }
        }
        return out;
    }
    private static getTOdds(
        scbet: FootballBetObject,
        rpy: ByteArrayBuilder,
        reply: MSG_Football_REPLY
    ) {
        let gameCount = 0;
        let contextCount = 0;
        let pool = 0;
        let offset = rpy.Position;

        // use the gameList to set odds for each context
        //
        gameCount = scbet.getNumOfTGames();
        for (let i = 0; i < gameCount; i++) {
            // copy the current game for iteration
            const tgame = scbet.tgame(i);
            // get the context count
            contextCount = tgame.numOfContexts;
            for (let j = 0; j < contextCount; j++) {
                pool = tgame.getPool().code;
                // current rpy[cursor] == '/' or '+'
                ++offset;
                const temp = rpy.ExtractOdds(offset);
                offset = rpy.Position;
                // default indicator == FIXED_ODDS_WITHOUT_ODDS
                tgame.context(j).odds = temp;
            } // for
        } // for
    }
    private static replacePos(strObj: string, index, replacetext: string) {
        const str =
            strObj.substr(0, index) +
            replacetext +
            strObj.substring(index + 1, strObj.length);
        return str;
    }
    private static convertBcd2HdcChar(instr: string): string {
        let out = this.convertBcd2Str(instr);

        for (let i = 0; i < instr.length; i++) {
            if (out[i] === '%') {
                out = this.replacePos(out, i, '.');
            } else if (out[i] === '$') {
                out = this.replacePos(out, i, '-');
            }
        }
        return out;
    }

    private static convertBin6ToChloChar(instr: string): string {
        let out = this.convertBin6ToStr(instr);

        for (let i = 0; i < instr.length; i++) {
            if (out[i] === '%') {
                out = this.replacePos(out, i, '.');
            } else if (out[i] === '$') {
                out = this.replacePos(out, i, '-');
            }
        }
        return out;
    }
    private static handleHandicapCondition(
        pool: number,
        rpy: ByteArrayBuilder,
        cxt: Context
    ) {
        let i = 0;
        const temp = [0x00, 0x00, 0x00, 0x00, 0x00];
        let offset = rpy.Position;
        let tempchar = '';
        // stream in '+'/'-' for handicap
        //
        tempchar = rpy.GetChar(offset);
        if (tempchar === '-') {
            temp[i++] = rpy.ExtractFixStr(offset, 1).charCodeAt(0);
            offset = rpy.Position;
        }

        temp[i++] = rpy.ExtractFixStr(offset, 1).charCodeAt(0);
        offset = rpy.Position;

        tempchar = rpy.GetChar(offset);
        if (tempchar === '.') {
            temp[i++] = rpy.ExtractFixStr(offset, 1).charCodeAt(0);
            offset = rpy.Position;
            temp[i++] = rpy.ExtractFixStr(offset, 1).charCodeAt(0);
            offset = rpy.Position;
        }

        if (pool === PCODE.PC_HDC) {
            (cxt.scContext as SHandicap).firstHandicap = this.convertBcd2HdcChar(
                ByteArrayBuilder.BytesToString(temp)
            );
        } else if (pool === PCODE.PC_HHAD) {
            (cxt.scContext as SHandiHomeAwayDraw).handicap = this.convertBcd2HdcChar(
                ByteArrayBuilder.BytesToString(temp)
            );
        } else if (pool === PCODE.PC_CHLO) {
            // 	PSR2013 CHLO, 20130613
            (cxt.scContext as SCornerHighLow).comparedCorner1 = this.convertBin6ToChloChar(
                ByteArrayBuilder.BytesToString(temp)
            );
        } else {
            //  HILO
            (cxt.scContext as SHighLow).comparedScores1 = this.convertBin6ToChloChar(
                ByteArrayBuilder.BytesToString(temp)
            );
        }

        //  this is an odds indicator, which means there is no slpit condition
        offset = rpy.Position;
        tempchar = rpy.GetChar(offset);
        if (tempchar === '>') {
            return;
        } else {
            //  split

            //  reset i to zero to stream in the second condition
            i = 0;
            // stream in '+'/'-' for handicap
            //
            if (tempchar === '-') {
                temp[i++] = rpy.ExtractFixStr(offset, 1).charCodeAt(0);
                offset = rpy.Position;
            }

            temp[i++] = rpy.ExtractFixStr(offset, 1).charCodeAt(0);
            offset = rpy.Position;

            tempchar = rpy.GetChar(offset);
            if (tempchar === '.') {
                temp[i++] = rpy.ExtractFixStr(offset, 1).charCodeAt(0);
                offset = rpy.Position;
                temp[i++] = rpy.ExtractFixStr(offset, 1).charCodeAt(0);
                offset = rpy.Position;
            }

            if (pool === PCODE.PC_HDC) {
                (cxt.scContext as SHandicap).secondHandicap = this.convertBcd2HdcChar(
                    ByteArrayBuilder.BytesToString(temp)
                );
            } else if (pool === PCODE.PC_CHLO) {
                (cxt.scContext as SCornerHighLow).comparedCorner2 = this.convertBin6ToChloChar(
                    ByteArrayBuilder.BytesToString(temp)
                );
            } else {
                //  HILO
                (cxt.scContext as SHighLow).comparedScores2 = this.convertBin6ToChloChar(
                    ByteArrayBuilder.BytesToString(temp)
                );
            }
        }
    }

    ////////////////////////////////////////////////////////////////////////////////
    //
    //  getOdds(CScBet&, CScmpInPktStream&, MSG_SCBET_REPLY& )
    //
    //  get odds and condition (if any) from the packet, and put them in CScet
    //
    ////////////////////////////////////////////////////////////////////////////////
    public static getOdds(
        scbet: FootballBetObject,
        rpy: ByteArrayBuilder,
        reply: MSG_Football_REPLY
    ) {
        if (scbet.scBetType === SCBET_TYPE.TOUR_BET) {
            this.getTOdds(scbet, rpy, reply);
        } else {
            let gameCount = 0;
            let contextCount = 0;
            let pool = 0;
            let offset = rpy.Position;

            // use the gameList to set odds for each context
            //
            gameCount = scbet.getNumOfGames();
            for (let i = 0; i < gameCount; i++) {
                // copy the current game for iteration
                const game = scbet.game(i);
                // get the context count
                contextCount = game.numOfContexts;
                for (let j = 0; j < contextCount; j++) {
                    pool = game.getPool().code;
                    // current rpy[cursor] == '/' or '+'
                    ++offset;
                    // get game selection according to cpool
                    switch (pool) {
                        case PCODE.PC_HDC:
                        case PCODE.PC_HIL:
                        case PCODE.PC_FHLO: // 	SQ53781: FHLO has a goal line before odds, so also need to handle
                        case PCODE.PC_CHLO: // 	PSR2013 CHLO
                        case PCODE.PC_HHAD:
                        case PCODE.PC_AHHAD:
                            this.handleHandicapCondition(
                                pool,
                                rpy,
                                game.context(j)
                            );
                            break;

                        default:
                            break;
                    } // switch

                    // default indicator == FIXED_ODDS_WITHOUT_ODDS
                    const temp = rpy.ExtractOdds(offset);
                    offset = rpy.Position;
                    game.context(j).odds = temp;
                } // for
            } // for
        }
    }

    public static processSTBBonus(
        msgReply: ByteArrayBuilder,
        reply: MSG_Football_REPLY,
        level: number,
        noofLegs: number
    ) {
        //  reset those bonus fields in reply structure
        //
        for (let i = 0; i < Constansts.MAX_NUM_OF_POOLS_FOR_XPOOL; i++) {
            reply.poolBonus[i].pc = PCODE.PC_STB;
            reply.poolBonus[i].singlePoolBonus = 0;
        }

        let trash = '';
        let numOfPools = 0;
        let offset = msgReply.Position;
        let tempchar = '';
        trash = msgReply.ExtractFixStr(offset, 1);
        offset = msgReply.Position; //  % separator

        do {
            // tslint:disable-next-line: max-line-length
            trash = msgReply.ExtractFixStr(offset, 1);
            offset = msgReply.Position; // pool code but do not use it because the received pool code is the same as HAD which have to be set as STB for printing receipt purpose
            //  still in Single Pool Bonus
            reply.poolBonus[numOfPools].singlePoolBonus = msgReply.ExtractBonus(
                offset
            );
            offset = msgReply.Position;
            reply.poolBonus[numOfPools].pc = PCODE.PC_STB; // set pool code as STB for all level
            numOfPools++;
            tempchar = msgReply.GetChar(offset);
        } while (tempchar !== '/');

        ++offset; //  '/' seperator

        //  all up level
        //  start from level 2
        // VC8        for (i = 0; i < noofLegs - 1; i++ ) {
        for (let i = 0; i < noofLegs - 1; i++) {
            // tslint:disable-next-line: max-line-length
            trash = msgReply.ExtractFixStr(offset, 1);
            offset = msgReply.Position; // Get all Up level but don't need to store it e.g. 2 to 4 for 4X 2 to 8 for 8X STB
            // tslint:disable-next-line: max-line-length
            reply.allUpBonus[i] = msgReply.ExtractBonus(offset);
            offset = msgReply.Position; // Only the last level will contain the bonus for 4X 2 to 3 will be 0.00 for 8X 2 to 7 will be 0.00
        }

        // VC8 for (i = 0; i < noofLegs; i++) { // To set all other level to that same as the last one for easy bonus value extraction
        for (let i = 0; i < noofLegs; i++) {
            // To set all other level to that same as the last one for easy bonus value extraction
            reply.allUpBonus[i] = reply.allUpBonus[noofLegs - 2];
        }
    }
    public static processBonus(
        msgReply: ByteArrayBuilder,
        reply: MSG_Football_REPLY,
        nLevel: number
    ) {
        //  reset those bonus fields in reply structure
        //
        for (let i = 0; i < Constansts.MAX_NUM_OF_POOLS_FOR_XPOOL; i++) {
            reply.poolBonus[i].pc = PCODE.PC_XXX;
            reply.poolBonus[i].singlePoolBonus = 0;
        }

        let trash = '';
        let numOfPools = 0;
        let offset = msgReply.Position;
        let tempchar = '';
        trash = msgReply.ExtractFixStr(offset, 1);
        offset = msgReply.Position; //  % separator

        do {
            //  still in Single Pool Bonus
            trash = msgReply.ExtractFixStr(offset, 1);
            offset = msgReply.Position;
            reply.poolBonus[numOfPools].singlePoolBonus = msgReply.ExtractBonus(
                offset
            );
            offset = msgReply.Position;

            trash = String.fromCharCode(trash[0].charCodeAt(0) & 0x3f); //  turn bit 6 off

            //  map pool code
            //  support HHH only
            //
            switch (trash[0].charCodeAt(0)) {
                case MSG_PCODE.MSC_HAD:
                    reply.poolBonus[numOfPools].pc = PCODE.PC_HAD;
                    break;
                case MSG_PCODE.MSC_FHAD:
                    reply.poolBonus[numOfPools].pc = PCODE.PC_FHAD;
                    break;
                case MSG_PCODE.MSC_FTS: // Mar2011 M2
                    reply.poolBonus[numOfPools].pc = PCODE.PC_FTS;
                    break;
                case MSG_PCODE.MSC_HHAD:
                    reply.poolBonus[numOfPools].pc = PCODE.PC_HHAD;
                    break;
                case MSG_PCODE.MSC_HDC:
                    reply.poolBonus[numOfPools].pc = PCODE.PC_HDC;
                    break;
                case MSG_PCODE.MSC_CRS:
                    reply.poolBonus[numOfPools].pc = PCODE.PC_CRS;
                    break;
                // by Ken Lam, MSR2012 FCRS
                case MSG_PCODE.MSC_FCRS:
                    reply.poolBonus[numOfPools].pc = PCODE.PC_FCRS;
                    break;
                case MSG_PCODE.MSC_HAFU:
                    reply.poolBonus[numOfPools].pc = PCODE.PC_HFT;
                    break;
                case MSG_PCODE.MSC_HILO:
                    reply.poolBonus[numOfPools].pc = PCODE.PC_HIL;
                    break;
                // MR2011 FHLO
                case MSG_PCODE.MSC_FHLO:
                    reply.poolBonus[numOfPools].pc = PCODE.PC_FHLO;
                    break;
                // PSR2013 CHLO
                case MSG_PCODE.MSC_CHLO:
                    reply.poolBonus[numOfPools].pc = PCODE.PC_CHLO;
                    break;
                case MSG_PCODE.MSC_TTG:
                    reply.poolBonus[numOfPools].pc = PCODE.PC_TTG;
                    break;
                case MSG_PCODE.MSC_OOE:
                    reply.poolBonus[numOfPools].pc = PCODE.PC_OOE;
                    break;
                case MSG_PCODE.MSC_TQL: //  Q407
                    reply.poolBonus[numOfPools].pc = PCODE.PC_TQL;
                    break;
                case MSG_PCODE.MSC_NTS: //  Q408 Peter See 09/08/2008
                    reply.poolBonus[numOfPools].pc = PCODE.PC_NTS;
                    break;
                case MSG_PCODE.MSC_ETS: //  Q408 Peter See 09/08/2008
                    reply.poolBonus[numOfPools].pc = PCODE.PC_ETS;
                    break;
                default:
                    break;
            }

            numOfPools++;

            tempchar = msgReply.GetChar(offset);
        } while (tempchar !== '/');

        ++offset; //  '/' seperator

        //  all up level
        //  start from level 2
        // VC8        for (i = 0; i < nLevel - 1; i++ ) {
        for (let i = 0; i < nLevel - 1; i++) {
            trash = msgReply.ExtractFixStr(offset, 1);
            offset = msgReply.Position; //  All Up level
            reply.allUpBonus[i] = msgReply.ExtractBonus(offset);
            offset = msgReply.Position;
        }
    }

    public static ProcessScReply(
        scbet: FootballBetObject,
        msgReply: ByteArrayBuilder,
        reply: MSG_Football_REPLY,
        indicator: number
    ): boolean {
        let result = true;
        if (msgReply.GetMsgCode() === MessageCode.MC_ERR_REPLY) {
            result = false;
            reply.errorText = msgReply.GetErrorText();
        } else {
            let offset = msgReply.Position;

            const oddsFlag = msgReply.ExtractN9(offset, 1);
            reply.OddsFlag = oddsFlag;

            reply.betChangeFlag =
                msgReply.ExtractFixStr(msgReply.Position, 1).charCodeAt(0) &
                0x3f; // RHO turn bit 6 off

            if (oddsFlag === Constansts.REJECT_DUE_TO_ODDS_OUTDATED) {
                reply.errorText = msgReply.ExtractFixStr(
                    msgReply.Position,
                    msgReply.Length - msgReply.Position
                );
                result = false;
            } else {
                reply.date = msgReply.ExtractFixStr(
                    msgReply.Position,
                    MaxValue.MAX_DATE_LEN
                );
                reply.time = msgReply.ExtractFixStr(
                    msgReply.Position,
                    Constansts.LONG_TIME_LEN
                );

                let temp = '',
                    next_tmp = '',
                    i = 0;
                offset = msgReply.Position;
                do {
                    temp += msgReply.ExtractFixStr(offset, 1);
                    offset = msgReply.Position;
                    next_tmp = msgReply.GetChar(offset);
                    i++;
                } while (next_tmp !== '/');

                let bIMF = false;
                if (
                    i !== MaxValue.MAX_TSN_LEN &&
                    i !== MaxValue.MAX_TSN_LEN_19
                ) {
                    bIMF = true;
                } else {
                    offset = offset + 1; // skip the '\'
                    reply.tsn = this.convertBcd2Str(temp);

                    //     //  stream in TXN if ESC; otherwise BCN

                    i = 0;
                    temp = '';
                    do {
                        temp += msgReply.ExtractFixStr(offset, 1);
                        offset = msgReply.Position;
                        next_tmp = msgReply.GetChar(offset);
                        i++;
                    } while (next_tmp !== '$');
                    // by Ethan, 20190114, Sp21a eWallet Enhancement
                    if (i !== MaxValue.MAX_TXN_LEN) {
                        bIMF = true;
                    }
                    reply.txn = this.convertBcd2Str(temp);

                    if (!bIMF) {
                        next_tmp = msgReply.GetChar(offset);
                        if (next_tmp !== '$') {
                            bIMF = true;
                        } else {
                            reply.total = msgReply.ExtractMoney(offset);
                            offset = msgReply.Position;

                            if (
                                reply.betChangeFlag &
                                Constansts.PAYOUT_EXCEED_LIMIT
                            ) {
                                reply.cnMaxPayOut = msgReply.ExtractMoney(
                                    offset
                                );
                                offset = msgReply.Position;
                            }

                            //  since scbet is w/o odds, it has to be set after sending a
                            //  bet successfully to backend
                            //
                            if (indicator & FootballBetObject.FOWOO_MASK) {
                                this.getOdds(scbet, msgReply, reply);
                            }

                            if (indicator & FootballBetObject.BONUS_MASK) {
                                // RHO add to supprot STB section bet bonus
                                if (
                                    scbet.oddsIndicator2 ===
                                    ODDS_INDICATION2.SECTION_BET
                                ) {
                                    this.processSTBBonus(
                                        msgReply,
                                        reply,
                                        scbet.bonusLevel,
                                        scbet.allUp.leg
                                    );
                                } else {
                                    this.processBonus(
                                        msgReply,
                                        reply,
                                        scbet.bonusLevel
                                    );
                                }
                            }

                            //  by Jason Lau, on 19/07/2005
                            //  do not stream in any of the following bytes if any since those are not useful MTBT
                        }
                    }
                }
                if (bIMF) {
                    //  small letter prefix indicate that the returned message from Back End is IMF,
                    //  which is different from those IMF directly replied from Back End
                    throw new ComSvrException(
                        ERROR_MSG.RID_SCMP_ERR_INVALID_MESSAGE_FOMRAT
                    );
                }
            }
        }
        return result;
    }
    // // endregion

    // // region 3 - CustomerServ
    public static ProcessESCAccountAccessReply(
        msgReply: ByteArrayBuilder,
        escAccAcsReply: MSG_ESC_ACC_ACS_REPLY
    ): boolean {
        // ACCOUNT_ACS_REPLY   "ABCD10A$A@@@@.@@$@.@@$@.@@/III/B@@@@@B@"

        let result = true;
        if (msgReply.GetMsgCode() === MessageCode.MC_ERR_REPLY) {
            result = false;
            escAccAcsReply.errorText = msgReply.GetErrorText();
        } else {
            let offset = 1;
            escAccAcsReply.txn = msgReply.ExtractNF(
                offset,
                MaxValue.MAX_TXN_LEN
            );
            offset += MaxValue.MAX_TXN_LEN;

            const lang = msgReply.ExtractNF_Ascii(offset, 1);
            escAccAcsReply.language = lang[0];
            ++offset;

            const call = msgReply.ExtractNF_Ascii(offset, 1);
            escAccAcsReply.callFlag = call[0];
            ++offset;

            const fbAcc = msgReply.ExtractNF_BIN6(offset);
            escAccAcsReply.fbAccType = fbAcc;
            ++offset;

            escAccAcsReply.fund = msgReply.ExtractMoney_();
            escAccAcsReply.dividend = msgReply.ExtractMoney_();
            escAccAcsReply.expenditure = msgReply.ExtractMoney_();

            // Skip seprator '/'
            const sep = String.fromCharCode(msgReply.GetByte());

            // sep = msgReply.GetByte();
            if (sep !== Constansts.CHAR_SLASH) {
                // Peek next byte
                offset = msgReply.Position - 1;
                escAccAcsReply.bonus = msgReply.ExtractBonus(offset);
            }

            // Integrated account number
            offset = msgReply.Position;
            const accLen = Math.min(
                MaxValue.MAX_GENERAL_NUMBER_LEN,
                msgReply.Length - offset
            );
            if (accLen !== 0) {
                escAccAcsReply.integratedAccNum = msgReply.ExtractNF(
                    offset,
                    accLen
                );
            }
        }
        return result;
    }
    public static ProcessQRCAccountAccessReply(
        msgReply: ByteArrayBuilder,
        escAccAcsReply: MSG_ESC_ACC_ACS_REPLY
    ): boolean {
        // ACCOUNT_ACS_REPLY   "ABCD10A$A@@@@.@@$@.@@$@.@@/III/B@@@@@B@"

        let result = true;
        if (msgReply.GetMsgCode() === MessageCode.MC_ERR_REPLY) {
            result = false;
            escAccAcsReply.errorText = msgReply.GetErrorText();
        } else {
            let offset = 1;
            escAccAcsReply.txn = msgReply.ExtractNF(
                offset,
                MaxValue.MAX_TXN_LEN
            );
            offset += MaxValue.MAX_TXN_LEN;

            const lang = msgReply.ExtractNF_Ascii(offset, 1);
            escAccAcsReply.language = lang[0];
            ++offset;

            const call = msgReply.ExtractNF_Ascii(offset, 1);
            escAccAcsReply.callFlag = call[0];
            ++offset;

            const fbAcc = msgReply.ExtractNF_BIN6(offset);
            escAccAcsReply.fbAccType = fbAcc - 48; // reply.fbAccType = tmpfbAcctType[0] - '0'
            ++offset;

            escAccAcsReply.fund = msgReply.ExtractMoney_();
            escAccAcsReply.dividend = msgReply.ExtractMoney_();
            escAccAcsReply.expenditure = msgReply.ExtractMoney_();

            if (msgReply.Length === msgReply.Position) {
                return true;
            }
            // Skip seprator '/'
            const sep = String.fromCharCode(msgReply.GetByte());

            // sep = msgReply.GetByte();
            if (sep !== '!') {
                // Peek next byte
                result = false;
                escAccAcsReply.errorText = 'Skip seprator !wrong';
            }

            // Integrated account number
            offset = msgReply.Position;
            // Integrated account number: the length is 8
            const accLen = Math.min(8, msgReply.Length - offset);
            if (accLen !== 0) {
                escAccAcsReply.integratedAccNum = msgReply.ExtractNF(
                    offset,
                    accLen
                );
                customer.AccountNumber = escAccAcsReply.integratedAccNum;
            }
        }
        return result;
    }

    public static ProcessQRCAccountReleaseReply(
        msgReply: ByteArrayBuilder,
        qrcAccRelReply: MSG_QRC_ACC_REL_REPLY
    ): boolean {
        // ACCOUNT_REL_REPLY   "12:34/06JAN82ABCD$A@@@@.@@/AIII"

        if (msgReply.GetMsgCode() === MessageCode.MC_ERR_REPLY) {
            qrcAccRelReply.errorText = msgReply.GetErrorText();
            return false;
        }

        let offset = 1;
        qrcAccRelReply.txn = msgReply.ExtractNF(offset, MaxValue.MAX_TXN_LEN); // Transaction number
        offset += MaxValue.MAX_TXN_LEN;

        // msgReply.ExtractNF(offset, 3); // for test
        qrcAccRelReply.fundsAvailable = msgReply.ExtractMoney_(); // Funds available for betting
        return true;
    }

    public static ProcessPayBetReply(
        msgReply: ByteArrayBuilder,
        payReply: MSG_PAY_REPLY,
        betReply: MSG_BET_REPLY,
        betObj: RacingBetObject
    ): boolean {
        // MSG_PAY_REPLY for customer updating
        // MSG_BET_REPLY for printing

        if (msgReply.GetMsgCode() === MessageCode.MC_ERR_REPLY) {
            payReply.errorText = msgReply.GetErrorText();
            return false;
        }

        // Process Pay Reply
        let offset = 1;
        payReply.time = msgReply.ExtractFixStr(
            offset,
            Constansts.SHORT_TIME_LEN
        );
        offset += Constansts.SHORT_TIME_LEN;

        // has '/' ?
        let tempByte = String.fromCharCode(msgReply.GetByte());
        offset++;
        if (tempByte !== Constansts.CHAR_SLASH) {
            payReply.errorText = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
            return false;
        }

        payReply.date = msgReply.ExtractDateFormDDMMMYY(
            offset,
            MaxValue.MAX_DATE_LEN
        );
        offset += MaxValue.MAX_DATE_LEN;

        // has '/' ?
        tempByte = String.fromCharCode(msgReply.GetByte());
        offset++;
        if (tempByte !== Constansts.CHAR_SLASH) {
            payReply.errorText = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
            return false;
        }

        // byte[] tempTsn = msgReply.ExtractNF_Ascii(offset, Constansts.MAX_TSN_LEN_19);
        // payReply.tsn = tempTsn.ToString();
        payReply.tsn = ReplyProcessor.getTsn(msgReply, offset);
        offset += payReply.tsn.length;

        tempByte = String.fromCharCode(msgReply.GetByte());
        if (tempByte === Constansts.CHAR_SLASH) {
            offset++;
            payReply.txn = msgReply.ExtractNF(offset, MaxValue.MAX_TXN_LEN);
            offset += MaxValue.MAX_TXN_LEN;
        }

        tempByte = String.fromCharCode(msgReply.GetByte());
        if (tempByte === Constansts.CHAR_SLASH) {
            offset++;
        }

        payReply.cnDiv = msgReply.ExtractMoney(offset);

        tempByte = String.fromCharCode(msgReply.GetByte());
        offset = msgReply.Position;
        if (tempByte === Constansts.CHAR_SLASH) {
            payReply.payIndicator = msgReply.ExtractNF_BIN6(offset);
            offset++;
        }

        // -----------------------------------------------------

        if (!(PayIndicator.PAY_REISSUE === payReply.payIndicator)) {
            return true;
        }

        // betObj.init

        // Process partial pay
        if (String.fromCharCode(msgReply.GetByte()) !== Constansts.CHAR_SLASH) {
            // Skip '/'
            payReply.errorText = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
            return false;
        }
        payReply.tktType = msgReply.ExtractNF_BIN6(msgReply.Position);
        if (String.fromCharCode(msgReply.GetByte()) !== Constansts.CHAR_SLASH) {
            // Skip '/'
            payReply.errorText = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
            return false;
        }
        payReply.payCnt = msgReply.ExtractBcdInt();
        payReply.accuPayAmt = msgReply.ExtractMoney_();
        if (String.fromCharCode(msgReply.GetByte()) !== Constansts.CHAR_SLASH) {
            // Skip '/'
            payReply.errorText = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
            payReply.errorText = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
            return false;
        }

        if (!(PartialPayTkt.PPT_RACE === payReply.tktType)) {
            payReply.errorText = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
            return false;
        }

        // Meeting date
        payReply.date = msgReply.ExtractDateFormDDMMMYY(
            msgReply.Position,
            MaxValue.MAX_DATE_LEN
        );
        if (String.fromCharCode(msgReply.GetByte()) !== Constansts.CHAR_SLASH) {
            // Skip '/'
            payReply.errorText = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
            return false;
        }

        // TODO: CommServ::payBet - processRaceSellRqstDetails

        if (String.fromCharCode(msgReply.GetByte()) !== Constansts.CHAR_SLASH) {
            // Skip '/'
            payReply.errorText = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
            return false;
        }
        // TODO: CommServ::payBet - processBetReply
        offset = msgReply.Position;
        betReply.tsn = ReplyProcessor.getTsn(msgReply, offset);
        offset += betReply.tsn.length;

        //  If get tsn failed:
        //  small letter prefix indicate that the returned message from Back End is IMF,
        //  which is different from those IMF directly replied from Back End
        //  betReply.errorText = "imf-INVALID MESSAGE FORMAT.";

        if (
            String.fromCharCode(msgReply.GetByte(offset)) !==
            Constansts.CHAR_SLASH
        ) {
            // Skip '/'
            payReply.errorText = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
            return false;
        }

        offset = msgReply.Position;
        if (customer.custType === CustomerType.CUST_ESC) {
            betReply.txn = msgReply.ExtractNF(offset, MaxValue.MAX_TXN_LEN);
        } else {
            betReply.bcn = ReplyProcessor.getTxnBcn(msgReply, offset);
        }

        if (betObj.IsFlexiBet) {
            if (
                String.fromCharCode(msgReply.GetByte()) !==
                Constansts.CHAR_SLASH
            ) {
                // Skip '/'
                payReply.errorText = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
                return false;
            }
            // betReply.comb  msgReply.ExtractN9
            betReply.unitBet = msgReply.ExtractMoney_();
            betObj.UnitBet = betReply.unitBet;
        }
        betReply.total = msgReply.ExtractMoney_();

        tempByte = String.fromCharCode(msgReply.GetByte());
        if (
            tempByte === Constansts.CHAR_BACKSLASH ||
            tempByte === Constansts.CHAR_SLASH
        ) {
            if (
                betObj.PoolType === PoolSymbol.QPTT ||
                betObj.PoolType === PoolSymbol.QPQTT
            ) {
                const len = msgReply.Length - msgReply.Position;
                betReply.seln = msgReply
                    .ExtractFixStr(msgReply.Position, len)
                    .split('')
                    .map((char) => char.charCodeAt(0));
            } else {
                // TODO: CommServ::payBet - processBWBetReply
            }
        }

        return true;
    }

    public static ProcessTbDepositReply(
        msgReply: ByteArrayBuilder,
        tbDepReply: MSG_TB_DEP_REPLY
    ): boolean {
        if (msgReply.GetMsgCode() === MessageCode.MC_ERR_REPLY) {
            tbDepReply.errorText = msgReply.GetErrorText();
            return false;
        }

        let offset = 1;
        tbDepReply.time = msgReply.ExtractFixStr(
            offset,
            Constansts.SHORT_TIME_LEN
        );
        offset += Constansts.SHORT_TIME_LEN;

        // Skip '/'
        if (String.fromCharCode(msgReply.GetByte()) !== Constansts.CHAR_SLASH) {
            tbDepReply.errorText = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
            return false;
        }
        offset++;

        tbDepReply.date = msgReply.ExtractDateFormDDMMMYY(
            offset,
            MaxValue.MAX_DATE_LEN
        );
        offset += MaxValue.MAX_DATE_LEN;

        // Skip '/'
        if (String.fromCharCode(msgReply.GetByte()) !== Constansts.CHAR_SLASH) {
            tbDepReply.errorText = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
            return false;
        }
        offset++;

        tbDepReply.tsn = ReplyProcessor.getTsn(msgReply, offset);
        if (tbDepReply.tsn.length > MaxValue.MAX_TXN_LEN) {
            tbDepReply.bcn = msgReply.ExtractNF(
                msgReply.Position + 1,
                MaxValue.MAX_TSN_LEN_19
            );
        } else {
            tbDepReply.bcn = msgReply.ExtractNF(
                msgReply.Position + 1,
                MaxValue.MAX_TSN_LEN
            );
        }

        return true;
    }

    private static getTsn(msg: ByteArrayBuilder, offset: number): string {
        let res = '';
        const len = ReplyProcessor.getXxnLen(msg, offset);
        if (len !== MaxValue.MAX_TSN_LEN && len !== MaxValue.MAX_TSN_LEN_19) {
            {
                logger.error(
                    `imf -INVALID MESSAGE FORMAT, Wrong TSN! data:${msg.ToString()}, position:${
                        msg.Position
                    }`
                );
                throw new ComSvrException(
                    ERROR_MSG.RID_SCMP_ERR_INVALID_MESSAGE_FOMRAT
                );
            }
        }
        res = msg.ExtractNF(offset, len);
        return res;
    }

    private static getTxnBcn(msg: ByteArrayBuilder, offset: number): string {
        let res;
        const len = ReplyProcessor.getXxnLen(msg, offset);
        if (
            len !== MaxValue.MAX_TXN_LEN &&
            len !== MaxValue.MAX_BCN_LEN &&
            len !== MaxValue.MAX_BCN_LEN_19
        ) {
            logger.error(
                `imf -INVALID MESSAGE FORMAT, Wrong TXN/BCN! data:${msg.ToString()}, position:${
                    msg.Position
                }`
            );
            throw new ComSvrException(
                ERROR_MSG.RID_SCMP_ERR_INVALID_MESSAGE_FOMRAT
            );
        }
        res = msg.ExtractNF(offset, len);
        return res;
    }

    // // endregion

    // // region 4 - RPCDelegate

    // // endregion

    // // region 5 - StaffServ
    public static ProcessSignOnReply(
        msgReply: ByteArrayBuilder,
        reply: MSG_SIGN_ON_REPLY,
        responseobj: ResponseObject
    ): boolean {
        // SIGN_ON_REPLY       "A10:00/06JAN82/A@5"
        // SIGN_ON_REPLY2      "A10:00/06JAN82/A@5/AEA";
        let result = false;
        // region reply
        if (msgReply.GetMsgCode() === MessageCode.MC_ERR_REPLY) {
            result = false;
            reply.errorText = msgReply.GetErrorText();
            responseobj.message = msgReply.GetErrorText();
            responseobj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        } else {
            const timeIndex = 1;
            reply.replyTime = msgReply.ExtractFixStr(
                timeIndex,
                Constansts.SHORT_TIME_LEN
            );
            const dateIndex = 7; //  skip seperator '/' 1+5+1=7
            reply.replyDate = msgReply.ExtractFixStr(
                dateIndex,
                MaxValue.MAX_DATE_LEN
            );
            const numOfSignOnIndex = 15; //  skip seperator '/' 7+7+1=15
            reply.numOfSignOn = msgReply.ExtractN9(numOfSignOnIndex, 2);
            const secCodeShftIndex = 17;
            reply.secCodeShft = msgReply.GetChar(secCodeShftIndex);
            // theTerminal.setSecCodeShiftIndicator((int)(reply.secCodeShft - 0x30));  //todo call terminal api
            const returnCodeIndex = 19; //  skip seperator '/' 17+1+1=19
            if (
                msgReply.Length > msgReply.Position &&
                msgReply.GetByte(returnCodeIndex) === 0x41
            ) {
                const returnCode = msgReply.ExtractN9(returnCodeIndex, 1);
                reply.returnCode = returnCode;
                const daysB4ExpIndex = 20;
                reply.daysB4Exp = msgReply.ExtractN9(daysB4ExpIndex, 2);
            }
            result = true;
            responseobj.message = 'success';
            responseobj.code = ResponseObjectCode.SUCCESS_CODE;

            internalParam.signonTime = reply.replyTime;
        }
        // endregion
        responseobj.body = reply;
        return result;
    }
    public static ProcessSignOffReply(
        msgReply: ByteArrayBuilder,
        reply: MSG_SIGN_OFF_REPLY,
        responseobj: ResponseObject
    ): boolean {
        // SIGN_OFF_REPLY "23:00/06JAN82/$@.@@$@.@@$@.@@$@.@@$@.@@$@.@@$@.@@"
        let result = false;
        // region reply
        if (msgReply.GetMsgCode() === MessageCode.MC_ERR_REPLY) {
            result = false;
            reply.errorText = msgReply.GetErrorText();
            responseobj.message = msgReply.GetErrorText();
            responseobj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        } else {
            const timeIndex = 1;
            reply.replyTime = msgReply.ExtractFixStr(
                timeIndex,
                Constansts.SHORT_TIME_LEN
            );
            const dateIndex = 7; //  skip seperator '/' 1+5+1=7
            reply.replyDate = msgReply.ExtractFixStr(
                dateIndex,
                MaxValue.MAX_DATE_LEN
            );
            const cashInIndex = 15; //  skip seperator '/' 7+7+1=15
            reply.cashIn = msgReply.ExtractMoney(cashInIndex);
            reply.cashOut = msgReply.ExtractMoney_();
            reply.sells = msgReply.ExtractMoney_();
            reply.cancel = msgReply.ExtractMoney_();
            reply.pay = msgReply.ExtractMoney_();
            reply.esc = msgReply.ExtractMoney_();
            reply.balance = msgReply.ExtractMoney_();
            result = true;
            responseobj.message = 'success';
            responseobj.code = ResponseObjectCode.SUCCESS_CODE;
        }
        responseobj.body = reply;
        // endregion
        return result;
    }

    public static ProcessChangePasswordReply(
        msgReply: ByteArrayBuilder,
        reply: MSG_OPT_FUNC_REPLY,
        responseobj: ResponseObject
    ): boolean {
        let result = false;
        // region reply
        if (msgReply.GetMsgCode() === MessageCode.MC_ERR_REPLY) {
            result = false;
            reply.errorText = msgReply.GetErrorText();
            responseobj.message = msgReply.GetErrorText();
            responseobj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        } else {
            result = true;
            responseobj.message = 'success';
            responseobj.code = ResponseObjectCode.SUCCESS_CODE;
        }
        responseobj.body = reply;
        // endregion

        return result;
    }
    public static ProcessGetStaffAuthorityReply(
        msgReply: ByteArrayBuilder,
        reply: MSG_STAFF_AUTH_REPLY,
        responseobj: ResponseObject
    ): boolean {
        // GET_STAFF_AUTH_REPLY "@"
        let result = false;
        // region reply
        if (msgReply.GetMsgCode() === MessageCode.MC_ERR_REPLY) {
            result = false;
            reply.errorText = msgReply.GetErrorText();
            responseobj.message = msgReply.GetErrorText();
            responseobj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        } else {
            const bcsStatusIndex = 1;
            reply.bcsStatus = msgReply.ExtractNF(bcsStatusIndex, 1);
            const authorityTyp3Index = 2;
            reply.authorityTyp3 = Array.from(
                msgReply.ExtractBitmap(authorityTyp3Index, 4)
            );
            result = true;
            responseobj.message = 'success';
            responseobj.code = ResponseObjectCode.SUCCESS_CODE;
        }
        responseobj.body = reply;
        // endregion

        return result;
    }
    public static ProcessGetRdtReply(
        msgReply: ByteArrayBuilder,
        rdtReply: MSG_GET_RDT_REPLY
    ): boolean {
        if (msgReply.GetMsgCode() === MessageCode.MC_ERR_REPLY) {
            rdtReply.errorText = msgReply.GetErrorText();
            return false;
        }
        // msgReply.GetMsgCode() will move
        let offset = msgReply.Position;
        rdtReply.raceDayTable = msgReply.ExtractFixStr(
            offset,
            msgReply.Length - offset
        );
        const signOnTime = msgReply.ExtractDateFormDDMMMYY(
            offset,
            MaxValue.MAX_DATE_LEN
        );
        internalParam.currentDate = signOnTime.valueOf();
        return true;
    }
    // // endregion

    // // region 6 - TerminalServ

    // // endregion

    // // region Private Method

    private static ProcessBetReply(
        msgReply: ByteArrayBuilder,
        bet: RacingBetObject,
        reply: MSG_BET_REPLY
    ): boolean {
        // BET_REPLY           "NNNNNNNNNNNNNNNNNNN/ABCD$A@@.@@"
        // FLEXI_BET_REPLY     "NNNNNNNNNNNNNNNNNNN/@GIA/A@$A@.@@@@$A@@.@@"
        const result = true;
        // region set reply

        const startIndex = msgReply.Position;
        const tsn = ReplyProcessor.getTsn(msgReply, startIndex);
        reply.tsn = tsn;
        // skip '/'
        const txn = ReplyProcessor.getTxnBcn(msgReply, msgReply.Position + 1);
        reply.txn = txn;
        if (bet.IsFlexiBet) {
            // skip '/'
            let offset = msgReply.Position + 1;
            reply.comb = 0;
            while (!msgReply.EOS) {
                const tmp = msgReply.GetByte(offset);
                if (tmp !== '$'.charCodeAt(0)) {
                    reply.comb *= 10;
                    reply.comb += msgReply.ExtractN9(offset, 1);
                } else {
                    break;
                }
                offset++;
            }
            //
            reply.unitBet = msgReply.ExtractMoney(msgReply.Position - 1, 4);
            reply.total = msgReply.ExtractMoney(msgReply.Position);

            bet.UnitBet = reply.unitBet;
        } else {
            reply.total = msgReply.ExtractMoney(msgReply.Position);
        }
        if (!msgReply.EOS) {
            const tmp = msgReply.GetByte();
            if (tmp !== '/'.charCodeAt(0) && tmp !== '\\'.charCodeAt(0)) {
                if (
                    bet.PoolType === PoolSymbol.QPTT ||
                    bet.PoolType === PoolSymbol.QPQTT
                ) {
                    reply.seln = msgReply
                        .ExtractFixStr(msgReply.Position, 0)
                        .split('')
                        .map((char) => char.charCodeAt(0));
                }
            }
        }
        // endregion
        return result;
    }

    private static ProcessQPQTTReply(
        msgReply: ByteArrayBuilder,
        bet: RacingBetObject,
        reply: MSG_BET_REPLY
    ): boolean {
        // QPQTT_A_REPLY        "NNNNNNNNNNNNNNNNNNN/@GIA/BD$A.@@@@$BD.@@\\AHJK("
        // QPQTT_B_REPLY        "NNNNNNNNNNNNNNNNNNN/@GIA/AB@$A.@@@@$AB@.@@\\AHJKM("
        // QPQTT_C_REPLY        "NNNNNNNNNNNNNNNNNNN/@GIA/CF@$A.@@@@$CF@.@@\\AHJKDF("
        const result = true;
        // region set reply
        let offset = msgReply.Position;
        const tsn = ReplyProcessor.getTsn(msgReply, offset);
        reply.tsn = tsn;
        // skip '/'
        offset = msgReply.Position + 1;
        const txn = ReplyProcessor.getTxnBcn(msgReply, offset);
        reply.txn = txn;
        // bypass the '/'
        offset = msgReply.Position + 1;
        let xxLen = ReplyProcessor.getXxnLen(
            msgReply,
            offset,
            Constansts.DOLLAR_SIGN
        );
        reply.comb = msgReply.ExtractN9(offset, xxLen);
        reply.unitBet = msgReply.ExtractMoney(msgReply.Position, 4);
        reply.total = msgReply.ExtractMoney(msgReply.Position);
        // skip the '\'
        offset = msgReply.Position + 1;
        xxLen = ReplyProcessor.getXxnLen(msgReply, offset, null);
        reply.seln = msgReply
            .ExtractFixStr(offset, xxLen)
            .split('')
            .map((char) => char.charCodeAt(0));
        bet.UnitBet = reply.unitBet;
        // endregion
        return result;
    }

    private static ProcessQPTTReply(
        msgReply: ByteArrayBuilder,
        reply: MSG_BET_REPLY
    ): boolean {
        // QPTT_A_REPLY        "NNNNNNNNNNNNNNNNNNN/ABCD$A@@.@@\\CDM/AHI/BEF"
        // QPTT_A_REPLY_2      "NNNNNNNNNNNNNNNNNNN/ABCD$A@@.@@\\CDM/AHI/BEF|CDM/AHI/BEF"
        // QPTT_B_REPLY        "NNNNNNNNNNNNNNNNNNN/ABCD$A@@.@@\\AHJK/CLN/ACG"
        // QPTT_C_REPLY        "NNNNNNNNNNNNNNNNNNN/ABCD$A@@.@@\\DFIK/ABCD/AEGM"
        // QPTT_D_REPLY        "NNNNNNNNNNNNNNNNNNN/ABCD$A@@.@@\\L>AEF/F>DHI/G>BDL"
        const result = true;
        // region set reply
        let offset = 1;
        const tsn = ReplyProcessor.getTsn(msgReply, offset);
        reply.tsn = tsn;
        // skip '/'
        offset = msgReply.Position + 1;
        const txn = ReplyProcessor.getTxnBcn(msgReply, offset);
        reply.txn = txn;
        reply.total = msgReply.ExtractMoney(msgReply.Position);
        // skip the '\'
        offset = msgReply.Position + 1;
        const xxLen = ReplyProcessor.getXxnLen(msgReply, offset, null);
        reply.seln = msgReply
            .ExtractFixStr(offset, xxLen)
            .split('')
            .map((char) => char.charCodeAt(0));
        // endregion
        return result;
    }
    private static getXxnLen(msg: ByteArrayBuilder, offset: number): number;
    private static getXxnLen(
        msg: ByteArrayBuilder,
        offset: number,
        endChar: string | Buffer
    );
    // private static getXxnLen(msg: ByteArrayBuilder, offset: number, endChar: );
    private static getXxnLen(b?, b1?, b2?): number {
        const btypestr = typeof b;
        const b1typestr = typeof b1;
        const b2typestr = typeof b2;
        if (
            btypestr === 'object' &&
            b1typestr === 'number' &&
            b2typestr === 'string'
        ) {
            const msg: ByteArrayBuilder = b;
            const offset: number = b1;
            const endChar: string = b2;
            return ReplyProcessor.getXxnLen(msg, offset, Buffer.from(endChar));
        } else if (
            btypestr === 'object' &&
            b1typestr === 'number' &&
            b2typestr === 'object'
        ) {
            const msg: ByteArrayBuilder = b;
            const offset: number = b1;
            const endChar: Buffer = b2;

            let len = 0;

            if (endChar == null) {
                while (!msg.EOS) {
                    const tmp = msg.GetByte(offset + len);
                    ++len;
                }
            } else {
                let tmp = msg.GetByte(offset);
                while (!endChar.includes(tmp)) {
                    ++len;
                    tmp = msg.GetByte(offset + len);
                }
            }
            return len;
        } else if (btypestr === 'object' && b1typestr === 'number') {
            const msg: ByteArrayBuilder = b;
            const offset: number = b1;

            let len = 0;
            let tmp = msg.GetByte(offset);
            while (
                tmp !== Constansts.CHAR_SLASH.charCodeAt(0) &&
                tmp !== Constansts.DOLLAR_SIGN.charCodeAt(0)
            ) {
                ++len;
                tmp = msg.GetByte(offset + len);
            }

            return len;
        }
    }
}
