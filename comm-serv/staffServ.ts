import { MsgFormatter } from './util/msgFormatter';
import { ByteArrayBuilder } from './util/byteArrayBuilder';
import {
    MSG_OPT_FUNC_REPLY,
    MSG_STAFF_AUTH_REPLY,
    MSG_SIGN_ON,
    MSG_SIGN_ON_REPLY,
    MSG_SIGN_OFF_REPLY,
    Messages,
    MSG_GET_RDT_REPLY,
} from '../share/models/comm-serv/Messages';
import { MessageCode } from '../share/models/comm-serv/CommonDefs';
import { ReqHandler, ReqHandlerCallBack } from './util/reqHandler';
import { ReplyProcessor } from './util/replyProcessor';
import { ComSvrException } from './util/comSvrException';
import {
    ResponseObject,
    ResponseObjectCode,
    ERROR_MSG,
} from '../share/models/response-common';
import { translateErrorMsgFromBackEnd } from '../share/methods/translateErrorMsg';
import { translateErrorCode } from '../share/methods/translateErrorCode';
export class StaffServ {
    public static readonly Instance: StaffServ = new StaffServ();
    constructor() {}

    SignOn(params: any, callback: ReqHandlerCallBack) {
        const signOn: MSG_SIGN_ON = params;
        const msgCode = MessageCode.MC_SIGN_ON; // MsgFormatter.GetMarkSixMsgCodeBy(mk6);
        const reply = new MSG_SIGN_ON_REPLY();
        const signOnReply: ResponseObject = {
            code: null,
            body: null,
            message: null,
        };
        const msgRequest = new ByteArrayBuilder();

        try {
            // 1:format message
            MsgFormatter.FormatSignOnMessage(msgRequest, signOn);
            // 2:process requst
            const reqMsg: Messages = {
                message: msgRequest.ToArray(),
                messageCode: msgCode,
                betObj: null,
            };
            ReqHandler.getInstance().ProcessRequest(reqMsg, (reply_msg) => {
                try {
                    // 3:process reply
                    const ret = ReplyProcessor.ProcessSignOnReply(
                        reply_msg,
                        reply,
                        signOnReply
                    );
                    // 4:telling the viewModel bet reply
                    if (!ret) {
                        signOnReply.message = translateErrorMsgFromBackEnd(
                            reply.errorText
                        );
                        signOnReply.code = translateErrorCode(reply.errorText);
                        if (
                            signOnReply.code === ResponseObjectCode.ERROR_SEVERE
                        ) {
                            signOnReply.body = {
                                isBackEndError: true,
                                errorText: reply.errorText,
                            };
                        }
                    }
                    callback(signOnReply);
                } catch (err) {
                    if (err instanceof ComSvrException) {
                        signOnReply.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                        signOnReply.message = err.message;
                        callback(signOnReply);
                    } else {
                        signOnReply.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                        signOnReply.message = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
                        callback(signOnReply);
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
                signOnReply.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                signOnReply.message = err.message;
                callback(signOnReply);
            } else {
                signOnReply.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                signOnReply.message = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
                callback(signOnReply);
            }
        }
        return true;
    }
    //    SignOff(param: boolean, callback: ReqHandlerCallBack) {
    SignOff(params: any, callback: ReqHandlerCallBack) {
        const msgCode = MessageCode.MC_SIGN_OFF;
        const shroffSignOff = params.shroffSignOff;

        const reply = new MSG_SIGN_OFF_REPLY();
        const signOffReply: ResponseObject = {
            code: null,
            body: null,
            message: null,
        };
        const msgRequest = new ByteArrayBuilder();
        try {
            MsgFormatter.FormatSignOffMessage(msgRequest, shroffSignOff);
            const reqMsg: Messages = {
                message: msgRequest.ToArray(),
                messageCode: msgCode,
                betObj: null,
            };
            ReqHandler.getInstance().ProcessRequest(reqMsg, (reply_msg) => {
                try {
                    // 3:process reply
                    const ret = ReplyProcessor.ProcessSignOffReply(
                        reply_msg,
                        reply,
                        signOffReply
                    );
                    // 4:telling the viewModel bet reply
                    if (!ret) {
                        signOffReply.message = translateErrorMsgFromBackEnd(
                            reply.errorText
                        );
                        signOffReply.code = translateErrorCode(reply.errorText);
                        if (
                            signOffReply.code ===
                            ResponseObjectCode.ERROR_SEVERE
                        ) {
                            signOffReply.body = {
                                isBackEndError: true,
                                errorText: reply.errorText,
                            };
                        }
                    }
                    callback(signOffReply);
                } catch (err) {
                    if (err instanceof ComSvrException) {
                        signOffReply.message = err.message;
                        signOffReply.code =
                            ResponseObjectCode.ERROR_CODE_NORMAL;
                        callback(signOffReply);
                    } else {
                        signOffReply.message = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
                        signOffReply.code =
                            ResponseObjectCode.ERROR_CODE_NORMAL;
                        callback(signOffReply);
                    }
                }
            });
        } catch (err) {
            if (err instanceof ComSvrException) {
                signOffReply.message = err.message;
                signOffReply.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                callback(signOffReply);
            } else {
                signOffReply.message = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
                signOffReply.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                callback(signOffReply);
            }
        }

        return true;
    }
    ChangePassword(params: any, callback: ReqHandlerCallBack): boolean {
        //  ChangePassword(staffID: string, oldPassword: string, newPassword: string, callback: ReqHandlerCallBack): boolean {
        //      const param: string[] = [staffID, oldPassword, newPassword];
        const param: string[] = [
            params.staffID,
            params.oldPassword,
            params.newPassword,
        ];
        const msgCode = MessageCode.MC_CHANGE_PSWD;
        const reply = new MSG_OPT_FUNC_REPLY();
        const changePasswordReply: ResponseObject = {
            code: null,
            body: null,
            message: null,
        };
        const msgRequest = new ByteArrayBuilder();
        // const msgReply=null;
        try {
            MsgFormatter.FormatChangePasswordMessage(msgRequest, param);
            // process requst
            const reqMsg: Messages = {
                message: msgRequest.ToArray(),
                messageCode: msgCode,
                betObj: null,
            };
            ReqHandler.getInstance().ProcessRequest(reqMsg, (reply_msg) => {
                try {
                    // 3:process reply
                    const ret = ReplyProcessor.ProcessChangePasswordReply(
                        reply_msg,
                        reply,
                        changePasswordReply
                    );
                    // 4:telling the viewModel bet reply
                    if (!ret) {
                        changePasswordReply.message = translateErrorMsgFromBackEnd(
                            reply.errorText
                        );
                        changePasswordReply.code = translateErrorCode(
                            reply.errorText
                        );
                        if (
                            changePasswordReply.code ===
                            ResponseObjectCode.ERROR_SEVERE
                        ) {
                            changePasswordReply.body = {
                                isBackEndError: true,
                                errorText: reply.errorText,
                            };
                        }
                    }
                    callback(changePasswordReply);
                } catch (err) {
                    if (err instanceof ComSvrException) {
                        changePasswordReply.code =
                            ResponseObjectCode.ERROR_CODE_NORMAL;
                        changePasswordReply.message = err.message;
                        callback(changePasswordReply);
                    } else {
                        changePasswordReply.code =
                            ResponseObjectCode.ERROR_CODE_NORMAL;
                        changePasswordReply.message =
                            ERROR_MSG.RID_SYS_ERR_EXCEPTION;
                        callback(changePasswordReply);
                    }
                }
            });
        } catch (err) {
            if (err instanceof ComSvrException) {
                changePasswordReply.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                changePasswordReply.message = err.message;
                callback(changePasswordReply);
            } else {
                changePasswordReply.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                changePasswordReply.message = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
                callback(changePasswordReply);
            }
        }

        return true;
    }

    GetStaffAuthority(params: any, callback: ReqHandlerCallBack): boolean {
        // GetStaffAuthority(staffID: string, password: string, rqtPurpose: number = 1, callback: ReqHandlerCallBack): boolean {
        //     const param: string[] = [staffID, password, String(rqtPurpose)];
        if (typeof params.rqtPurpose === 'undefined') {
            params.rqtPurpose = 1;
        }
        const param: string[] = [
            params.staffID,
            params.password,
            params.rqtPurpose,
        ];
        const msgCode = MessageCode.MC_AUTHMASK;
        const reply = new MSG_STAFF_AUTH_REPLY();
        const getStaffAuthorityReply: ResponseObject = {
            code: null,
            body: null,
            message: null,
        };
        const msgRequest = new ByteArrayBuilder();
        // ByteArrayBuilder msgReply = null;
        try {
            MsgFormatter.FormatGetStaffAuthorityMessage(msgRequest, param);
            const reqMsg: Messages = {
                message: msgRequest.ToArray(),
                messageCode: msgCode,
                betObj: null,
            };
            ReqHandler.getInstance().ProcessRequest(reqMsg, (reply_msg) => {
                try {
                    // 3:process reply
                    const ret = ReplyProcessor.ProcessGetStaffAuthorityReply(
                        reply_msg,
                        reply,
                        getStaffAuthorityReply
                    );
                    // 4:telling the viewModel bet reply
                    if (!ret) {
                        getStaffAuthorityReply.message = translateErrorMsgFromBackEnd(
                            reply.errorText
                        );
                        getStaffAuthorityReply.code = translateErrorCode(
                            reply.errorText
                        );
                        if (
                            getStaffAuthorityReply.code ===
                            ResponseObjectCode.ERROR_SEVERE
                        ) {
                            getStaffAuthorityReply.body = {
                                isBackEndError: true,
                                errorText: reply.errorText,
                            };
                        }
                    }
                    callback(getStaffAuthorityReply);
                } catch (err) {
                    if (err instanceof ComSvrException) {
                        getStaffAuthorityReply.code =
                            ResponseObjectCode.ERROR_CODE_NORMAL;
                        getStaffAuthorityReply.message = err.message;
                        callback(getStaffAuthorityReply);
                    } else {
                        getStaffAuthorityReply.code =
                            ResponseObjectCode.ERROR_CODE_NORMAL;
                        getStaffAuthorityReply.message =
                            ERROR_MSG.RID_SYS_ERR_EXCEPTION;
                        callback(getStaffAuthorityReply);
                    }
                }
            });
        } catch (err) {
            if (err instanceof ComSvrException) {
                getStaffAuthorityReply.code =
                    ResponseObjectCode.ERROR_CODE_NORMAL;
                getStaffAuthorityReply.message = err.message;
                callback(getStaffAuthorityReply);
            } else {
                getStaffAuthorityReply.code =
                    ResponseObjectCode.ERROR_CODE_NORMAL;
                getStaffAuthorityReply.message =
                    ERROR_MSG.RID_SYS_ERR_EXCEPTION;
                callback(getStaffAuthorityReply);
            }
        }
        return true;
    }

    GetRdt(callback: ReqHandlerCallBack): boolean {
        const msgCode = MessageCode.MC_RDT_RQST;
        const msgRequest = new ByteArrayBuilder();
        const rdtReply: MSG_GET_RDT_REPLY = new MSG_GET_RDT_REPLY();
        const Reply: ResponseObject = {
            code: null,
            body: null,
            message: null,
        };
        try {
            // 1:format message
            msgRequest.AppendNewCust(true); // customer.newCustomerFlag
            msgRequest.AppendMsgCode(MessageCode.MC_RDT_RQST);
            // 2:process requst
            const reqMsg: Messages = {
                message: msgRequest.ToArray(),
                messageCode: msgCode,
                betObj: null,
            };
            ReqHandler.getInstance().ProcessRequest(reqMsg, (reply_msg) => {
                try {
                    // 3:process reply
                    const ret = ReplyProcessor.ProcessGetRdtReply(
                        reply_msg,
                        rdtReply
                    );
                    if (!ret) {
                        Reply.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                        Reply.message = rdtReply.errorText;
                    } else {
                        Reply.code = ResponseObjectCode.SUCCESS_CODE;
                        Reply.message = 'success';
                    }
                    Reply.body = rdtReply;
                    // 4:telling the viewModel bet reply
                    callback(Reply);
                } catch (err) {
                    if (err instanceof ComSvrException) {
                        Reply.message = err.message;
                        Reply.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                        callback(Reply);
                    } else {
                        Reply.message = err.message; // ERROR_MSG.RID_SYS_ERR_EXCEPTION;
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
                Reply.message = err.message; // ERROR_MSG.RID_SYS_ERR_EXCEPTION;
                Reply.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                callback(Reply);
            }
        }
        return true;
    }
    // #endregion
}
