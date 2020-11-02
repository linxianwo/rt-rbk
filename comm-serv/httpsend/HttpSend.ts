import axios from 'axios-https-proxy-fix';
// const qs = require('qs');
import { terminalConfig } from '../../share/main-proc/terminal-config/terminal-config';
import { internalParam } from '../../share/main-proc/internalParam/internalParam';
const assert = require('assert');
import { ReqHandler, ReqHandlerCallBack } from '../util/reqHandler';
import { Messages } from '../../share/models/comm-serv/Messages';
import { CScmpPacket } from './CSCMPPKT';
import { Constanst } from './Constant';
import {
    MessageCode,
    BC_Type,
    BCAST_ERROR,
} from '../../share/models/comm-serv/CommonDefs';
import { ByteArrayBuilder } from '../util/byteArrayBuilder';
import { PoolSymbol } from '../../share/models/comm-serv/Racing/PoolType';
import { Configs } from '../../share/main-proc/terminal-config/configs.enum';
import {
    ResponseObject,
    ResponseObjectCode,
    ERROR_MSG,
} from '../../share/models/response-common';
import { customer } from '../../share/main-proc/customer/customer';
import { KioskServer } from '../../share/utils/server';
// import { HardwareService } from '../../src/app/services/hardware/hardware.service';
import { logger } from '../../share/utils/logs';
import { Buffer } from 'buffer';
import { ComSvrException } from '../util/comSvrException';
import { CustomerStatus } from '../../share/main-proc/customer/customer.enum';
import { AppConfig } from '../../share/environments/environment';
const https = require('https');
export class HttpSend {
    private static m_instance: HttpSend;
    public readonly NOT_INIT = 0;
    public readonly INITIALISING = 1;
    public readonly READY = 2;
    public readonly BUSY = 3;
    public readonly DONE = 0; // completed successfully
    public readonly RETRY = 1; // request failed, need retry
    public readonly FAILOVER = 2; // request failed, need switch over and retry
    public readonly RESET_RETRY = 3; // reset the binding and then retry
    public readonly EOA = 4; // end of action
    private readonly TIMEOUT = 15;
    private readonly BC_TIMEOUT = 10;
    private readonly COMMS_TIMEOUT = 3;
    private m_state = 2;
    private m_msgCount = 0;
    private m_retryCount;
    private st_retryCount;
    private m_rpcErr;
    private m_betStatus;
    private m_bcError;
    private m_rply: CScmpPacket;
    private m_rqst: CScmpPacket;
    private recvMsgText: Buffer;
    private rcvSize: number;
    private sendMsgText: Buffer;
    private tmp_message;
    private urlArr1;
    private urlArr2;
    private period = 3;
    // private useSlaveBCLastTime = false;
    private server: KioskServer;
    private urlArr3;
    private urlArr4;
    private address = '';
    private st_address = '';
    private getOrPost = 'post';
    private bcError = BCAST_ERROR.NOBC_ERROR;

