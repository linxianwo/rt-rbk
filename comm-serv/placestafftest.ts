import { KioskServer } from '../share/utils/server';
import { BettingServ } from './bettingServ';
import {
    Messages,
    MSG_SIGN_ON_REPLY,
    MSG_STAFF_AUTH_REPLY,
    MSG_OPT_FUNC_REPLY,
    MSG_SIGN_OFF_REPLY,
    MSG_BET_REPLY,
    MSG_SIGN_ON,
} from '../share/models/comm-serv/Messages';
import { RacingBetObject } from '../share/models/comm-serv/Racing/RacingBetObject';
import {
    RacingMeeting,
    RaceDayCode,
    RaceNo,
    QPQTT_TYPE,
} from '../share/models/comm-serv/Racing/Enums';
import { PoolSymbol } from '../share/models/comm-serv/Racing/PoolType';
import { Leg } from '../share/models/comm-serv/Racing/Leg';
import { StaffServ } from './staffServ';
import { terminalConfig } from '../share/main-proc/terminal-config/terminal-config';
import { HttpSend } from './httpsend/HttpSend';
import {
    ResponseObject,
    ResponseObjectCode,
} from '../share/models/response-common';
import { ReplyProcessor } from './util/replyProcessor';
import { ByteArrayBuilder } from './util/byteArrayBuilder';
import { logger } from '../share/utils/logs';
import {
    FootballBetObject,
    SCBET_TYPE,
    ODDS_INDICATION,
    Game,
    Pool,
    ScDayCode,
    Context,
    SHomeAwayDraw,
    HAD_Result,
    SHandicap,
} from '../share/models/comm-serv/Football/FootballBetObject';
import { PCODE, ALLUP_TYPE } from '../share/models/comm-serv/CommonDefs';
export class PlaceStaffTest {
    // region Placestaff
    constructor(public server: KioskServer) {
        // HttpSend.getInstance().setTestMode();
    }
    private isEmpty(obj: string) {
        if (typeof obj === 'undefined' || obj === null || obj === '') {
            return true;
        } else {
            return false;
        }
    }

