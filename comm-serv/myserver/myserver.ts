var app1 = require('express')();
var http1 = require('http').Server(app1);
var io1 = require('socket.io')(http1);
const ioclient = require('socket.io-client');
import { ByteArrayBuilder } from './util/byteArrayBuilder';
app1.get('/', function (req, res) {
    // let buf = new ByteArrayBuilder();
    // const winnum = 20;
    // buf.Append(winnum); // 0 = winnum ,6 = msgcode, 8 = msgbodybegin ,length-
    // buf.Append('00000');
    // buf.Append(86); //
    // buf.Append('@000000@@');
    let abctmp =
        '7f 2 40 40 40 40 71 40 48 56 20 57 45 44 20 52 30 33 20 46 2d 46 20 52 45 46 55 4e 44 5b 4b';
    // let abctmp = '7f 2 40 40 40 40 57 40 40 48 48 44 2f 40 45 41 4e 38';
    //7f 2 40 40 40 40 56 40 49 40 47 47 41 45 2f 40 48 48 44 2f 40 45 42 2f 41 57 36'

    let abcarr = abctmp.split(' ');
    let message = '';
    abcarr.forEach(function (e) {
        let ss = Number.parseInt(e, 16);
        message += String.fromCharCode(ss);
    });
    let buf = new ByteArrayBuilder();
    buf.Append(message);

    io1.emit('UBC_BROADCAST_MSG', buf.ToArray());
    res.send('sam test');
});
import * as bodyParser from 'body-parser';
import { MessageCode } from '../share/models/comm-serv/CommonDefs';
app1.use(bodyParser.urlencoded({ extended: false }));

