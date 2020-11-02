import { MsgFormatter } from './util/msgFormatter';
import { ByteArrayBuilder } from './util/byteArrayBuilder';
import {
    MSG_TB_DEP_REPLY,
    MSG_ESC_ACC_ACS_REPLY,
    MSG_QRC_ACC_REL_REPLY,
    MSG_PAY_REPLY,
    MSG_BET_REPLY,
    Messages,
} from '../share/models/comm-serv/Messages';
import { MessageCode, PayMethod } from '../share/models/comm-serv/CommonDefs';
import { ReqHandler, ReqHandlerCallBack } from './util/reqHandler';
import { ReplyProcessor } from './util/replyProcessor';
import { StatusError } from '../share/utils/status-error';
import { Events } from '../share/models/comm-serv/Events';
import { ComSvrException } from './util/comSvrException';
import { RacingBetObject } from '../share/models/comm-serv/Racing/RacingBetObject';
import { customer } from '../share/main-proc/customer/customer';
import {
    ResponseObject,
    ResponseObjectCode,
    ERROR_MSG,
} from '../share/models/response-common';
import { validateJsonObjectFormat } from '../beteng-serv/routes/routeShare';
import { terminalConfig } from '../share/main-proc/terminal-config/terminal-config';
import { Configs } from '../share/main-proc/terminal-config/configs.enum';
import { logger } from '../share/utils/logs';
import {
    translateErrorMsgFromBackEnd,
    action_Ack_Cont_Eject,
} from '../share/methods/translateErrorMsg';
import { translateErrorCode } from '../share/methods/translateErrorCode';
export class CustomerServ {
    public static readonly Instance: CustomerServ = new CustomerServ();
    constructor() {}