    public init() {
        // [TestCategory("BettingServ")]
        this.server.addAppApi('/staffserv/test/SignOn', (req, res, next) => {
            // region Bet object
            const send = new MSG_SIGN_ON();
            send.staffId = '000000';
            send.staffPin = '999999';

            // region Reply object

            let reply: MSG_SIGN_ON_REPLY = null;

            const message = new Messages();
            //   message.betObj = bet;
            message.message = Buffer.from([0]);
            message.messageCode = 0;

            StaffServ.Instance.SignOn(send, (betreply) => {
                reply = betreply;
                if (
                    this.isEmpty(reply.errorText) &&
                    reply.numOfSignOn === 10 &&
                    reply.replyTime === '10:00' &&
                    reply.replyDate === '06JAN82' &&
                    reply.returnCode === 0 &&
                    reply.daysB4Exp === 0
                ) {
                    console.log('SIGN_ON OK!');
                    res.send(reply);
                } else {
                    console.log('SIGN_ON FAIL!');
                    res.send(reply);
                }

                // endregion
            });
        });

        this.server.addAppApi('/staffserv/test/SignOff', (req, res, next) => {
            // region Bet object
            const send = true;

            // region Reply object

            let reply: MSG_SIGN_OFF_REPLY = null;

            const message = new Messages();
            //   message.betObj = bet;
            message.message = Buffer.from([0]);
            message.messageCode = 0;

            StaffServ.Instance.SignOff(send, (betreply) => {
                reply = betreply;
                if (
                    this.isEmpty(reply.errorText) &&
                    reply.replyTime === '23:00' &&
                    reply.cashIn === 0 &&
                    reply.cashOut === 0 &&
                    reply.sells === 0 &&
                    reply.cancel === 0 &&
                    reply.pay === 0 &&
                    reply.esc === 0 &&
                    reply.balance === 0 &&
                    reply.replyDate === '06JAN82'
                ) {
                    console.log('SIGN_OFF OK!');
                    res.send(reply);
                } else {
                    console.log('SIGN_OFF FAIL!');
                    res.send(reply);
                }

                // endregion
            });
        });

        this.server.addAppApi(
            '/staffserv/test/ChangePassword',
            (req, res, next) => {
                // region Bet object
                const staffId = '000000';
                const oldPassword = '999999';
                const newPassword = '666666';

                // region Reply object

                let reply: MSG_OPT_FUNC_REPLY = null;

                const message = new Messages();
                //   message.betObj = bet;
                message.message = Buffer.from([0]);
                message.messageCode = 0;

                StaffServ.Instance.ChangePassword(
                    {
                        staffId: staffId,
                        oldPassword: oldPassword,
                        newPassword: newPassword,
                    },
                    (betreply) => {
                        reply = betreply;
                        if (this.isEmpty(reply.errorText)) {
                            console.log('ChangePassword OK!');
                            res.send(reply);
                        } else {
                            console.log('ChangePassword FAIL!');
                            res.send(reply);
                        }

                        // endregion
                    }
                );
            }
        );
        this.server.addAppApi(
            '/staffserv/test/GetStaffAuthority',
            (req, res, next) => {
                // region Bet object
                const staffId = '000000';
                const password = '999999';
                const rqtPurpose = 1;
                // region Reply object

                let reply: MSG_STAFF_AUTH_REPLY = null;

                const message = new Messages();
                //   message.betObj = bet;
                message.message = Buffer.from([0]);
                message.messageCode = 0;

                StaffServ.Instance.GetStaffAuthority(
                    {
                        staffId: staffId,
                        password: password,
                        rqtPurpose: rqtPurpose,
                    },
                    (betreply) => {
                        reply = betreply;
                        if (this.isEmpty(reply.errorText)) {
                            console.log('GetStaffAuthority OK!');
                            res.send(reply);
                        } else {
                            console.log('GetStaffAuthority FAIL!');
                            res.send(reply);
                        }

                        // endregion
                    }
                );
            }
        );

        this.server.addAppApi('/test/subscript/:index', (req, res, next) => {
            //server.addAppApi('/test/subscript/:index', (req, res) => {
            const index = req.params.index;
            let message: string;
            terminalConfig.customerLang = true;
            switch (index) {
                case '1': {
                    message = terminalConfig.customerLang
                        ? 'msn系統異常，繼續嘗試中'
                        : 'MSN ERROR RELOAD. Retrying transaction';
                    break;
                }
                case '2': {
                    message = terminalConfig.customerLang
                        ? '連線錯誤，繼續嘗試中'
                        : 'RETRANSMISSION ERROR, Retrying transaction';
                    break;
                }
                case '3': {
                    message = terminalConfig.customerLang
                        ? '操作在進行中，請稍候'
                        : 'Transaction in progress, please wait...';
                    break;
                }
                case '4': {
                    // tslint:disable-next-line: max-line-length
                    message = terminalConfig.customerLang
                        ? '操作在進行中，請稍候 -R' +
                          parseInt('' + Math.random() * 10)
                        : 'Transaction in progress, please wait...-R' +
                          parseInt('' + Math.random() * 10);
                    break;
                }
            }
            this.server.emitEvent('retryCount_Event', message);
            const Reply = {
                code: 0,
                body: message,
                message: 'success',
            };
            res.send(Reply);
        });
        this.server.addAppApi('/test/httpsendretry/', (req, res) => {
            let message: string;

            message = 'msn系統異常，繼續嘗試中';

            // this.server.emitEvent('retryCount_Event', message);

            //  this.server.emitEvent('message', message);

            // console.log('httpsendretrymessage=' + message);
            // setTimeout(()=>{

            //     this.server.onEvent('retryReply_Event', message1 => {
            //         console.log('message=' + message1);
            //         this.server.emitEvent('retryCount_Event', 'haha surprise');
            //         res.send(message1);
            //     });
            // },3000);
            console.log('message = ' + message);
            const Reply = {
                code: 1,
                body: message,
                message: 'success',
            };
            this.server.m_fuc = (msg) => {
                this.server.emitEvent('retryReply_Event', message + msg);

                console.log('e = ' + msg);

                Reply.body = message + msg + '2';
                res.send(Reply);
            };
        });

        this.server.addAppApi('/simulate/httpstest/:nothing?', (req, res) => {
            const a: Messages = {
                message: Buffer.from('1234567'),
                messageCode: 58,
                betObj: null,
            };
            HttpSend.getInstance().sendRecvMonitorThread(
                a,
                (resp) => {
                    res.send(resp);
                },
                true
            );
        });

        this.server.addAppApi('/sleepasyn/:second?', (req, res) => {
            let second: number = Number.parseInt(req.params.second, 10);
            if (!second) {
                second = 16;
            }
            setTimeout(
                (resp) => {
                    res.send(resp);
                },
                second * 1000,
                { res: 'sleep ' + second + ' second intest sleepasyn' }
            );
            // const Reply = {
            //     code: 1,
            //     body: "message",
            //     message: 'success'
            // };
            // res.send(Reply);
        });
        this.server.addAppApi('/sleepasyn1/:second?', (req, res) => {
            let second: number = Number.parseInt(req.params.second, 10);
            if (!second) {
                second = 16;
            }
            setTimeout(
                (resp) => {
                    res.send(resp);
                },
                second * 1000,
                { res: 'sleep ' + second + ' second intest sleepasyn' }
            );
            // const Reply = {
            //     code: 1,
            //     body: "message",
            //     message: 'success'
            // };
            // res.send(Reply);
        });
        this.server.addAppApi('/simulate/signoff/:no?', (req, res) => {
            const reply_msg = new ByteArrayBuilder();
            reply_msg.Append(
                Buffer.from('23:00/06JAN82/$@.@@$@.@@$@.@@$@.@@$@.@@$@.@@$@.@@')
            );
            //   ReplyProcessor.ProcessSignOffReply(reply_msg, signOffReply);
            // 4:telling the viewModel bet reply
            res.send(reply_msg);
        });
        // this.server.m_fuc = (msg) => {
        //     this.server.m_fuc = null;
        //     console.log("testbegin subscript");
        //     if (msg === 'testbegin') {
        //         HttpSend.getInstance().setTestMode();
        //     }
        // };
        this.server.addAppApi('/test/msn', (req, res) => {
            let res1 = 'begin---';
            res1 +=
                '1terminalConfig.configs.internalParam.msn = ' +
                terminalConfig.configs.internalParam.msn++;
            res1 +=
                ',terminalConfig.configs.internalParam.msn++ = ' +
                terminalConfig.configs.internalParam.msn;
            res1 += '.terminalConfig.msn = ' + terminalConfig.msn++;

            res1 += ',terminalConfig.msn++ = ' + terminalConfig.msn;
            res.send(res1);
        });
        this.server.addAppApi('/test/hardwarid', (req, res) => {
            let id = '0B17';
            let hwid = parseInt(id, 16);

            let id1: number;
            let id2: number;
            let temp: number;
            /*
             *  store bits 0-5
             */
            id1 = hwid & 0x3f;
            temp = hwid >> 6;
            id2 = temp & 0x3f;

            /*
             *  Set bit 6
             */
            if (!(hwid & 0x1000)) {
                id1 = id1 | 0x40;
            }
            if (!(hwid & 0x2000)) {
                id2 = id2 | 0x40;
            }
            let term_id = id1 & 0xff;
            term_id |= id2 << 8;

            let bb = Buffer.from('AAAAAAAAA');
            bb[3] = term_id;
            bb[4] = term_id >> 8;
            let bb1 = Array.prototype.map
                .call(bb, (d) => d.toString(16))
                .join(' ');
            let res1 = '';

            res.send(bb1);
        });
        this.server.addAppApi('/test/had/', (req, res) => {
            let o = new FootballBetObject();
            let pcode = PCODE.PC_HAD; // input  pool玩法

            o.scBetType = SCBET_TYPE.MATCH_BET; // input  下注类型区分Game和TGame
            o.allUp.leg = 3; // 过关数
            o.allUp.combination = 1; // 组合数
            o.unitBet = 10000; // input $100.00单位：分
            o.bInPlayBet = false; // input 是否inplay
            o.allUpType = ALLUP_TYPE.NORMAL_ALLUP; // NON_ALLUP单注，NORMAL_ALLUP过关
            o.oddsIndicator = ODDS_INDICATION.FIXED_ODDS_WITH_ODDS; // HAD固定赔率

            let g = new Game();
            let i = 0;
            let j = 0;
            let c = new Context();
            let p = new Pool(pcode); // 第一个参数poolCode：pool玩法
            let contexttmp = new SHomeAwayDraw();
            contexttmp.result = HAD_Result.DRAW; // HAD_Result.HOME_WIN=主胜， HAD_Result.AWAY_WIN=客胜，HAD_Result.DRAW=和
            c.scContext = contexttmp;
            c.odds = 3400; // input 3.4赔率*1000
            g.contextList[j++] = c;
            g.pool = p;
            g.matchDay = ScDayCode.TUESDAY; // input 比赛星期几
            g.matchNumber = 60; // input 比赛场次号，应该是从infoserv拿
            g.numOfContexts++;
            o.gameList[i++] = g;

            g = new Game();
            j = 0;
            c = new Context();
            contexttmp = new SHomeAwayDraw();
            contexttmp.result = HAD_Result.HOME_WIN;
            c.scContext = contexttmp;
            c.odds = 1790;
            g.contextList[j++] = c;
            g.numOfContexts++;
            c = new Context();
            contexttmp = new SHomeAwayDraw();
            contexttmp.result = HAD_Result.AWAY_WIN;
            c.scContext = contexttmp;
            c.odds = 3750;
            g.contextList[j++] = c;
            g.numOfContexts++;

            g.pool = p;
            g.matchDay = ScDayCode.TUESDAY; // input 比赛星期几
            g.matchNumber = 61; // input 比赛场次号，应该是从infoserv拿
            o.gameList[i++] = g;

            g = new Game();
            j = 0;
            c = new Context();
            contexttmp = new SHomeAwayDraw();
            contexttmp.result = HAD_Result.HOME_WIN;
            c.scContext = contexttmp;
            c.odds = 1780;
            g.contextList[j++] = c;
            g.numOfContexts++;
            c = new Context();
            contexttmp = new SHomeAwayDraw();
            contexttmp.result = HAD_Result.DRAW;
            c.scContext = contexttmp;
            c.odds = 3400;
            g.contextList[j++] = c;
            g.numOfContexts++;
            c = new Context();
            contexttmp = new SHomeAwayDraw();
            contexttmp.result = HAD_Result.AWAY_WIN;
            c.scContext = contexttmp;
            c.odds = 3750;
            g.contextList[j++] = c;
            g.numOfContexts++;

            g.pool = p;
            g.matchDay = ScDayCode.TUESDAY; // input 比赛星期几
            g.matchNumber = 62; // input 比赛场次号，应该是从infoserv拿
            o.gameList[i++] = g;

            BettingServ.Instance.PlaceFootball(o, (staff_reply) => {
                res.send(staff_reply);
            });
        });
        this.server.addAppApi('/test/placescbet/', (req, res) => {
            let o = new FootballBetObject();
            let pcode = PCODE.PC_HDC; // input
            o.scBetType = SCBET_TYPE.MATCH_BET;
            o.allUpType = ALLUP_TYPE.NON_ALLUP;
            o.oddsIndicator = ODDS_INDICATION.FIXED_ODDS_WITH_ODDS;
            o.allUp.leg = 1; // 过关数
            o.allUp.combination = 1; // 组合数
            o.unitBet = 4000000; // input $40000.00
            o.bInPlayBet = false;
            for (let i = 0; i < o.allUp.leg; i++) {
                let g = new Game();
                g.matchDay = ScDayCode.TUESDAY;
                g.matchNumber = 69;
                let p = new Pool(pcode);
                g.pool = p;
                let contextnum = 0;
                let c = new Context();
                c.poolCode = pcode;
                let contexttmp = new SHandicap();
                contexttmp.result = HAD_Result.HOME_WIN;
                contexttmp.firstHandicap = '-0.5'; // 让球
                contexttmp.split = true; // 为false时，secondHandicap不用赋值
                // 为true时，将本金分一半去投注让球第二判断标准↓:comparedScores2
                contexttmp.secondHandicap = '0'; //  主队  平手/半球  0/0.5  客队
                c.scContext = contexttmp;
                c.odds = 1690; // input 1.69
                g.contextList[contextnum++] = c;
                g.numOfContexts++;

                c = new Context();
                c.poolCode = pcode;
                contexttmp = new SHandicap();
                contexttmp.result = HAD_Result.AWAY_WIN;
                contexttmp.firstHandicap = '-0.5';
                // contexttmp.split = false;  // 默认为false
                c.scContext = contexttmp;
                c.odds = 2690; // input 2.69
                g.contextList[contextnum++] = c;
                g.numOfContexts++;

                o.gameList[i] = g;
            }
            const jsn = JSON.stringify(o);
            BettingServ.Instance.PlaceFootball(o, (res1) => {
                res.send(res1);
            });
        });

        var app1 = require('express')();
        var http1 = require('http').Server(app1);
        var io1 = require('socket.io')(http1);

        this.server.addAppApi('/test/staffserv/GetRdt/', (req, res) => {
            //app1.get('/', function(req, res) {
            if (terminalConfig.terminalMode === 'TRAINING') {
                let buf = new ByteArrayBuilder();
                const winnum = 20;
                buf.Append(winnum); // 0 = winnum ,6 = msgcode, 8 = msgbodybegin ,length-
                buf.Append('00000');
                buf.Append(86); //
                buf.Append('@000000@@');
                io1.emit('rlogin_9999_20', buf.ToArray());
            }
            // res.send('sam test');
            //});
            StaffServ.Instance.GetRdt((staff_reply) => {
                res.send(staff_reply);
            });
        });
        http1.listen(3346, function () {
            console.log('listening on *:3346');
        });
        io1.on('connect', (socket: any) => {
            console.log('Connected client on port %s.', 3346);
            socket.on('message', (m: string) => {
                console.log('[server](message): %s', m);
                io1.emit('message', m);
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected');
            });
            socket.on('retryReply_Event', (m: string) => {
                console.log('retryReply_Event' + m);
            });
        });
    }
}
