const io = require('socket.io-client');
import { terminalConfig } from '../../share/main-proc/terminal-config/terminal-config';
import { CScmpPacket } from './CSCMPPKT';
import { Constanst, SCMPMsgCode } from './Constant';
import { ByteArrayBuilder } from '../util/byteArrayBuilder';
import { logger } from '../../share/utils/logs';
import { KioskServer } from '../../share/utils/server';
import { ServerPorts } from '../../share/main-proc/processes/ports';
import { UbcBroadcastEvents } from '../../share/protocols/kiosk-api-event';
import { ReplyProcessor } from '../util/replyProcessor';
import {
    MessageCode,
    BCAST_ERROR,
    Constansts,
} from '../../share/models/comm-serv/CommonDefs';
import { HttpSend } from './HttpSend';
export class BCEventSocketIo {
    //   private apiBaseAddress = CommonAPIValue.apiBaseAddress;
    private static m_instance: BCEventSocketIo;
    protected socketBC1 = null;
    protected socketBC2 = null;
    private server: KioskServer;
    public prePkt = new CScmpPacket();
    public cnt = 0;
    public dupReceived = true;
    //   private countdown: CountingService = null;
    //   private errorSev: ErrorResolveService = null;
    public static getInstance(): BCEventSocketIo {
        if (!this.m_instance) {
            this.m_instance = new BCEventSocketIo();
        }
        return this.m_instance;
    }
    public initKioskServer(server: KioskServer) {
        this.server = server;
    }
    private constructor() {
        const windowNum =
            Number.parseInt(terminalConfig.windowNumber) % 2 === 0
                ? true
                : false;
        let url1 = '';
        let url2 = '';
        if (windowNum) {
            url1 = terminalConfig.configs.bcConfig.BC02a_url;
            url2 = terminalConfig.configs.bcConfig.BC02b_url;
        } else {
            url1 = terminalConfig.configs.bcConfig.BC01a_url;
            url2 = terminalConfig.configs.bcConfig.BC01b_url;
        }
        let urltmp1 = url1.split(':');
        let urltmp2 = url2.split(':');

        url1 =
            urltmp1[0] + ':' + urltmp1[1] + ':' + ServerPorts.BroadcastServer; //  + '/?token=rlogin_' + terminalConfig.branchNumber +
        // '_' + terminalConfig.windowNumber;
        url2 =
            urltmp2[0] + ':' + urltmp2[1] + ':' + ServerPorts.BroadcastServer; //  + '/?token=rlogin_' + terminalConfig.branchNumber +
        // '_' + terminalConfig.windowNumber;
        console.log('\n url1=' + url1);
        console.log('\n url2=' + url2);
        this.socketBC1 = io(url1);
        //this.socketBC2 = io(url2);

        this.autoLoginEvent();
    }
    private autoLoginEvent() {
        this.socketBC1.on('connect', (msg) => {
            console.log('Aget the bc msg =' + msg);
        });
        // this.socketBC2.on('connect', msg => {
        //   console.log('Bget the bc msg =' + msg);
        // });
        // 2020 06 15 new
        this.socketBC1.on(UbcBroadcastEvents.BROADCAST_MSG, (msg) => {
            try {
                const rplyMsg = Buffer.from(msg, 'utf8'); // response.data.rplyMsg
                logger.info('NewBC1broadcast_receive = ' + rplyMsg);
                logger.info('NewBC1broadcast_length = ' + rplyMsg.length);
                let bb = Array.prototype.map
                    .call(rplyMsg, (d) => d.toString(16))
                    .join(' ');
                logger.info('NewBC1broadcast = ' + bb);
                this.broadcast(msg);
            } catch (err) {
                logger.info(
                    'UBC_BROADCAST_MSG try exception err.message = ' +
                        err.message
                );
            }
        });
        // this.socketBC2.on(UbcBroadcastEvents.BROADCAST_MSG, msg => {
        //   const rplyMsg = Buffer.from(msg, 'utf8'); // response.data.rplyMsg
        //   logger.info('NewBC2broadcast_receive = ' + rplyMsg);
        //   logger.info('NewBC2broadcast_length = ' + rplyMsg.length);
        //   let bb = Array.prototype.map.call(rplyMsg, (d => d.toString(16))).join(' ');
        //   logger.info('NewBC2broadcast = ' + bb);
        //   this.broadcast(msg);
        // });
        this.socketBC1.on(
            'rlogin_' +
                terminalConfig.branchNumber +
                '_' +
                terminalConfig.windowNumber,
            (msg) => {
                // const rplyMsg = Buffer.from(msg, 'utf8'); // response.data.rplyMsg
                // logger.info('BC1broadcast_receive = ' + rplyMsg);
                // logger.info('BC1broadcast_length = ' + rplyMsg.length);
                // let bb = Array.prototype.map.call(rplyMsg, (d => d.toString(16))).join(' ');
                // logger.info('BC1broadcast = ' + bb);
                // this.broadcast(msg);
            }
        );
        // this.socketBC2.on('rlogin_' + terminalConfig.branchNumber +
        //   '_' + terminalConfig.windowNumber, msg => {
        //     const rplyMsg = Buffer.from(msg, 'utf8'); // response.data.rplyMsg
        //     logger.info('BC2broadcast_receive = ' + rplyMsg);
        //     logger.info('BC2broadcast_length = ' + rplyMsg.length);
        //     let bb = Array.prototype.map.call(rplyMsg, (d => d.toString(16))).join(' ');
        //     logger.info('BC2broadcast = ' + bb);
        //     this.broadcast(msg);
        //   });
    }

