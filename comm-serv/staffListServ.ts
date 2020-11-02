import { MsgFormatter } from './util/msgFormatter';
import { ByteArrayBuilder } from './util/byteArrayBuilder';
import { Messages } from '../share/models/comm-serv/Messages';
import { MessageCode } from '../share/models/comm-serv/CommonDefs';
import { ReqHandler, ReqHandlerCallBack } from './util/reqHandler';
import { ReplyProcessor } from './util/replyProcessor';
import { ComSvrException } from './util/comSvrException';
import {
    ResponseObject,
    ResponseObjectCode,
    ERROR_MSG,
} from '../share/models/response-common';
import { HttpSend } from './httpsend/HttpSend';
import { StaffContent } from '../share/main-proc/staff/staff-model';
const qs = require('qs');
export class StaffListServ {
    public static readonly Instance: StaffListServ = new StaffListServ();
    constructor() {}

    getStaffList(object: any, callback: ReqHandlerCallBack) {
        const Reply: ResponseObject = {
            code: null,
            body: null,
            message: null,
        };

        try {
            HttpSend.getInstance().simpleSendRecv(
                '/file/StaffList',
                '',
                object.authorization,
                (reply_msg) => {
                    callback(reply_msg);
                }
            );
        } catch (err) {
            if (err instanceof ComSvrException) {
                Reply.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                Reply.message = err.message;
                callback(Reply);
            } else {
                Reply.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                Reply.message = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
                callback(Reply);
            }
        }
        return true;
    }
    addStaff(params: any, object: any, callback: ReqHandlerCallBack) {
        // const staff: StaffContent = new StaffContent;
        // staff.strAuthorityType = params.strAuthorityType;
        // staff.strStaffId = params.strStaffId;
        // staff.strStaffPassword = params.strStaffPassword;
        const Reply: ResponseObject = {
            code: null,
            body: null,
            message: null,
        };
        let url = '/file/AddStaff?staffs=' + JSON.stringify(params);
        // + "&token=" + params.token;
        console.log('url=' + url);
        console.log('params=' + JSON.stringify(params));
        try {
            HttpSend.getInstance().simpleSendRecv(
                url,
                '',
                object.authorization,
                (reply_msg) => {
                    callback(reply_msg);
                }
            );
        } catch (err) {
            if (err instanceof ComSvrException) {
                Reply.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                Reply.message = err.message;
                callback(Reply);
            } else {
                Reply.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                Reply.message = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
                callback(Reply);
            }
        }
        return true;
    }

    login(callback: ReqHandlerCallBack) {
        // const msgCode = 10086;
        const Reply: ResponseObject = {
            code: null,
            body: null,
            message: null,
        };
        try {
            HttpSend.getInstance().simpleSendRecv(
                '/token?id=KioskUpdateServer',
                '',
                '',
                (reply_msg) => {
                    callback(reply_msg);
                }
            );
        } catch (err) {
            if (err instanceof ComSvrException) {
                Reply.code = ResponseObjectCode.ERROR_SEVERE;
                Reply.message = err.message;
                callback(Reply);
            } else {
                Reply.code = ResponseObjectCode.ERROR_SEVERE;
                Reply.message = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
                callback(Reply);
            }
        }
        return true;
    }

    getAPIKey(object: any, callback: ReqHandlerCallBack) {
        const Reply: ResponseObject = {
            code: null,
            body: null,
            message: null,
        };
        try {
            HttpSend.getInstance().simpleSendRecv(
                '/getAPIKey',
                '',
                object.authorization,
                (reply_msg) => {
                    callback(reply_msg);
                }
            );
        } catch (err) {
            if (err instanceof ComSvrException) {
                Reply.code = ResponseObjectCode.ERROR_SEVERE;
                Reply.message = err.message;
                callback(Reply);
            } else {
                Reply.code = ResponseObjectCode.ERROR_SEVERE;
                Reply.message = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
                callback(Reply);
            }
        }
        return true;
    }

    // #endregion
}