    AccountAccess(callback: ReqHandlerCallBack) {
        const msgCode = MessageCode.MC_ESC; // MsgFormatter.GetMarkSixMsgCodeBy(mk6);
        const ESCAccReply = new MSG_ESC_ACC_ACS_REPLY();
        const msgRequest = new ByteArrayBuilder();
        const Reply: ResponseObject = {
            code: null,
            body: null,
            message: null,
        };
        try {
            // 1:format message
            MsgFormatter.FormatESCAccountAccessMessage(msgRequest);
            // 2:process requst
            const reqMsg: Messages = {
                message: msgRequest.ToArray(),
                messageCode: msgCode,
                betObj: null,
            };
            ReqHandler.getInstance().ProcessRequest(reqMsg, (reply_msg) => {
                try {
                    // 3:process reply
                    ReplyProcessor.ProcessESCAccountAccessReply(
                        reply_msg,
                        ESCAccReply
                    );
                    customer.AccountNumber = ESCAccReply.integratedAccNum;
                    if (reply_msg.GetMsgCode() === MessageCode.MC_ERR_REPLY) {
                        Reply.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                        Reply.message = ESCAccReply.errorText;
                    } else {
                        Reply.code = ResponseObjectCode.SUCCESS_CODE;
                        Reply.message = 'success';
                    }
                    Reply.body = ESCAccReply;
                    // 4:telling the viewModel bet reply
                    callback(Reply);
                } catch (err) {
                    if (err instanceof ComSvrException) {
                        Reply.message = err.message;
                        Reply.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                        callback(Reply);
                    } else {
                        Reply.message = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
                        Reply.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                        callback(Reply);
                    }
                }
            });
            // msgReply = ReqHandler.ProcessRequest(reqMsg);
            // //3:process reply
            // ReplyProcessor.ProcessSignOnReply(msgReply, signOnReply);
            // //4:telling the viewModel bet reply
            // RxPS.Publish<MSG_SIGN_ON_REPLY>(Events.COMMS_REQ_REPLY_MSG_SIGN_ON_REPLY, signOnReply);
        } catch (err) {
            if (err instanceof ComSvrException) {
                Reply.message = err.message;
                Reply.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                callback(Reply);
            } else {
                Reply.message = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
                Reply.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                callback(Reply);
            }
        }
        return true;
    }
    AccountRelease(callback: ReqHandlerCallBack) {
        const msgCode = MessageCode.MC_ESC;
        const AccRelReply = new MSG_QRC_ACC_REL_REPLY();
        const msgRequest = new ByteArrayBuilder();
        const Reply: ResponseObject = {
            code: null,
            body: null,
            message: null,
        };
        try {
            MsgFormatter.FormatESCAccountReleaseMessage(msgRequest);
            const reqMsg: Messages = {
                message: msgRequest.ToArray(),
                messageCode: msgCode,
                betObj: null,
            };
            ReqHandler.getInstance().ProcessRequest(reqMsg, (reply_msg) => {
                try {
                    // 3:process reply
                    ReplyProcessor.ProcessQRCAccountReleaseReply(
                        reply_msg,
                        AccRelReply
                    );
                    // 4:telling the viewModel bet reply
                    if (reply_msg.GetMsgCode() === MessageCode.MC_ERR_REPLY) {
                        Reply.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                        Reply.message = AccRelReply.errorText;
                    } else {
                        Reply.code = ResponseObjectCode.SUCCESS_CODE;
                        Reply.message = 'success';
                    }
                    Reply.body = AccRelReply;
                    callback(Reply);
                } catch (err) {
                    if (err instanceof ComSvrException) {
                        Reply.message = err.message;
                        Reply.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                        callback(Reply);
                    } else {
                        Reply.message = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
                        Reply.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                        callback(Reply);
                    }
                }
            });
        } catch (err) {
            if (err instanceof ComSvrException) {
                Reply.message = err.message;
                Reply.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                callback(Reply);
            } else {
                Reply.message = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
                Reply.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                callback(Reply);
            }
        }

        return true;
    }
    PayBet(params: any, callback: ReqHandlerCallBack) {
        //  PayBet(tsn: string, paymethod: PayMethod, callback: ReqHandlerCallBack): boolean {
        const param: string[] = [params.tsn, params.payMethod.toString()];
        const msgCode = MessageCode.MC_PAY;
        const payReply = new MSG_PAY_REPLY();
        const betReply = new MSG_BET_REPLY();
        const msgRequest = new ByteArrayBuilder();
        const rac: RacingBetObject = new RacingBetObject(); // const msgReply=null;
        const Reply: ResponseObject = {
            code: null,
            body: null,
            message: null,
        };
        try {
            MsgFormatter.FormatPayBetMessage(msgRequest, param);
            // process request
            const reqMsg: Messages = {
                message: msgRequest.ToArray(),
                messageCode: msgCode,
                betObj: null,
            };
            ReqHandler.getInstance().ProcessRequest(reqMsg, (reply_msg) => {
                try {
                    // 3:process reply
                    const ret = ReplyProcessor.ProcessPayBetReply(
                        reply_msg,
                        payReply,
                        betReply,
                        rac
                    );
                    Reply.body = { payReply: payReply, betReply: betReply };
                    if (!ret) {
                        Reply.message = translateErrorMsgFromBackEnd(
                            payReply.errorText
                        );
                        Reply.code = translateErrorCode(payReply.errorText);
                        if (Reply.code === ResponseObjectCode.ERROR_SEVERE) {
                            Reply.body = {
                                isBackEndError: true,
                                errorText: payReply.errorText,
                                bEject: true,
                            };
                        } else {
                            Reply.body = {
                                isBackEndError: false,
                                errorText: payReply.errorText,
                                bEject: true,
                            };
                        }
                    } else {
                        Reply.code = ResponseObjectCode.SUCCESS_CODE;
                        Reply.message = 'success';
                    }
                    // 4:telling the viewModel bet reply
                    callback(Reply);
                } catch (err) {
                    if (err instanceof ComSvrException) {
                        Reply.message = err.message;
                        Reply.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                        callback(Reply);
                    } else {
                        Reply.message = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
                        Reply.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                        callback(Reply);
                    }
                }
            });
        } catch (err) {
            if (err instanceof ComSvrException) {
                Reply.message = err.message;
                Reply.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                callback(Reply);
            } else {
                Reply.message = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
                Reply.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                callback(Reply);
            }
        }
        return true;
    }
    TbDeposit(params: any, callback: ReqHandlerCallBack) {
        // TbDeposit(accountNumber: string, amount: number, callback: ReqHandlerCallBack): boolean {
        // const param: string[] = [accountNumber, String(amount)];
        const param: string[] = [params.accountNumber, String(params.amount)];
        const msgCode = MessageCode.MC_TBD;
        const tbDepReply = new MSG_TB_DEP_REPLY();
        const msgRequest = new ByteArrayBuilder();
        const Reply: ResponseObject = {
            code: null,
            body: null,
            message: null,
        };
        // ByteArrayBuilder msgReply = null;
        try {
            MsgFormatter.FormatTbDepositMessage(msgRequest, param);
            const reqMsg: Messages = {
                message: msgRequest.ToArray(),
                messageCode: msgCode,
                betObj: null,
            };
            ReqHandler.getInstance().ProcessRequest(reqMsg, (reply_msg) => {
                try {
                    // 3:process reply
                    const ret = ReplyProcessor.ProcessTbDepositReply(
                        reply_msg,
                        tbDepReply
                    );
                    if (!ret) {
                        Reply.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                        Reply.message = tbDepReply.errorText;
                    } else {
                        Reply.code = ResponseObjectCode.SUCCESS_CODE;
                        Reply.message = 'success';
                    }
                    Reply.body = tbDepReply;
                    // 4:telling the viewModel bet reply
                    callback(Reply);
                } catch (err) {
                    if (err instanceof ComSvrException) {
                        Reply.message = err.message;
                        Reply.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                        callback(Reply);
                    } else {
                        Reply.message = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
                        Reply.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                        callback(Reply);
                    }
                }
            });
        } catch (err) {
            if (err instanceof ComSvrException) {
                Reply.message = err.message;
                Reply.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                callback(Reply);
            } else {
                Reply.message = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
                Reply.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                callback(Reply);
            }
        }
        return true;
    }