    private broadcast(msg: string) {
        // CJMutexLock lock( gRpcCommsLock );

        // vc8
        //static cnt = 0;
        //static dupReceived = true;

        // invalid message length
        if (msg === null || msg.length <= 7) {
            // at least have: drop address, stx, term id (2bytes)
            // msn (2 bytes), msg code
            return;
        }

        const curPkt = new CScmpPacket();

        curPkt.updateFromRpcReply(Buffer.from(msg));

        let processed = false;

        if (
            curPkt.dropAddress() !== Constanst.BCAST_DROP_ADD &&
            curPkt.dropAddress() !== parseInt(terminalConfig.windowNumber, 10)
        ) {
            return; // drop address doesn't match this terminal
        }

        // if packet is not empty and the message is same as prev. message
        if (
            !this.dupReceived &&
            curPkt.sizeForRpc() > 0 &&
            this.prePkt.sizeForRpc() === curPkt.sizeForRpc() &&
            !Buffer.compare(this.prePkt.dataForRpc(), curPkt.dataForRpc())
        ) {
            this.dupReceived = true;
        } else {
            // if (gRpcComms) {
            //   gRpcComms -> receiveBcast(curPkt);
            // }
            this.receiveBcast(curPkt);
            processed = true;
            this.dupReceived = false;
        }

        if (processed) {
            this.prePkt.updateFromRpcReply(Buffer.from(msg));
        }
    }
    // // for long term event listening, need to be removed if no longer use
    // public onServerEvent(eventName: string, callback) {
    //   return this.socket.on(eventName, callback);
    // }

    // protected removeEvent(eventName: string) {
    //   // this.removeAllListeners(eventName);
    // }
    public forThisTerminal(
        scmpData: Buffer,
        use3digitCtr_2digitWin = false
    ): boolean {
        //  If the terminal is not initialized then don't respond to broadcasts
        //
        if (
            parseInt(terminalConfig.windowNumber, 10) === 0 ||
            parseInt(terminalConfig.branchNumber, 10) === 0
        ) {
            return false;
        }

        //  Read in the window and centre numbers.curPkt
        //
        let window = Buffer.alloc(3);
        let centre = Buffer.alloc(4);
        // let centreSize = 0;
        // let windowSize = 0;
        let windowNum = 0;
        let centreNum = 0;

        // new 4 digit center number / 3 digit window number format
        //
        // windowSize = 3;
        // centreSize = 4;
        // int i;
        // for ( i=0; i < centreSize; i++ ) {
        //     centre[ i ] = ( *scmpData++ & 0xf ) + '0';
        //     if ( centre[ i ] > '9' ) {
        //         return false;               // invalid data.
        //     }
        // }
        // centre[ i ] = 0;
        // scmpData++;                         // skip '/'
        // for ( i=0; i < windowSize; i++ ) {
        //     window[ i ] = ( *scmpData++ & 0xf ) + '0';
        //     if ( window[ i ] > '9' ) {
        //         return false;               // invalid data.
        //     }
        // }
        let i;
        for (i = 0; i < centre.length; i++) {
            centre[i] = (scmpData[i] & 0xf) + '0'.charCodeAt(0);
            if (centre[i] > '9'.charCodeAt(0)) {
                return false; // invalid data.
            }
        }
        // centre[i] = 0;

        scmpData = scmpData.slice(i + 1); // skip '/'
        for (i = 0; i < window.length; i++) {
            window[i] = (scmpData[i] & 0xf) + '0'.charCodeAt(0);
            if (window[i] > '9'.charCodeAt(0)) {
                return false; // invalid data.
            }
        }
        // window[i] = 0;

        windowNum = parseInt(ByteArrayBuilder.BytesToString(window), 10);
        centreNum = parseInt(ByteArrayBuilder.BytesToString(centre), 10);

        //  Check if the centre number is a broadcast,
        //  The centre number matches theTerminal Centre number &
        //  the window number matches or is a broadcast.
        //
        if (centreNum === 0) {
            return true; // broadcast to all centres
        }

        if (centreNum === parseInt(terminalConfig.branchNumber, 10)) {
            if (
                windowNum === 0 || // broadcast to all windows.
                parseInt(terminalConfig.windowNumber, 10) === windowNum
            ) {
                return true;
            }
        }

        return false; // not for this terminal.
    }

