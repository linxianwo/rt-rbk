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
import {
    MessageCode,
    PayMethod,
    BC_Type,
} from '../share/models/comm-serv/CommonDefs';
import { ReqHandler, ReqHandlerCallBack } from './util/reqHandler';
import { ReplyProcessor } from './util/replyProcessor';
import { StatusError } from '../share/utils/status-error';
import { Events } from '../share/models/comm-serv/Events';
import { ComSvrException } from './util/comSvrException';
import { RacingBetObject } from '../share/models/comm-serv/Racing/RacingBetObject';
import { HttpSend } from './httpsend/HttpSend';
import {
    ResponseObject,
    ResponseObjectCode,
    ERROR_MSG,
} from '../share/models/response-common';
import { translateErrorMsgFromBackEnd } from '../share/methods/translateErrorMsg';
import axios from 'axios-https-proxy-fix';
export class BCServ {
    public static readonly Instance: BCServ = new BCServ();
    constructor() {}

    BCConnTest(params: any, callback: ReqHandlerCallBack) {
        const bcType = params.bcType;
        if (bcType === BC_Type.NO_CONNECTION) {
            // test BC_A first, if fail, test BC_B then
            //
            HttpSend.getInstance().isBcListening(
                BC_Type.NO_CONNECTION,
                callback
            );
        } else if (bcType === BC_Type.BC_A) {
            HttpSend.getInstance().isBcListening(BC_Type.BC_A, callback);
        } else if (bcType === BC_Type.BC_B) {
            HttpSend.getInstance().isBcListening(BC_Type.BC_B, callback);
        } else {
            callback({
                code: ResponseObjectCode.ERROR_CODE_NORMAL,
                body: null,
                message: 'bcType error',
            });
        }
    }
    testTkt(callback: ReqHandlerCallBack) {
        const msgCode = MessageCode.MC_TEST_TKT;
        const msgRequest = new ByteArrayBuilder();
        const Reply: ResponseObject = {
            code: null,
            body: null,
            message: null,
        };
        try {
            // 1:format message

            msgRequest.AppendNewCust(true); // customer.newCustomerFlag
            msgRequest.AppendMsgCode(MessageCode.MC_TEST_TKT);
            msgRequest.AppendN9(0, 2);
            msgRequest.AppendSeparator();
            msgRequest.AppendN9(0, 2);
            // 2:process requst
            const reqMsg: Messages = {
                message: msgRequest.ToArray(),
                messageCode: msgCode,
                betObj: null,
            };
            ReqHandler.getInstance().ProcessRequest(reqMsg, (reply_msg) => {
                try {
                    // 3:process reply
                    if (reply_msg.GetMsgCode() === MessageCode.MC_ERR_REPLY) {
                        Reply.message = reply_msg.GetErrorText();
                        Reply.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                    } else {
                        let offset = 1;
                        const frontEndNumber_tmp = reply_msg.ExtractFixStr(
                            offset,
                            2
                        );
                        const frontEndNumber = ReplyProcessor.convertBcd2Str(
                            frontEndNumber_tmp
                        );
                        offset += 3;
                        const lineNumber_tmp = reply_msg.ExtractFixStr(
                            offset,
                            2
                        );
                        const lineNumber = ReplyProcessor.convertBcd2Str(
                            lineNumber_tmp
                        );
                        Reply.body = {
                            frontEndNumber: frontEndNumber,
                            lineNumber: lineNumber,
                        };
                        Reply.message = 'success';
                        Reply.code = ResponseObjectCode.SUCCESS_CODE;
                    }
                    // 4:telling the viewModel bet reply
                    callback(Reply);
                } catch (err) {
                    if (err instanceof ComSvrException) {
                        Reply.message = err.message;
                        Reply.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                        callback(Reply);
                    } else {
                        Reply.message = err.message; // ErrorMessage.SystemException;
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
                Reply.message = err.message; // ErrorMessage.SystemException;
                Reply.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                callback(Reply);
            }
        }
        return true;
    }

    Test1(callback: ReqHandlerCallBack) {
        const https = require('https');
        const http1 = axios.post(
            '',
            { second: 12 },
            {
                baseURL: 'http://localhost:5002/sleepasyn123/',
                // "https://10.194.102.130:8001/kiosk/",
                // "https://devgit01.corpdev.hkjc.com:8443",
                timeout: 5000,
                // data:{second:6},
                httpsAgent: new https.Agent({ rejectUnauthorized: false }),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );
        http1
            .then((res1) => {
                callback('res=' + JSON.stringify(res1.data));
            })
            .catch((err) => {
                console.log('err=' + err);
                callback('err=' + err);
            });
    }

    async getBCServerTime() {
        const Reply: ResponseObject = {
            code: null,
            body: null,
            message: null,
        };

        try {
            const reply_msg = await HttpSend.getInstance().getFromServer(
                '/getServerTime'
            );
            if (reply_msg.status === 200) {
                Reply.code = 0;
            } else {
                Reply.code = 1;
            }
            Reply.message = reply_msg.statusText || reply_msg.message;
            Reply.body = reply_msg.data;
            return Reply;
        } catch (err) {
            if (err instanceof ComSvrException) {
                Reply.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                Reply.message = err.message;
                return Reply;
            } else {
                Reply.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                Reply.message = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
                return Reply;
            }
        }
    }
}