    public static getInstance(): HttpSend {
        if (!this.m_instance) {
            this.m_instance = new HttpSend();
        }
        return this.m_instance;
    }
    private static performSolicited(
        rqst,
        method,
        callback,
        retry,
        httpsendobj = HttpSend.getInstance()
    ) {
        let axiotmp;
        httpsendobj.m_rply = null;
        httpsendobj.m_rqst = rqst[1]; // CSolicitedRequest.m_rqst = rqst[1]
        if (method === 'get') {
            const paramsreq = {
                m_wait: rqst[2],
                rqstSize: httpsendobj.m_rqst.sizeForRpc(),
                rqstData: httpsendobj.m_rqst.dataForRpc(),
            };
            console.log('rqst0=' + rqst[0] + JSON.stringify(paramsreq));
            axiotmp = axios.get(rqst[0] + JSON.stringify(paramsreq), {
                timeout: httpsendobj.TIMEOUT * 1000,
            });
        } else {
            if (httpsendobj.bcError !== BCAST_ERROR.NOBC_ERROR) {
                return;
            }

            const wimntemp = Number.parseInt(terminalConfig.windowNumber);
            let bb: Buffer = httpsendobj.m_rqst.dataForRpc();
            logger.info('request begin---- time=' + new Date());
            logger.info('send = ' + bb);
            const win: Number = new Number(wimntemp << 24);
            logger.info(
                'length = ' +
                    bb.length +
                    ',url=' +
                    rqst[0] +
                    '/sendAndWait?window=' +
                    win +
                    '&branch=' +
                    terminalConfig.branchNumber
            );
            bb = Array.prototype.map.call(bb, (d) => d.toString(16)).join(' ');
            logger.info(bb);
            axiotmp = axios.post('', httpsendobj.m_rqst.dataForRpc(), {
                timeout: httpsendobj.TIMEOUT * 1000,
                baseURL:
                    rqst[0] +
                    '/sendAndWait?window=' +
                    win +
                    '&branch=' +
                    terminalConfig.branchNumber,
                headers: {
                    'Content-Type':
                        'application/x-www-form-urlencoded;charset=UTF-8',
                },
                httpsAgent: new https.Agent({
                    rejectUnauthorized: false,
                }),
            });
        }
        axiotmp
            .then((response) => {
                if (httpsendobj.bcError !== BCAST_ERROR.NOBC_ERROR) {
                    return;
                }
                // tstop = (double)clock()/CLOCKS_PER_SEC;
                // m_responseTime = (tstop-tstart) * 1000;
                // m_responseTime = (m_responseTime > 10000)?10000:m_responseTime;
                if (httpsendobj.m_state === httpsendobj.READY) {
                    throw new ComSvrException(
                        ERROR_MSG.RID_COMSERV_ERR_STATUSERROR,
                        2
                    );
                }
                // -----  in doRequest  ------- //
                httpsendobj.doRequest(response.data);
                // -----  in doRequest  ------- //
                // -----  in performSolicited  ------- //
                // if cancel=false go to catch,here is then alway cancel=true
                const action = httpsendobj.performSolicitedBack();
                // -----  in performSolicited  ------- //
                // -----  in sendRecv  ------- //
                if (httpsendobj.anyReply()) {
                    httpsendobj.m_bcError = Constanst.NOBC_ERROR;
                    httpsendobj.recvMsgText = httpsendobj.m_rply.copyMsgText();
                    // m_this.rcvSize = rec[1];
                } else {
                    // m_this.rcvSize = 0;
                }
                if (action === Constanst.DONE) {
                    if (
                        !httpsendobj.isTestMsg(httpsendobj.m_rqst) &&
                        httpsendobj.isBEMsg(httpsendobj.sendMsgText)
                    ) {
                        /*theTerminal.incMsn();*/
                        // m_sconfig.fnIncMSN();
                        httpsendobj.fnIncMSN();
                    }
                    if (retry) {
                        // m_retryControl->done();
                        // if (!customer.newCustomerFlag ) {
                        // if ((m_this.m_retryCount % 6 > 2) !== m_this.useSlaveBCLastTime) {
                        //     m_this.useSlaveBCLastTime = true;
                        // } else {
                        //     m_this.useSlaveBCLastTime = false;
                        // }
                        // }

                        httpsendobj.retryCount(0);
                    }
                    logger.info(
                        'response success---text=' + httpsendobj.recvMsgText
                    );
                    console.log(
                        '----------then success' + httpsendobj.recvMsgText
                    );
                    const ss = new ByteArrayBuilder();
                    ss.Append(httpsendobj.recvMsgText);
                    callback(ss);
                } else {
                    // C++ KRPCCOMM.CPP -> function performSolicited -> bool cancel = false
                    if (retry) {
                        // && m_this.m_retryCount < 5 // wuxian dao1000ci qing 0
                        if (httpsendobj.m_retryCount % 6 === 5) {
                            if (
                                httpsendobj.m_rqst.msgCode() ===
                                MessageCode.MC_TEST_TKT
                            ) {
                                // for Test Ticket
                                const s = new ByteArrayBuilder();
                                s.Append(
                                    Buffer.concat([
                                        Buffer.from([MessageCode.MC_ERR_REPLY]),
                                        Buffer.from(
                                            'Test Ticket Error, error, betStatus = ' +
                                                httpsendobj.m_betStatus +
                                                ',action = ' +
                                                action
                                        ),
                                    ])
                                );
                                callback(s);
                            } else {
                                console.log(
                                    '---------------------in retryReply_Event'
                                );
                                logger.info('wait for retry---');
                                // httpsendobj.retryCount(0);
                                httpsendobj.server.m_fuc = (msg) => {
                                    console.log(
                                        '---------------------in retryReply_Eventfuc'
                                    );
                                    httpsendobj.server.m_fuc = null;
                                    httpsendobj.m_retryCount++;
                                    const addr = httpsendobj.switchBCAddress();
                                    httpsendobj.emit(httpsendobj.m_retryCount);
                                    HttpSend.performSolicited(
                                        [addr, httpsendobj.m_rqst, rqst[2]],
                                        method,
                                        callback,
                                        retry
                                    );
                                };
                                httpsendobj.emit(
                                    httpsendobj.m_retryCount,
                                    'retryReply_Event'
                                );
                            }
                        } else {
                            logger.info(
                                'has response retry--- count=' +
                                    httpsendobj.m_retryCount +
                                    ',internalParam.msn=' +
                                    internalParam.msn
                            );
                            if (httpsendobj.m_retryCount === 0) {
                                if (internalParam.msn !== 0) {
                                    httpsendobj.m_rqst.flagByte(
                                        httpsendobj.m_rqst.flagByte() | 2
                                    );
                                }
                                // } else if (m_this.m_retryCount === 1000) {
                                //     m_this.retryCount(0);
                            }
                            //    rqst.setHandle( *current );
                            httpsendobj.m_retryCount++;
                            httpsendobj.emit(httpsendobj.m_retryCount);
                            //    m_sconfig.fnIncRetryCount(m_retryCount, m_bcError);
                            setTimeout(
                                HttpSend.performSolicited,
                                httpsendobj.TIMEOUT * 1000,
                                [
                                    httpsendobj.switchBCAddress(),
                                    httpsendobj.m_rqst,
                                    rqst[2],
                                ],
                                method,
                                callback,
                                retry,
                                httpsendobj
                            );
                        }
                    } else {
                        logger.info('retry=false');
                        const s = new ByteArrayBuilder();
                        s.Append(
                            Buffer.concat([
                                Buffer.from([MessageCode.MC_ERR_REPLY]),
                                Buffer.from(
                                    'retry=false, error, betStatus = ' +
                                        httpsendobj.m_betStatus +
                                        ',action = ' +
                                        action
                                ),
                            ])
                        );
                        callback(s);
                    }
                }
                // -----  in sendRecv  ------- //
            })
            .catch((err) => {
                if (httpsendobj.bcError !== BCAST_ERROR.NOBC_ERROR) {
                    return;
                }

                logger.info(
                    'in catch fail--- time=' +
                        new Date() +
                        ',--message=' +
                        err.message +
                        'response=' +
                        (err.response === undefined
                            ? err.response
                            : err.response.status)
                );
                // rqst.writeLog();
                // Sleep(10000 - rqst.getResponseTime());
                // Sleep(100);
                // if ( action == FAILOVER )
                //     current = switchBcFrom( current );
                // else
                //     current = currentBinding();
                // if ( action == RESET_RETRY ) {
                //     current->resetBinding();
                //     current->setComTimeout( COMMS_TIMEOUT );
                // }
                // C++ KRPCCOMM.CPP -> function performSolicited -> bool cancel = true
                // 404error will be retry 500error 502error throw out,program except throw out
                if (
                    retry &&
                    (err.message.indexOf('timeout') !== -1 ||
                        err.response === undefined ||
                        err.response.status === 404)
                ) {
                    if (httpsendobj.m_retryCount % 6 === 5) {
                        if (
                            httpsendobj.m_rqst.msgCode() ===
                            MessageCode.MC_TEST_TKT
                        ) {
                            // for Test Ticket
                            const s = new ByteArrayBuilder();
                            s.Append(
                                Buffer.concat([
                                    Buffer.from([MessageCode.MC_ERR_REPLY]),
                                    Buffer.from(
                                        'Test Ticket Error, retry=' +
                                            retry +
                                            ', error: ' +
                                            httpsendobj.m_retryCount +
                                            JSON.stringify({
                                                code: err.code,
                                                body: err.data,
                                                message: err.message,
                                            })
                                    ),
                                ])
                            );
                            callback(s);
                        } else {
                            console.log(
                                's---------------------in retryReply_Event'
                            );
                            // httpsendobj.retryCount(0);
                            httpsendobj.server.m_fuc = (msg) => {
                                console.log(
                                    '---------------------in retryReply_Eventfuc'
                                );
                                httpsendobj.server.m_fuc = null;
                                httpsendobj.m_retryCount++;
                                const addr = httpsendobj.switchBCAddress();
                                httpsendobj.emit(httpsendobj.m_retryCount);
                                HttpSend.performSolicited(
                                    [addr, httpsendobj.m_rqst, rqst[2]],
                                    method,
                                    callback,
                                    retry
                                );
                            };
                            httpsendobj.emit(
                                httpsendobj.m_retryCount,
                                'retryReply_Event'
                            );
                        }
                    } else {
                        if (httpsendobj.m_retryCount === 0) {
                            if (internalParam.msn !== 0) {
                                httpsendobj.m_rqst.flagByte(
                                    httpsendobj.m_rqst.flagByte() | 2
                                );
                            }
                            // } else if (m_this.m_retryCount === 1000) {
                            //     m_this.retryCount(0);
                        }
                        //    rqst.setHandle( *current );
                        httpsendobj.m_retryCount++;
                        httpsendobj.emit(httpsendobj.m_retryCount);
                        //    m_sconfig.fnIncRetryCount(m_retryCount, m_bcError);
                        if (
                            err.code === 'ECONNABORTED' &&
                            err.message.indexOf('timeout') !== -1
                        ) {
                            HttpSend.performSolicited(
                                [
                                    httpsendobj.switchBCAddress(),
                                    httpsendobj.m_rqst,
                                    rqst[2],
                                ],
                                method,
                                callback,
                                retry
                            );
                        } else {
                            setTimeout(
                                HttpSend.performSolicited,
                                httpsendobj.TIMEOUT * 1000,
                                [
                                    httpsendobj.switchBCAddress(),
                                    httpsendobj.m_rqst,
                                    rqst[2],
                                ],
                                method,
                                callback,
                                retry,
                                httpsendobj
                            );
                        }
                    }
                } else {
                    const s = new ByteArrayBuilder();
                    s.Append(
                        Buffer.concat([
                            Buffer.from([MessageCode.MC_ERR_REPLY]),
                            Buffer.from(
                                'retry=' +
                                    retry +
                                    ', error: ' +
                                    httpsendobj.m_retryCount +
                                    JSON.stringify({
                                        code: err.code,
                                        body: err.data,
                                        message: err.message,
                                    })
                            ),
                        ])
                    );
                    callback(s);
                }
                // chkLineStatus();

                // } else {
                //     console.log('---------------------catch fail' + new Date + err.message);
                //     // {code: err.code,body: err.data, message: err.message}
                //     const s = new ByteArrayBuilder();
                //     s.Append(Buffer.concat([Buffer.from([MessageCode.MC_ERR_REPLY]),
                //     Buffer.from('http error: ' + JSON.stringify({ code: err.code, body: err.message, message: err.message }))]));
                //     callback(s);
                // }
            });
        //
        // setTimeout(cancel, this.TIMEOUT * 1000 + 50);
    }