    public receiveBcast(rcvPacket: CScmpPacket) {
        let rcvSize = 0;
        const rcvText = rcvPacket.copyMsgText();

        //  Process any unsolicited message.
        //
        switch (rcvPacket.msgCode()) {
            case MessageCode.MC_RDT: {
                if (!rcvPacket.verifyLRC()) {
                    logger.info(
                        'receiveBcast  MessageCode.MC_RDT verifyLRC error!'
                    );
                    return;
                } else {
                    const raceDayTable = rcvText.slice(1, rcvText.length);
                    this.server.emitEvent(
                        Constansts.BROADCAST_EVENT_RDT,
                        raceDayTable
                    );
                    logger.info(
                        'receiveBcast  MessageCode.MC_RDT ' + raceDayTable
                    );
                }
                break;
            }

            case MessageCode.MC_AUTO_SON:
                {
                    if (!this.forThisTerminal(rcvText.slice(8))) {
                        logger.info(
                            'receiveBcast  MessageCode.MC_AUTO_SON forThisTerminal error!'
                        );
                        return;
                    } else {
                        const staff = rcvText.slice(1, 7);
                        const staff_str = ReplyProcessor.convertBcd2Str(
                            staff.toString()
                        );
                        this.server.emitEvent(
                            Constansts.BROADCAST_EVENT_AUTO_SON,
                            staff_str
                        );
                        logger.info(
                            'receiveBcast  MessageCode.MC_AUTO_SON ' + staff_str
                        );
                    }
                }
                break;
            case MessageCode.MC_AUTO_SOFF:
                {
                    if (!this.forThisTerminal(rcvText.slice(1))) {
                        logger.info(
                            'receiveBcast  MessageCode.MC_AUTO_SOFF forThisTerminal error!'
                        );
                        return;
                    } else {
                        this.server.emitEvent(
                            Constansts.BROADCAST_EVENT_AUTO_SOFF,
                            ''
                        );
                        logger.info('receiveBcast  MessageCode.MC_AUTO_SOFF');
                    }
                }
                break;
            case MessageCode.MC_BROADCAST:
                {
                    const error = rcvText.slice(1, 4);
                    if (error.toString() === 'MSN') {
                        HttpSend.getInstance().setBcError(
                            BCAST_ERROR.MSN_ERROR
                        );
                        this.server.emitEvent(
                            Constansts.BROADCAST_EVENT_MSN_ERROR,
                            ''
                        );
                        logger.info(
                            'receiveBcast  MessageCode.MC_BROADCAST BCAST_ERROR.MSN_ERROR'
                        );
                    } else if (error.toString() === 'RET') {
                        HttpSend.getInstance().setBcError(
                            BCAST_ERROR.RETRANS_ERROR
                        );
                        this.server.emitEvent(
                            Constansts.BROADCAST_EVENT_RETRANS_ERROR,
                            ''
                        );
                        logger.info(
                            'receiveBcast  MessageCode.MC_BROADCAST BCAST_ERROR.RETRANS_ERROR'
                        );
                    } else {
                        logger.info('receiveBcast  MessageCode.MC_BROADCAST ');
                    }
                }
                break;
            case MessageCode.MC_EFT:
                {
                    const eftMessage = rcvText.slice(1, rcvText.length + 1);
                    logger.info('receiveBcast  MessageCode.MC_EFT ');
                    return;
                }
                break;
            case MessageCode.MC_BET_GEN:
                {
                    logger.info('receiveBcast  MessageCode.MC_BET_GEN ');
                    return;
                }
                break;
            default:
                //  Not a "broadcast" message to the terminal, so just discard it.
                return;
        }
    }
}
