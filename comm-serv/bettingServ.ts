import { MarkSixBetObject } from '../share/models/comm-serv/MarSix/MarkSixBetObject';
import {
    FootballBetObject,
    SCBET_TYPE,
    ODDS_INDICATION,
    ODDS_INDICATION2,
    SHomeAwayDraw,
} from '../share/models/comm-serv/Football/FootballBetObject';
import { MsgFormatter } from './util/msgFormatter';
import { ByteArrayBuilder } from './util/byteArrayBuilder';
import {
    MSG_MarkSix_REPLY,
    MSG_Football_REPLY,
    MSG_BET_REPLY,
    Messages,
} from '../share/models/comm-serv/Messages';
import {
    MessageCode,
    Constansts,
    PCODE,
} from '../share/models/comm-serv/CommonDefs';
import { RacingBetObject } from '../share/models/comm-serv/Racing/RacingBetObject';

import { ReqHandler, ReqHandlerCallBack } from './util/reqHandler';
import { ReplyProcessor } from './util/replyProcessor';
import { StatusError } from '../share/utils/status-error';
import { Events } from '../share/models/comm-serv/Events';
import { ComSvrException } from './util/comSvrException';
import {
    ResponseObject,
    ResponseObjectCode,
} from '../share/models/response-common';
import { terminalConfig } from '../share/main-proc/terminal-config/terminal-config';
import { HttpSend } from './httpsend/HttpSend';
import { Configs } from '../share/main-proc/terminal-config/configs.enum';
import { customer } from '../share/main-proc/customer/customer';
import { translateErrorMsgFromBackEnd } from '../share/methods/translateErrorMsg';
import { translateErrorCode } from '../share/methods/translateErrorCode';
import { staff } from '../share/main-proc/staff/staff';
import { logger } from '../share/utils/logs';
import { ERROR_MSG } from '../share/models/response-common';
import { AppConfig } from '../share/environments/environment';
export class BettingServ {
    public static readonly Instance: BettingServ = new BettingServ();
    constructor() {}