app1.post('/bcservice', function (req, res) {
    console.log(req.body);
    let da = Object.keys(req.body)[0];
    // console.log("/nbody="+req.body+",type="+typeof(req.body));
    let bb: Buffer = Buffer.from(da);
    let bb1 = Array.prototype.map.call(bb, (d) => d.toString(16)).join(' ');
    console.log('\n' + bb1);
    let message = '';
    switch (bb[6]) {
        case MessageCode.MC_RDT_RQST: {
            //message = '25DEC81QAQADHVF25DEC81@03JAN82@06JAN82BHA@`@@D@@Z@@C @H@@P@@D@@STF26DEC81@03JAN82@06JAN82BHA@`@@D@@Z@@C @H@@P@@D@@S1F25DEC81@03JAN82@06JAN82BHA@`@@D@@Z@@C @H@@P@@D@@S2B28DEC81@03JAN82@06JAN82BHA@`@@D@@Z@@C @H@@P@@D@@RDT FOR TRAINING';
            let abctmp =
                '74 2 57 6c 40 40 50 5c 32 33 4d 41 59 31 38 40 40 53 40 41 53 54 44 32 33 4d 41 59 31 38 40 20 20 20 20 20 20 20 40 20 20 20 20 20 20 20 41 4a 7f 47 40 40 42 40 40 40 40 7f 4f 40 7f 4f 40 48 40 40 64 44 40 50 40 40 7f 4f 40 53 54 20 57 45 44 20 52 30 34 20 53 43 52 41 54 43 48 20 30 35 20 5f 26';
            let abcarr = abctmp.split(' ');
            abcarr.forEach(function (e) {
                let ss = Number.parseInt(e, 16);
                message += String.fromCharCode(ss);
            });
            let buf = new ByteArrayBuilder();
            buf.Append(message);
            let res1 = { errorstatus: 0, betstatus: 0, replybody: '' };
            res1.replybody = JSON.stringify(buf.ToArray());

            res.send(res1);
            return;
            break;
        }
        case MessageCode.MC_BET: {
            //message = '25DEC81QAQADHVF25DEC81@03JAN82@06JAN82BHA@`@@D@@Z@@C @H@@P@@D@@STF26DEC81@03JAN82@06JAN82BHA@`@@D@@Z@@C @H@@P@@D@@S1F25DEC81@03JAN82@06JAN82BHA@`@@D@@Z@@C @H@@P@@D@@S2B28DEC81@03JAN82@06JAN82BHA@`@@D@@Z@@C @H@@P@@D@@RDT FOR TRAINING';
            //let abctmp = '54 2 57 6c 40 40 44 dc 4e 49 40 43 41 42 4c 4c 4d 44 42 46 44 41 42 4a 49 43 4c 2f 45 43 43 47 2f 41 24 41 40 2e 40 40 40 40 24 41 40 2e 40 40 2e 25';
            let abctmp =
                '54 2 57 6c 40 40 70 dc 4d 54 4c 20 4d 49 4e 20 24 31 32 30 35 37 31 33 36 28 24 32 2e 30 30 78 43 2a 36 45 37 29 24 46';
            let abcarr = abctmp.split(' ');
            let buf = new ByteArrayBuilder();
            abcarr.forEach(function (e) {
                let ss = Number.parseInt(e, 16);
                //message += String.fromCharCode(ss); // dc > 128
                buf.Append(ss);
            });

            let res1 = { errorstatus: 0, betstatus: 0, replybody: '' };

            res1.replybody = JSON.stringify(buf.ToArray());

            res.send(res1);
            return;
        }
        case MessageCode.MC_SIGN_ON: {
            message = '10--:00/-06JAN82/A@5';
            break;
        }
        case MessageCode.MC_SIGN_OFF: {
            message = '23:00/06JAN82/$A.AA$B.BB$C.CC$D.DD$F.FF$G.GG$@.@@';
            break;
        }
        case MessageCode.MC_AUTHMASK: {
            message = 'A>   '; // '@?   ' '?'=(ascii)63  '>'=(ascii)62
            break;
        }
    }

    let buf = new ByteArrayBuilder();
    buf.Append(40); // 0
    buf.Append(40); // 1
    buf.Append(40); // 2
    buf.Append(40); // 3
    buf.Append(0); // 4  msg low bit
    buf.Append(0); // 5  msg hight bit
    buf.Append(bb[6]); // 6 msgcode bb[6]
    buf.Append(40); // 7
    buf.Append(message); // 8 ~ -3
    let tmpbuf = buf.ToArray();
    let va_2 = 0;
    for (let i = 2; i < tmpbuf.length; i++) {
        va_2 ^= tmpbuf[i];
    }
    let abc = Math.floor(va_2 / 32) % 2;
    if (abc === 1) {
        va_2 = va_2 % 64;
    } else {
        va_2 = va_2 % 128;
        va_2 = va_2 | 64;
    }
    buf.Append((buf.Length - 2) & 0x3f); // -2
    buf.Append(va_2); // -1
    // buf.Append(40); // -1

    let res1 = { errorstatus: 0, betstatus: 0, replybody: '' };
    res1.replybody = JSON.stringify(buf.ToArray());

    res.send(res1);
});
app1.post('/bcservice1', function (req, res) {
    console.log(req.body);
    let da = Object.keys(req.body)[0];
    // console.log("/nbody="+req.body+",type="+typeof(req.body));
    let bb: Buffer = Buffer.from(da);
    let bb1 = Array.prototype.map.call(bb, (d) => d.toString(16)).join(' ');
    console.log('\n' + bb1);
    let message = '';
    switch (bb[6]) {
        // RBL TRANSACTION REJECTED (0431)
        // SNA SALES NOT AVAILABLE
        // CMS - QEP  CMS - QAU
        // 第%1场投注已截止  RACE %1 CLOSED.
        case MessageCode.MC_SIGN_ON: {
            message = 'Invalid OCR Ticket';
            break;
        }
    }

    let buf = new ByteArrayBuilder();
    buf.Append(40); // 0
    buf.Append(40); // 1
    buf.Append(40); // 2
    buf.Append(40); // 3
    buf.Append(0); // 4  msg low bit
    buf.Append(0); // 5  msg hight bit
    buf.Append(112); // 6 msgcode bb[6]
    buf.Append(40); // 7
    buf.Append(message); // 8 ~ -3
    let tmpbuf = buf.ToArray();
    let va_2 = 0;
    for (let i = 2; i < tmpbuf.length; i++) {
        va_2 ^= tmpbuf[i];
    }
    let abc = Math.floor(va_2 / 32) % 2;
    if (abc === 1) {
        va_2 = va_2 % 64;
    } else {
        va_2 = va_2 % 128;
        va_2 = va_2 | 64;
    }
    buf.Append(buf.Length - 2); // -2
    buf.Append(va_2); // -1
    // buf.Append(40); // -1

    let res1 = { errorstatus: 0, betstatus: 0, replybody: '' };
    res1.replybody = JSON.stringify(buf.ToArray());

    setTimeout(() => {
        res.send(res1);
    }, 120000);
});
app1.post('/sleepasyn/sendAndWait', (req, res) => {
    let second: number = Number.parseInt(req.params.second, 10);
    if (!second) {
        second = 5;
    }
    let buf = new ByteArrayBuilder();
    buf.Append(40); // 0
    buf.Append(40); // 1
    buf.Append(40); // 2
    buf.Append(40); // 3
    buf.Append(0); // 4  msg low bit
    buf.Append(0); // 5  msg hight bit
    buf.Append(59); // 6 msgcode bb[6]
    buf.Append(59); // 7
    buf.Append('Invalid OCR Ticket'); // 8 ~ -3
    let tmpbuf = buf.ToArray();
    let va_2 = 0;
    for (let i = 2; i < tmpbuf.length; i++) {
        va_2 ^= tmpbuf[i];
    }
    let abc = Math.floor(va_2 / 32) % 2;
    if (abc === 1) {
        va_2 = va_2 % 64;
    } else {
        va_2 = va_2 % 128;
        va_2 = va_2 | 64;
    }
    buf.Append((buf.Length - 2) & 0x3f); // -2
    buf.Append(va_2); // -1

    let res1 = { errorstatus: 0, betstatus: 0, replybody: '' };
    res1.replybody = JSON.stringify(buf.ToArray());

    setTimeout(
        (resp) => {
            res.send(resp);
        },
        second * 1000,
        res1
    );
});
app1.post('/sleepasyn1/sendAndWait', (req, res) => {
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
});
// app1.get('/getoddsnew/:object', function (req, res) {
//     let str = '';
//     let strpool = '';
//     let strline = '';
//     let strcomb = '';
//     let obj = JSON.parse(req.params.object);
//     console.log(req.params.object);
//     let day = obj.day;
//     if (!day || typeof day === undefined) {
//         day = 'TUE';
//     }
//     str += 'aa.MatchDay = "' + day + '" ';
//     let matchnum = obj.matchnum;
//     if (!matchnum) {
//         matchnum = '2';
//     }
//     str += 'and aa.MatchNum = "' + matchnum + '" ';
//     let pool = obj.pool;
//     if (!pool) {
//         pool = 'CHL';
//     }
//     strpool += 'aa.Pool = "' + pool + '" ';