    // #endregion
    QRCAccountAccess(params: any, callback: ReqHandlerCallBack) {
        const msgCode = MessageCode.MC_ESC; // MsgFormatter.GetMarkSixMsgCodeBy(mk6);
        const ESCAccReply = new MSG_ESC_ACC_ACS_REPLY();
        const msgRequest = new ByteArrayBuilder();
        const param: string[] = [params.qrcValue];
        let bb: Buffer = Buffer.from(params.qrcValue);
        logger.info('AccessqrcValuesend = ' + bb);
        logger.info('AccessqrcValuelength = ' + bb.length);
        bb = Array.prototype.map.call(bb, (d) => d.toString(16)).join(' ');
        logger.info(bb);
        const Reply: ResponseObject = {
            code: null,
            body: null,
            message: null,
        };
        try {
            // 1:format message
            MsgFormatter.FormatQRCAccountAccessMessage(msgRequest, param);
            // 2:process requst
            const reqMsg: Messages = {
                message: msgRequest.ToArray(),
                messageCode: msgCode,
                betObj: null,
            };
            ReqHandler.getInstance().ProcessRequest(reqMsg, (reply_msg) => {
                try {
                    // 3:process reply
                    const ret = ReplyProcessor.ProcessQRCAccountAccessReply(
                        reply_msg,
                        ESCAccReply
                    );
                    customer.content.IntegratedAccountNumber =
                        ESCAccReply.integratedAccNum;
                    Reply.body = ESCAccReply;
                    if (!ret) {
                        Reply.message = translateErrorMsgFromBackEnd(
                            ESCAccReply.errorText
                        );
                        Reply.code = translateErrorCode(ESCAccReply.errorText);
                        if (Reply.code === ResponseObjectCode.ERROR_SEVERE) {
                            Reply.body = {
                                isBackEndError: true,
                                errorText: ESCAccReply.errorText,
                            };
                        }
                    } else {
                        Reply.code = ResponseObjectCode.SUCCESS_CODE;
                        Reply.message = 'success';
                    }

                    // 4:telling the viewModel bet reply
                } catch (err) {
                    if (err instanceof ComSvrException) {
                        Reply.message = err.message;
                        Reply.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                    } else {
                        Reply.message = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
                        Reply.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                    }
                } finally {
                    if (customer.newCustomerFlag) {
                        customer.newCustomerFlag = false;
                    }
                    callback(Reply);
                }
            });
            // msgReply = ReqHandler.ProcessRequest(reqMsg);
            // //3:process reply
            // ReplyProcessor.ProcessSignOnReply(msgReply, signOnReply);
            // //4:telling the viewModel bet reply
            // RxPS.Publish<MSG_SIGN_ON_REPLY>(Events.COMMS_REQ_REPLY_MSG_SIGN_ON_REPLY, signOnReply);
        } catch (err) {
            if (err instanceof ComSvrException) {
                Reply.message = err.message;
                Reply.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                callback(Reply);
            } else {
                Reply.message = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
                Reply.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                callback(Reply);
            }
        }
        return true;
    }
    QRCAccountRelease(params: any, callback: ReqHandlerCallBack) {
        const msgCode = MessageCode.MC_ESC;
        const AccRelReply = new MSG_QRC_ACC_REL_REPLY();
        const msgRequest = new ByteArrayBuilder();
        const param: string[] = [params.qrcValue];
        let bb: Buffer = Buffer.from(params.qrcValue);
        logger.info('ReleaseqrcValuesend = ' + bb);
        logger.info('ReleaseqrcValuelength = ' + bb.length);
        bb = Array.prototype.map.call(bb, (d) => d.toString(16)).join(' ');
        logger.info(bb);
        const Reply: ResponseObject = {
            code: null,
            body: null,
            message: null,
        };
        try {
            MsgFormatter.FormatQRCAccountReleaseMessage(msgRequest, param);
            const reqMsg: Messages = {
                message: msgRequest.ToArray(),
                messageCode: msgCode,
                betObj: null,
            };
            ReqHandler.getInstance().ProcessRequest(reqMsg, (reply_msg) => {
                try {
                    // 3:process reply
                    const ret = ReplyProcessor.ProcessQRCAccountReleaseReply(
                        reply_msg,
                        AccRelReply
                    );
                    Reply.body = AccRelReply;
                    if (!ret) {
                        Reply.message = translateErrorMsgFromBackEnd(
                            AccRelReply.errorText
                        );
                        Reply.code = translateErrorCode(AccRelReply.errorText);
                        if (Reply.code === ResponseObjectCode.ERROR_SEVERE) {
                            Reply.body = {
                                isBackEndError: true,
                                errorText: AccRelReply.errorText,
                            };
                        }
                    } else {
                        Reply.code = ResponseObjectCode.SUCCESS_CODE;
                        Reply.message = 'success';
                    }
                    // 4:telling the viewModel bet reply
                    callback(Reply);
                } catch (err) {
                    if (err instanceof ComSvrException) {
                        Reply.message = err.message;
                        Reply.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                        callback(Reply);
                    } else {
                        Reply.message = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
                        Reply.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                        callback(Reply);
                    }
                }
            });
        } catch (err) {
            if (err instanceof ComSvrException) {
                Reply.message = err.message;
                Reply.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                callback(Reply);
            } else {
                Reply.message = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
                Reply.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                callback(Reply);
            }
        }

        return true;
    }
}