    PlaceMarkSix(param: MarkSixBetObject, callback: ReqHandlerCallBack) {
        const mk6 = param as MarkSixBetObject;
        const msgCode = MsgFormatter.GetMarkSixMsgCodeBy(mk6);
        const betReply = new MSG_MarkSix_REPLY();
        const msgRequest = new ByteArrayBuilder();
        const replyStruct: ResponseObject = {
            code: null,
            body: null,
            message: null,
        };
        if (!terminalConfig.mk6Selling) {
            replyStruct.code = ResponseObjectCode.ERROR_CODE_NORMAL;
            replyStruct.message = ERROR_MSG.RID_COMSERV_ERR_MK6STOPSELLING;
            replyStruct.body = {
                errorText: ERROR_MSG.RID_COMSERV_ERR_MK6STOPSELLING,
            };
            callback(replyStruct);
            return true;
        }
        try {
            MsgFormatter.SetMarkSixSMRBy(mk6);
            // 1:format message
            MsgFormatter.FormatMarkSixMessage(msgRequest, msgCode, mk6);
            // msgCode = MessageCode.MC_MK6_R; mk6.numOfEntries = 6; mk6.qpNumOfSeln = 6 //for test
            if (
                terminalConfig.terminalMode === Configs.Mode_TR &&
                msgCode == MessageCode.MC_MK6_R
            ) {
                let bb = Array.prototype.map
                    .call(msgRequest.ToArray(), (d) => d.toString(16))
                    .join(' ');
                logger.info('msgFormat :' + bb);

                ReqHandler.getInstance().SimulateTrainingMarksixRandomReply(
                    mk6,
                    betReply
                );
                replyStruct.code = ResponseObjectCode.SUCCESS_CODE;
                replyStruct.message = 'success';
                replyStruct.body = betReply;
                callback(replyStruct);
                return true;
            }

            // 2:process requst
            const reqMsg: Messages = {
                message: msgRequest.ToArray(),
                messageCode: msgCode,
                betObj: mk6,
            };
            ReqHandler.getInstance().ProcessRequest(reqMsg, (reply_msg) => {
                try {
                    // 3:process reply
                    const ret = ReplyProcessor.ProcessMarkSixReply(
                        reply_msg,
                        betReply,
                        mk6
                    );
                    // 4:telling the viewModel bet reply
                    replyStruct.body = betReply;
                    if (!ret) {
                        replyStruct.message = translateErrorMsgFromBackEnd(
                            betReply.errorText
                        );
                        replyStruct.code = translateErrorCode(
                            betReply.errorText
                        );
                        if (
                            replyStruct.code === ResponseObjectCode.ERROR_SEVERE
                        ) {
                            replyStruct.body = {
                                isBackEndError: true,
                                errorText: betReply.errorText,
                            };
                        }
                    } else {
                        replyStruct.code = ResponseObjectCode.SUCCESS_CODE;
                        replyStruct.message = betReply.errorText;
                    }
                } catch (err) {
                    if (err instanceof ComSvrException) {
                        replyStruct.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                        replyStruct.message = err.message;
                        replyStruct.body = betReply;
                    } else {
                        replyStruct.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                        replyStruct.message = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
                        replyStruct.body = betReply;
                    }
                } finally {
                    if (customer.newCustomerFlag) {
                        customer.newCustomerFlag = false;
                    }
                    callback(replyStruct);
                }
            });
        } catch (err) {
            if (err instanceof ComSvrException) {
                replyStruct.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                replyStruct.message = err.message;
                replyStruct.body = betReply;
                // callback(replyStruct);
            } else {
                replyStruct.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                replyStruct.message = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
                replyStruct.body = betReply;
                // callback(replyStruct);
            }
            // if (terminalConfig.terminalMode !== Configs.Mode_TR && customer.newCustomerFlag) {
            //     customer.newCustomerFlag = false;
            // }
            callback(replyStruct);
        }
        return true;
    }
    PlaceRacing(param: RacingBetObject, callback: ReqHandlerCallBack): boolean {
        const msgCode = MessageCode.MC_BET;
        const bet = param;
        const betReply = new MSG_BET_REPLY();
        const msgRequest = new ByteArrayBuilder();
        const replyStruct: ResponseObject = {
            code: null,
            body: null,
            message: null,
        };
        try {
            // 1:format message
            MsgFormatter.FormatPlaceRacingMessage(msgRequest, bet);
            // 2:process requst
            const reqMsg: Messages = {
                message: msgRequest.ToArray(),
                messageCode: msgCode,
                betObj: bet,
            };
            ReqHandler.getInstance().ProcessRequest(reqMsg, (reply_msg) => {
                try {
                    // 3:process reply
                    const ret = ReplyProcessor.ProcessPlaceRacingReply(
                        reply_msg,
                        bet,
                        betReply
                    );
                    // 4:telling the viewModel bet reply
                    replyStruct.body = betReply;
                    if (!ret) {
                        replyStruct.message = translateErrorMsgFromBackEnd(
                            betReply.errorText
                        );
                        replyStruct.code = translateErrorCode(
                            betReply.errorText
                        );
                        if (
                            replyStruct.code === ResponseObjectCode.ERROR_SEVERE
                        ) {
                            replyStruct.body = {
                                isBackEndError: true,
                                errorText: betReply.errorText,
                            };
                        }
                    } else {
                        replyStruct.code = ResponseObjectCode.SUCCESS_CODE;
                        replyStruct.message = betReply.errorText;
                    }
                } catch (err) {
                    if (err instanceof ComSvrException) {
                        replyStruct.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                        replyStruct.message = err.message;
                        replyStruct.body = betReply;
                    } else {
                        replyStruct.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                        replyStruct.message = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
                        replyStruct.body = betReply;
                    }
                } finally {
                    if (customer.newCustomerFlag) {
                        customer.newCustomerFlag = false;
                    }
                    callback(replyStruct);
                }
            });
        } catch (err) {
            if (err instanceof ComSvrException) {
                replyStruct.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                replyStruct.message = err.message;
                replyStruct.body = betReply;
            } else {
                replyStruct.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                replyStruct.message = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
                replyStruct.body = betReply;
            }
            // if (terminalConfig.terminalMode !== Configs.Mode_TR && customer.newCustomerFlag) {
            //     customer.newCustomerFlag = false;
            // }
            callback(replyStruct);
        }
        return true;
    }