//     let linenum = obj.linenum;
//     if (linenum) {
//         strline += 'aa.MainLine = "' + linenum + '" ';
//     }

//     let comb = obj.comb;
//     if (!comb) {
//         res.send('comb can not be null!');
//         return;
//     }
//     strcomb += 'aa.Number = "' + comb + '" ';
//     let matches: any;
//     let matches1: any;
//     const PoolInfo: any = new Object();

//     if (oddsAllDoc.length > 0) {
//         const doc = oddsAllDoc[0].OddsAll.INFO;
//         matches = alasql(
//             'SEARCH /MatchInfo/ AS @a WHERE(@a->Enabled="1") FROM $0',
//             [doc]
//         );
//         matches = alasql('select * from ? as aa WHERE ' + str, [matches]);
//         if (matches.length === 0) {
//             res.send('matchday or num is null:' + str);
//             return;
//         }
//         matches = alasql('select * from ? as aa WHERE ' + strpool, [
//             matches[0].Pools.PoolInfo,
//         ]);
//         // PoolInfo.PoolInfo1 = matches;
//         if (linenum) {
//             matches = alasql('select * from ? as aa WHERE ' + strline, [
//                 matches[0].OddsSet,
//             ]);
//         } else {
//             matches = matches[0].OddsSet;
//         }
//         // PoolInfo.PoolInfo2 = matches;

//         for (let i = 0; i < matches.length; i++) {
//             matches1 = alasql('select * from ? as aa WHERE ' + strcomb, [
//                 matches[i].OddsInfo,
//             ]);
//             if (matches1.length > 0) {
//                 break;
//             }
//         }
//     }
//     PoolInfo.PoolInfo = matches1;
//     res.send(PoolInfo);
// });
var server1 = http1.listen(5006, function () {
    console.log('listening on *:5006');
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
let socket1 = ioclient('http://localhost:5002');
socket1.on('connect', (msg) => {
    console.log('ioclient get 5002' + msg);
});
socket1.on('retryReply_Event', (msg) => {
    console.log('hahahahahhahahahahahahahahahaah');
    socket1.emit('retryReply_Event', 'hello world');
});

export { server1 };