    private static simplePerformSolicited(
        url,
        param,
        authorization,
        callback,
        router,
        httpsendobj = HttpSend.getInstance()
    ) {
        const Reply: ResponseObject = {
            code: null,
            body: null,
            message: null,
        };
        axios
            .get('', {
                timeout: httpsendobj.COMMS_TIMEOUT * 1000,
                baseURL: url,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Authorization: authorization,
                },
                httpsAgent: new https.Agent({
                    rejectUnauthorized: false,
                }),
            })
            .then((response) => {
                Reply.body = response.data;
                Reply.message = 'success';
                Reply.code = ResponseObjectCode.SUCCESS_CODE;
                callback(Reply);
            })
            .catch((err) => {
                if (httpsendobj.st_retryCount < 5) {
                    // err.code === 'ECONNABORTED' && err.message.indexOf('timeout') !== -1 &&
                    console.log(
                        '---------------------catch fail' +
                            new Date() +
                            err.message
                    );
                    Reply.message = err.message;
                    Reply.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                    httpsendobj.st_retryCount++;
                    httpsendobj.emit(httpsendobj.st_retryCount);
                    let tmpurl = url;
                    if (httpsendobj.st_retryCount > 2) {
                        tmpurl = httpsendobj.urlArr3[1] + router;
                    }
                    if (
                        err.code === 'ECONNABORTED' &&
                        err.message.indexOf('timeout') !== -1
                    ) {
                        HttpSend.simplePerformSolicited(
                            tmpurl,
                            param,
                            authorization,
                            callback,
                            router,
                            httpsendobj
                        );
                    } else {
                        setTimeout(
                            HttpSend.simplePerformSolicited,
                            httpsendobj.COMMS_TIMEOUT * 1000,
                            tmpurl,
                            param,
                            authorization,
                            callback,
                            router,
                            httpsendobj
                        );
                    }
                } else {
                    if (err.response && err.response.data.message.length > 0) {
                        Reply.message = err.response.data.message;
                        Reply.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                    } else {
                        Reply.message =
                            httpsendobj.st_retryCount +
                            'System exception!' +
                            err.message;
                        Reply.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                    }

                    callback(Reply);
                }
            });
    }
    private constructor() {
        const urlBC_1 = terminalConfig.configs.bcConfig.BC01a_url;
        const urlBC_2 = terminalConfig.configs.bcConfig.BC02a_url;
        const urlBC_3 = terminalConfig.configs.bcConfig.BC01b_url;
        const urlBC_4 = terminalConfig.configs.bcConfig.BC02b_url;
        this.urlArr1 = [urlBC_1, urlBC_3];
        this.urlArr2 = [urlBC_2, urlBC_4];
        this.urlArr3 = [
            terminalConfig.configs.bcConfig.BCStaffList1a_url,
            terminalConfig.configs.bcConfig.BCStaffList1b_url,
        ];
        this.urlArr4 = [
            terminalConfig.configs.bcConfig.BCUpdateServ1a_url,
            terminalConfig.configs.bcConfig.BCUpdateServ1b_url,
        ];
    }
    public initKioskServer(server: KioskServer) {
        this.server = server;
    }
    public sendRecvMonitorThread(
        message: Messages,
        callback: ReqHandlerCallBack,
        retry: boolean = true
    ) {
        const msg = message.message; // byte * tsn = msg->dataPacket();
        const msgCode = msg[1];
        let bEscTxn = false;
        if (
            //  only for marksix and racing
            terminalConfig.terminalMode === Configs.Mode_TR ||
            AppConfig.environment === 'DEV'
        ) {
            // comms == 0 &&
            let cv = false;
            let bFlexi = false;
            let bQptt = false;
            let nEntry = 1;
            const tsn = msg.slice(4);
            if (
                msgCode === MessageCode.MC_PAY &&
                String.fromCharCode(tsn[0]) === 'M'
            ) {
                // bcd 'M' = 'D'
                cv = true;
            }
            // simulate cancel deposit
            if (
                msgCode === MessageCode.MC_CANCEL &&
                String.fromCharCode(tsn[0]) === 'M'
            ) {
                // bcd 'M' = 'D'
                cv = true;
            }

            //  get the message starting from Venue
            const ch = message.message.slice(2); // unsigned char *ch = msg->dataPacket()+2;
            //  check flexi bet
            if (ch.indexOf('$$') !== -1) {
                // if ( ch = _mbschr(ch, '$') ) {
                // ch++;
                // i})f ( ch[0] == '$' )
                bFlexi = true;
            }

            //  check QPTT
            if (msg[4] === PoolSymbol.QPTT.charCodeAt(0)) {
                // if ( msg->dataPacket()[4] == QPTT ) {
                bQptt = true;
                if (msg[5] === 'B'.charCodeAt(0)) {
                    //     if ( msg->dataPacket()[4+1] == 'B' ) {
                    nEntry = 2;
                }
            }

            // let rpy = ReqHandler.getInstance().SimulateReply( msgCode, cv, bFlexi, bQptt, nEntry );
            const rpy = ReqHandler.getInstance().SimulateReply(message);
            callback(rpy);
            return;
            // if( aWnd != NULL )
            //     PostMessage( aWnd,
            //                     WM_COMMS_REPLY,
            //                     (WPARAM) msgCode,
            //                     (LPARAM) rpy );
        } else {
            //  real mode, send it out to the comm
            //
            bEscTxn = false;
            // if ( theCustomer.isEscCustomer() || theCustomer.isQrcCustomer() ) {
            switch (msgCode) {
                case MessageCode.MC_ESC:
                    if (
                        msg[3] !== '1'.charCodeAt(0) && //  '1' means ESC Account Access sub code
                        // by Ethan, 20181109, do not set BIT7 for QRC account access,
                        // "15" in hex means QRC account access sub code
                        !(
                            msg[2] === '1'.charCodeAt(0) &&
                            msg[3] === '5'.charCodeAt(0)
                        )
                    ) {
                        bEscTxn = true;
                    }
                    break;
                case MessageCode.MC_ESC_TRANS:
                case MessageCode.MC_SC_BET:
                case MessageCode.MC_BET:
                case MessageCode.MC_MK6_S:
                case MessageCode.MC_MK6_M:
                case MessageCode.MC_MK6_R:
                case MessageCode.MC_MK6_Q:
                //                case MC_STATEMENT_REQ:
                case MessageCode.MC_PAY:
                case MessageCode.MC_CANCEL:
                    bEscTxn = true;
                    break;
                case MessageCode.MC_CANENQ: // By Chris Chan, 20130528, PSR2013 R0, Ticket Cancellation Control
                case MessageCode.MC_AUTHMASK: // By Chris Chan, 20130528, PSR2013 R0, Ticket Cancellation Control
                    if (
                        customer.customerState() ===
                        CustomerStatus.ACCOUNT_ACCESSED
                    ) {
                        bEscTxn = true;
                    }
                    break;
                case MessageCode.MC_WARNING:
                default:
                    bEscTxn = false;
                    break;
            }
        }
        // m_socket->sendRecv( msg->dataPacket(), msg->dataSize(),
        //                    rpyBuf, rpySz, true, bEscTxn );
        // terminalConfig.ubcMode = Configs.UBC_MODE_LOC;
        this.switchUrlByUbcMode();
        this.sendRecv(message, callback, true, bEscTxn);

        // parse reply message
        //
        // try {
        //     CScmpInPktStream * rpy = new  CScmpInPktStream( rpyBuf, rpySz );
        //     //  ensure getting the latest foregroundwindow
        //     //
        //     if( aWnd != NULL )
        //         PostMessage( aWnd,
        //                         WM_COMMS_REPLY,
        //                         (WPARAM) msgCode,
        //                         (LPARAM) rpy );
        // }

        //  other error including formatting will throw by exception
        //
        // catch ( CScmpInPktXcptn &xcptn ) {

        //     reply = new char[MAX_ERR_TEXT];
        //     xcptn.what();       // consume the exception
        //     strcpy( reply, xcptn.what() );

        //     //  ensure getting the latest foregroundwindow
        //     //
        //     if( aWnd != NULL )
        //         PostMessage( aWnd,
        //                         WM_COMMS_REPLY,
        //                         (WPARAM) MC_ERR_REPLY,
        //                         (LPARAM) reply );
        // }
    }
    public sendRecv(
        // address: string,     // send msg url
        // sendMsgText: string,              // send msg text
        // size: number,                     // send msg size
        // recvMsgText: Buffer,              // receive msg buffer
        // rcvSize: number,                  // return receive msg size
        // retry enabled or not
        // checkError: boolean = true,       // bypass error checking or not
        // bEscTxn: boolean = false,          // is ESC txn,excluding ESC account access, and including all kinds of betting
        message: Messages,
        callback: ReqHandlerCallBack,
        retry: boolean = true,
        bEscTxn: boolean = false
    ) {
        if (this.m_state !== this.READY) {
            throw new ComSvrException(
                ERROR_MSG.RID_COMSERV_ERR_REQUESTREPEAT,
                2
            );
        }
        try {
            this.m_state = this.BUSY;
            this.m_msgCount++;
            this.retryCount(0);
            this.sendMsgText = message.message;
            this.tmp_message = message;
            // let action = this.EOA;
            // let sendPkt = '';
            const message1 = this.createSendPacket(
                message.message,
                retry,
                bEscTxn
            );
            const rqst = [this.switchBCAddress(), message1, this.BC_TIMEOUT]; // =CSolicitedRequest
            // include do{...} while ( action != DONE && retry );
            HttpSend.performSolicited(
                rqst,
                this.getOrPost,
                (recvText: ByteArrayBuilder) => {
                    this.m_state = this.READY;
                    callback(recvText);
                },
                retry
            );
        } catch (err) {
            this.m_state = this.READY;
            throw err;
        }
    }

    private retryCount(i) {
        this.m_retryCount = i;
    }
    private isTestMsg(pkt: CScmpPacket) {
        let ret = false;

        if (pkt.msgCode() === Constanst.MSGCODE_TEST_TKT) {
            ret = true;
        } else {
            // test for esc test message
            // SCMPEscMsgSubCode subcode = ( SCMPEscMsgSubCode )0;

            // char    buf[3];

            // strncpy( buf, (const char *)pkt.msgText(), 2 );
            // buf[2] = 0;

            // int     hexValue;

            // // the hex value is the sub-code
            // sscanf( buf, "%x", &hexValue );
            // subcode = ( SCMPEscMsgSubCode )hexValue;
            const hex = pkt.msgText().slice(0, 2).toString('ascii'); // + '0';
            const subcode = parseInt(hex, 16);
            if (subcode === Constanst.MSGCODE_ESC_TEST) {
                ret = true;
            }
        }

        return ret;
    }
    private isBEMsg(sendMsgText: Buffer) {
        let ret = true;

        // cater for CSC Verify PIN message
        if (
            sendMsgText[1] === 0x0000007f && // Message Code = MC_ESC
            sendMsgText[2] === 0x00000030 && // Message Sub-type = 07 MSC_SUBCODE_CSC_VERIFY_PIN
            sendMsgText[3] === 0x00000037
        ) {
            ret = false;
        }
        return ret;
    }
    private createSendPacket(
        message: Buffer,
        retry: boolean,
        bEscTxn: boolean
    ) {
        const newCust = message[0] ? true : false; // config
        const msgCode = message[1];
        const ret = new CScmpPacket(message.slice(2)); // , message.length - 2);
        ret.dropAddress(terminalConfig.windowNumber);
        ret.msgCode(msgCode);
        ret.terminalId(terminalConfig.hardwareId);

        if (retry) {
            ret.msgSeqNumber(internalParam.msn);
        } else {
            ret.msgSeqNumber(0);
        }
        let flags: number;
        // switch ( 0 ) { //always SVT mode
        //     case 1 : // TERM_OPT
        //    flags = 0x40 | 0x08;
        // break;
        // case 0 : // TERM_SVT
        flags = Constanst.BIT6 | Constanst.PACKAGE_TYPE_SVT; // 0x40 | 0x18;
        // break;
        // default :
        // assert( false );
        // }
        if (
            Number.parseInt(terminalConfig.terminalMode) ===
            Constanst.LOOPBACK_MODE
        ) {
            // LOOPBACK_MODE
            flags = flags | Constanst.BIT0; // 0x01
        }

        switch (msgCode) {
            case MessageCode.MC_SIGN_ON:
            case MessageCode.MC_SIGN_OFF:
            case MessageCode.MC_CASH_IN:
            case MessageCode.MC_CASH_OUT:
            case MessageCode.MC_ERR_REPLY:
            case MessageCode.MC_SEVERE_ERR: // 0x58 88
            case MessageCode.MC_WARNING:
            case MessageCode.MC_DLL: // 79 : // MC_DLL
            case MessageCode.MC_RDT:
                flags = flags | Constanst.BIT2; // 0x4; // BIT2
                break;
            case MessageCode.MC_EFT:
            case MessageCode.MC_ESC:
                if (!newCust) {
                    flags = flags | Constanst.BIT2;
                }
                break;
            default:
                if (!newCust && retry) {
                    flags = flags | Constanst.BIT2;
                }
                break;
        }
        if (bEscTxn) {
            flags = flags | Constanst.BIT7; // 0x80; // BIT7
        }
        ret.flagByte(flags);
        ret.generateLRC();
        return ret;
    }
    private setRpcErr(err) {
        this.m_rpcErr = err;
    }
    private setBetStatus(st) {
        this.m_betStatus = st;
    }
    private betStatus(): number {
        return this.m_betStatus;
    }
    private anyRpcErr(): boolean {
        if (this.m_rpcErr !== Constanst.error_status_ok) {
            return true;
        } else {
            return false;
        }
    }
    private anyReply() {
        return this.m_rply ? true : false;
    }
    private request() {
        return this.m_rqst;
    }
    public fnIncMSN() {
        internalParam.msn = internalParam.msn + 1;
        logger.info('internalParam.msn = ' + internalParam.msn);
        if (internalParam.msn >= Constanst.MSN_MAX) {
            internalParam.msn = 0;
        }
    }
    private getRpcErr() {
        return this.m_rpcErr;
    }
    private doRequest(responseData) {
        console.log('responseDatastr=' + responseData);
        logger.info('response success begin---- ');
        logger.info('responseDatastr=' + JSON.stringify(responseData));
        logger.info('newCustomerFlag=' + customer.newCustomerFlag);

        const responseObj = responseData;
        const errorStatus = Number.parseInt(responseObj.errorstatus);
        const betStatus = Number.parseInt(responseObj.betstatus);
        let replyBody = JSON.parse(responseObj.replybody);
        replyBody = Buffer.from(replyBody);

        if (replyBody === '' || replyBody === undefined || replyBody === null) {
            return;
        }

        const rplyMsg = replyBody; // response.data.rplyMsg
        logger.info('receive = ' + rplyMsg);
        logger.info('length = ' + rplyMsg.length);
        let bb = Array.prototype.map
            .call(rplyMsg, (d) => d.toString(16))
            .join(' ');
        logger.info(bb);
        this.setRpcErr(errorStatus);
        // this.setRpcErr(Constanst.error_status_ok);
        this.m_rply = null;
        this.setBetStatus(Constanst.NO_MASH);
        if (!this.anyRpcErr()) {
            this.setBetStatus(betStatus);
            if (errorStatus === Constanst.error_status_ok) {
                // rplySize > 0 &&
                this.m_rply = new CScmpPacket();
                this.m_rply.updateFromRpcReply(rplyMsg); // , rplySize
            }
        }
    }
    private performSolicitedBack() {
        let ret = Constanst.EOA;
        if (this.m_betStatus === Constanst.SUCCESS) {
            if (this.m_rply) {
                console.log(
                    'this.m_rply.verifyLRC()=' + this.m_rply.verifyLRC()
                );
            }
            // console.log('this.m_rply.msgSeqNumber()=' + this.m_rply.msgSeqNumber());
            // console.log('terminalConfig.configs.internalParam.msn=' + terminalConfig.configs.internalParam.msn);
            // console.log('this.m_rply.msgCode()=' + this.m_rply.msgCode());
            // console.log('this.m_rqst.msgCode()=' + this.m_rqst.msgCode());
            if (this.isTestMsg(this.request())) {
                ret = Constanst.DONE;
            } else if (
                this.m_rply &&
                this.m_rply.sizeForRpc() > 0 &&
                this.m_rply.verifyLRC() &&
                this.m_rply.msgSeqNumber() === internalParam.msn
            ) {
                if (
                    this.m_rply.msgCode() === this.m_rqst.msgCode() || // rqst = this, request return m_rqst
                    this.m_rply.msgCode() === Constanst.MSGCODE_ERROR_REPLY
                ) {
                    ret = Constanst.DONE;
                } else {
                    ret = Constanst.RETRY;
                }
            } else {
                ret = Constanst.RETRY;
            }
        } else {
            if (this.anyRpcErr()) {
                // #if defined( __OS2__ )
                //         if ( rqst.getRpcErr() == rpc_s_wrong_boot_time )
                // #elif defined( _WIN32 )
                if (this.getRpcErr() === Constanst.RPC_S_CALL_FAILED_DNE) {
                    // #endif
                    ret = Constanst.RESET_RETRY;
                } else {
                    ret = Constanst.FAILOVER;
                }
            } else {
                switch (this.betStatus()) {
                    case Constanst.SUCCESS:
                        ret = Constanst.DONE;
                        break;
                    case Constanst.NO_MASH:
                    case Constanst.INTERNAL_MSG_ERROR:
                        ret = Constanst.FAILOVER;
                        break;

                    case Constanst.TIMEOUT:
                        ret = Constanst.RETRY;
                        break;

                    case Constanst.INVALID_LINE_NUMBER:
                    case Constanst.ESC_QUOTA_EXCEEDED:
                    case Constanst.DUPLICATE_MSG:
                        // 				postEvent( WM_COMM_ERROR, INVALID_MESSAGE, 0 );
                        ret = Constanst.FAILOVER;
                        break;

                    // those should never happen, BC will never return
                    // such code to BT
                    //
                    case Constanst.UNKNOWN_CLIENT:
                    case Constanst.REGISTER_ERROR:
                    case Constanst.INVALID_BE_ID:
                    case Constanst.BE_COMMS_ERROR:
                    case Constanst.DESECURE_ERROR:
                    case Constanst.SECURE_ERROR:
                        // 				postEvent( WM_COMM_ERROR, INVALID_MESSAGE, 0 );
                        ret = Constanst.FAILOVER;
                        break;

                    default:
                        assert(false);
                }
            }
        }
        return ret;
    }
    public isBcListening(bc: BC_Type, callback: ReqHandlerCallBack) {
        let binding = 0;
        let url;
        let url1;
        const windowNum =
            Number.parseInt(terminalConfig.windowNumber) % 2 === 0
                ? true
                : false;
        let urlArr = this.urlArr1;
        if (windowNum) {
            urlArr = this.urlArr2;
        }
        switch (bc) {
            case BC_Type.NO_CONNECTION:
            case BC_Type.BC_A:
                binding = 1; // m_bcA
                url = urlArr[0];
                url1 = urlArr[1];
                break;
            case BC_Type.BC_B:
                binding = 2; // m_bcB
                url = urlArr[1];
                url1 = urlArr[0];
                break;
            default:
                binding = 0;
                break;
        }
        if (binding) {
            this.doRequestTest(url, callback, bc, url1);
        }
    }
    private doRequestTest(url, callback, bc, url1) {
        const Reply: ResponseObject = {
            code: null,
            body: null,
            message: null,
        };
        axios
            .post('', '', {
                timeout: this.COMMS_TIMEOUT * 1000,
                baseURL: url,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                httpsAgent: new https.Agent({
                    rejectUnauthorized: false,
                }),
            })
            .then((response) => {
                Reply.body = response.data;
                Reply.message = 'request success';
                Reply.code = ResponseObjectCode.SUCCESS_CODE;
                callback(Reply);
            })
            .catch((err) => {
                if (bc === BC_Type.NO_CONNECTION) {
                    this.doRequestTest(url1, callback, BC_Type.BC_B, url);
                } else {
                    if (
                        err.code === 'ECONNABORTED' &&
                        err.message.indexOf('timeout') !== -1
                    ) {
                        Reply.message = err.message;
                        Reply.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                    } else {
                        Reply.message = 'System exception!' + err.message;
                        Reply.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                    }
                    callback(Reply);
                }
            });
    }
    private switchBCAddress() {
        const windowNum =
            Number.parseInt(terminalConfig.windowNumber) % 2 === 0
                ? true
                : false;
        let urlArr = this.urlArr1; // this.urlArr1;
        if (windowNum) {
            urlArr = this.urlArr2; // this.urlArr2;
        }

        let retUrl = '';
        // switch BC
        if (customer.newCustomerFlag && this.m_retryCount === 0) {
            retUrl = urlArr[0];
        } else if (this.m_retryCount % 3 === 0 && this.m_retryCount !== 0) {
            if (this.address !== urlArr[0]) {
                retUrl = urlArr[0];
            } else {
                retUrl = urlArr[1];
            }
        } else {
            if (this.address === null || this.address.length === 0) {
                retUrl = urlArr[0];
            } else {
                retUrl = this.address;
            }
        }

        this.address = retUrl;
        // console.log("\nretUrl = " + retUrl + "customer.newCustomerFlag=" + customer.newCustomerFlag);
        return this.address;
    }

    // emit retryCount to frontend
    private emit(retryCount: Number, event = 'retryCount_Event') {
        this.server.emitEvent(event, retryCount);
    }
    public simpleSendRecv(router, param, authorization, callback) {
        this.st_retryCount = 0;
        HttpSend.simplePerformSolicited(
            this.urlArr3[0] + router,
            param,
            authorization,
            callback,
            router
        );
    }
    public setTestMode() {
        this.getOrPost = 'get';
        terminalConfig.terminalMode = 'ONLINE';
        this.urlArr1 = [
            'http://localhost:5005/ubc/sendToBCA',
            'http://localhost:5005/ubc/sendToBCB',
        ];
        this.urlArr2 = [
            'http://localhost:5005/ubc/sendToBCB',
            'http://localhost:5005/ubc/sendToBCA',
        ];
    }

    public switchUrlByUbcMode() {
        if (terminalConfig.ubcMode === Configs.UBC_MODE_LOC) {
            this.urlArr1 = [
                'http://localhost:5005/ubc/sendToBCA',
                'http://localhost:5005/ubc/sendToBCB',
            ];
            this.urlArr2 = [
                'http://localhost:5005/ubc/sendToBCB',
                'http://localhost:5005/ubc/sendToBCA',
            ];
        } else {
            const urlBC_1 = terminalConfig.configs.bcConfig.BC01a_url;
            const urlBC_2 = terminalConfig.configs.bcConfig.BC02a_url;
            const urlBC_3 = terminalConfig.configs.bcConfig.BC01b_url;
            const urlBC_4 = terminalConfig.configs.bcConfig.BC02b_url;
            this.urlArr1 = [urlBC_1, urlBC_3];
            this.urlArr2 = [urlBC_2, urlBC_4];
        }
    }

    public setBcError(err: BCAST_ERROR) {
        this.bcError = err;
    }

    /**by Eric add  20200518 */
    public unsolicitedSend(message: Messages, callback: ReqHandlerCallBack) {
        const rqst = this.createSendPacket(message.message, false, false);

        let bb: Buffer = rqst.dataForRpc();
        logger.info('unsolicitedSend request begin---- time=' + new Date());
        logger.info('send = ' + bb);
        logger.info('length = ' + bb.length);
        bb = Array.prototype.map.call(bb, (d) => d.toString(16)).join(' ');
        logger.info(bb);

        let axiotmp;
        const wimntemp = Number.parseInt(terminalConfig.windowNumber);
        const win: Number = new Number(wimntemp << 24);

        if (terminalConfig.terminalMode === Configs.Mode_TR) {
            callback('success!!!');
        } else {
            let unsolicitedUrl = '';
            if (
                this.address !== null &&
                this.address !== undefined &&
                this.address.length > 0
            ) {
                unsolicitedUrl = this.address;
            } else {
                // use default url by windownumber
                unsolicitedUrl =
                    Number.parseInt(terminalConfig.windowNumber) % 2 === 0
                        ? this.urlArr2[0]
                        : this.urlArr1[0];
            }
            axiotmp = axios.post('', rqst.dataForRpc(), {
                timeout: 2 * 1000,
                baseURL:
                    unsolicitedUrl +
                    '/sendNoWait?window=' +
                    win +
                    '&branch=' +
                    terminalConfig.branchNumber,
                headers: {
                    'Content-Type':
                        'application/x-www-form-urlencoded;charset=UTF-8',
                },
                httpsAgent: new https.Agent({
                    rejectUnauthorized: false,
                }),
            });

            axiotmp
                .then((response) => {
                    callback('success!!!');
                    logger.info('unsolicitedSend success!!!');
                })
                .catch((err) => {
                    callback(null);
                    logger.info('unsolicitedSend error:' + err.message);
                });
        }

        // CUnsolicitedRequest *rqst;

        // do {
        //     m_enable->wait();

        //     rqst = (CUnsolicitedRequest *)m_rqstQ->get();

        //     if ( rqst ) {

        //         m_msgCount++;

        //         CBcBinding    *current = currentBinding();

        // 		{  // since the binding are shared among thread, must make
        //             // sure that the binding is mutually accessed
        //             CJMutexLock lock( *current );
        // 			rqst->setHandle( *current );
        // 			rqst->setIpAddress( *m_ipAddress );
        // 			rqst->doRequest();
        // 		}

        //         Action action = evalBetRequest( *rqst );

        //         DELETE_DEBUG( rqst );

        //         if ( action == FAILOVER ) {
        //             switchBcFrom( current );
        //         }
        //         else if ( action == RESET_RETRY ) {
        //             current->resetBinding();
        //             current->setComTimeout( COMMS_TIMEOUT );
        //         }
        //     }

        // 	chkLineStatus();
        // } while ( rqst );
    }

    public async getFromServer(url) {
        const getRequests = [
            axios.get(this.urlArr4[0] + url, { timeout: 5000 }),
            axios.get(this.urlArr4[1] + url, { timeout: 5000 }),
        ];

        try {
            let res = await Promise.all(
                getRequests.map((p) =>
                    p.catch((e) => logger.error('request server time failed!'))
                )
            );
            res = res.filter((val) => val);

            if (res.length > 0) {
                return res[0] as any;
            } else {
                const errRes = {
                    code: 400,
                    body: null,
                    message: 'request server time failed, no server response.',
                };

                return errRes;
            }
        } catch (error) {
            logger.error('request all server time failed!');
        }
    }
}