    PlaceFootball(
        scbet: FootballBetObject,
        callback: ReqHandlerCallBack
    ): boolean {
        const msgCode = MessageCode.MC_SC_BET;
        const reply = new MSG_Football_REPLY();
        const msgRequest = new ByteArrayBuilder();
        let indicator = 0x40;

        const replyStruct: ResponseObject = {
            code: null,
            body: null,
            message: null,
        };
        try {
            // 1:format message
            indicator = MsgFormatter.FormatScBetMsg(
                msgRequest,
                scbet,
                indicator
            );
            if (msgRequest.Length > Constansts.MAX_MSG_BUF_SZ) {
                throw new ComSvrException(ERROR_MSG.RID_EX_TKT_TOO_MANY_SELN);
            }
            console.log(
                'terminalConfig.terminalMode=' + terminalConfig.terminalMode
            );
            if (
                terminalConfig.terminalMode === Configs.Mode_TR ||
                AppConfig.environment === 'DEV'
            ) {
                let bb = Array.prototype.map
                    .call(msgRequest.ToArray(), (d) => d.toString(16))
                    .join(' ');
                logger.info('msgFormat :' + bb);

                ReqHandler.getInstance().SimulateTrainingFootballReply(
                    scbet,
                    reply
                );
                replyStruct.code = ResponseObjectCode.SUCCESS_CODE;
                replyStruct.message = 'success';
                replyStruct.body = reply;
                callback(replyStruct);
                return true;
            }

            // 2:process requst
            //
            //1 46 60 44 40 40 41 40 2F 40 63 5F 40 42 3E 43 2E 44 40 40 24 41 40 40
            //1 46 60 44 40 40 41 40 2f 40 63 5f 40    3e 43 2e 44 40 40 24 41 40 40
            //1 46 60 44 40 40 41 40 2f 40 63 5f 40 42 3e 43 2e 44 40 40 24 41 40 40
            let bb = Array.prototype.map
                .call(msgRequest.ToArray(), (d) => d.toString(16))
                .join(' ');
            console.log(bb);
            const reqMsg: Messages = {
                message: msgRequest.ToArray(),
                messageCode: msgCode,
                betObj: scbet,
            };
            ReqHandler.getInstance().ProcessRequest(reqMsg, (reply_msg) => {
                try {
                    // 3:process reply
                    const ret = ReplyProcessor.ProcessScReply(
                        scbet,
                        reply_msg,
                        reply,
                        indicator
                    );
                    // 4:telling the viewModel bet reply
                    replyStruct.body = reply;
                    if (!ret) {
                        replyStruct.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                        replyStruct.message = translateErrorMsgFromBackEnd(
                            reply.errorText,
                            scbet
                        );
                    } else {
                        replyStruct.code = ResponseObjectCode.SUCCESS_CODE;
                        replyStruct.message = 'success';
                    }
                } catch (err) {
                    if (err instanceof ComSvrException) {
                        replyStruct.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                        replyStruct.message = err.message;
                        replyStruct.body = reply;
                    } else {
                        replyStruct.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                        replyStruct.message = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
                        replyStruct.body = reply;
                    }
                } finally {
                    if (customer.newCustomerFlag) {
                        customer.newCustomerFlag = false;
                    }
                    callback(replyStruct);
                }
            });
        } catch (err) {
            if (err instanceof ComSvrException) {
                replyStruct.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                replyStruct.message = err.message;
                replyStruct.body = reply;
                callback(replyStruct);
            } else {
                replyStruct.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                replyStruct.message = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
                replyStruct.body = reply;
                callback(replyStruct);
            }
        }
        return true;
    }
    ///////////////////////////////////////////////////////////////////////////////
    //
    //  Name            : CCommService::reportWarning
    //
    //  Description     : Unsolicited warning message to the
    //                    Adiministration Terminals via the Central System.
    //
    //  Input           : pointer to error text.
    //
    ///////////////////////////////////////////////////////////////////////////////
    reportWarning(params: any, callback: ReqHandlerCallBack) {
        const replyStruct: ResponseObject = {
            code: null,
            body: null,
            message: null,
        };

        try {
            const warningText: string = params.warningText;
            const bReportStaff: boolean = params.bReportStaff;
            const AttendingStaffId_QRC: string = params.AttendingStaffId_QRC;

            // 1:format message

            if (staff.getStaffId().length === 0) {
                // If not signed on, returns immediately
                replyStruct.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                replyStruct.message = 'staff.getStaffId().length === 0';
                replyStruct.body = null;
                callback(replyStruct);
                return;
            }

            // window number
            //
            let cstrWindow = terminalConfig.windowNumber;
            while (cstrWindow.length < 3) {
                // MAX_WINDOW_LENGTH = 3
                cstrWindow = '0' + cstrWindow;
            }
            // hw id
            //
            let cstrHWID = terminalConfig.hardwareId;
            while (cstrHWID.length < 4) {
                // MAX_HWID_LENGTH = 4
                cstrHWID = '0' + cstrHWID;
            }

            // staff id
            //
            let cstrStaff = '';

            if (bReportStaff) {
                if (staff.getStaffId().length !== 0) {
                    cstrStaff = AttendingStaffId_QRC;
                    cstrStaff += '/';
                }
            }
            // preparing warning text"WWW/xxxx/*
            //
            let cstrWarningText = '';

            cstrWarningText += cstrWindow;
            cstrWarningText += '/';
            cstrWarningText += cstrHWID;
            cstrWarningText += ' * ';
            cstrWarningText += cstrStaff;
            cstrWarningText += warningText;
            cstrWarningText += ' *';

            // // since Warning message is unsolicited, there is no reply.

            const msgRequest = new ByteArrayBuilder();

            msgRequest.AppendNewCust(true);
            msgRequest.AppendMsgCode(MessageCode.MC_WARNING);

            msgRequest.AppendOutVarStr(cstrWarningText);
            // m_datagramSocket -> send(reportWarning.dataPacket(), reportWarning.dataSize());
            // 2:process requst
            const reqMsg: Messages = {
                message: msgRequest.ToArray(),
                messageCode: 0,
                betObj: null,
            };
            ReqHandler.getInstance().ProcessUnsolicitedRequest(
                reqMsg,
                (reply_msg) => {
                    try {
                        // 3:process reply
                        // 4:telling the viewModel bet reply
                        if (reply_msg === null) {
                            replyStruct.code =
                                ResponseObjectCode.ERROR_CODE_NORMAL;
                            replyStruct.message = 'send error';
                        } else {
                            replyStruct.code = ResponseObjectCode.SUCCESS_CODE;
                            replyStruct.message = 'success';
                        }
                    } catch (err) {
                        if (err instanceof ComSvrException) {
                            replyStruct.code =
                                ResponseObjectCode.ERROR_CODE_NORMAL;
                            replyStruct.message = err.message;
                            replyStruct.body = null;
                        } else {
                            replyStruct.code =
                                ResponseObjectCode.ERROR_CODE_NORMAL;
                            replyStruct.message =
                                ERROR_MSG.RID_SYS_ERR_EXCEPTION;
                            replyStruct.body = null;
                        }
                    } finally {
                        callback(replyStruct);
                    }
                }
            );
        } catch (err) {
            if (err instanceof ComSvrException) {
                replyStruct.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                replyStruct.message = err.message;
                replyStruct.body = null;
                callback(replyStruct);
            } else {
                replyStruct.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                replyStruct.message = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
                replyStruct.body = null;
                callback(replyStruct);
            }
        }
    }
}
