import { logger } from '../share/utils/logs';
import { KioskServer } from '../share/utils/server';
import { ReqHandler } from './util/reqHandler';
import { BettingServ } from './bettingServ';
import { StaffListServ } from './staffListServ';
import { TerminalServ } from './terminalServ';
import { MarkSixBetObject } from '../share/models/comm-serv/MarSix/MarkSixBetObject';
import { PlaceStaffTest } from './placestafftest1';
import { StaffServ } from './staffServ';
import { CustomerServ } from './CustomerServ';
import { BCServ } from './BCServ';
import { CustomerTest } from './customertest';
import { validateJsonObjectFormat } from '../beteng-serv/routes/routeShare';
import {
    FootballBetObject,
    Pool,
    MULTI_LEG_INFO,
    Game,
    Context,
} from '../share/models/comm-serv/Football/FootballBetObject';
import { TTSTWrapper } from '../beteng-serv/ttst-wrapper/ttst-wrapper';
import { TICKET_DETAIL } from '../share/models/beteng-serv/ticketdetail';
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
    FillType,
    FillBetSlip,
    FillBetSlipUtil,
    RuleType,
} from './httpsend/FillBetSlip';
import { CommservWrapper } from '../test/unit/comm-serv/addon/commservwrapper';
let fs = require('fs');
let path = require('path');
const server = new KioskServer();

server.addAppApi('/', (req, res) => {
    console.log('/ map');
    res.setHeader('Content-type', 'text/html');
    res.send('<h1>Welcome Kiosk Comm--Server</h1>');
});

server.addAppApi('/bettingserv/placeracing/:betObj', (req, res, next) => {
    const betObj = JSON.parse(req.params.betObj);
    BettingServ.Instance.PlaceRacing(betObj, (bet_reply) => {
        res.send(bet_reply);
    });
});

server.addAppApi('/bettingserv/placemarksix/:betObj', (req, res, next) => {
    const betObj = JSON.parse(req.params.betObj);
    BettingServ.Instance.PlaceMarkSix(betObj, (bet_reply) => {
        res.send(bet_reply);
    });
});

server.addAppApi('/bettingserv/PlaceFootball/:betObj', (req, res, next) => {
    const betObj = FootballBetObject.jsonParse(req.params.betObj);
    BettingServ.Instance.PlaceFootball(betObj, (bet_reply) => {
        res.send(bet_reply);
    });
});

server.addAppApi('/staffserv/SignOn/:object', (req, res) => {
    const obj = { staffId: '', staffPin: '' };
    // server;
    if (validateJsonObjectFormat(req, res, obj)) {
        StaffServ.Instance.SignOn(req.params.object, (staff_reply) => {
            res.send(staff_reply);
        });
    }
});

server.addAppApi('/staffserv/SignOff/:object', (req, res) => {
    const obj = { shroffSignOff: '' };
    if (validateJsonObjectFormat(req, res, obj)) {
        StaffServ.Instance.SignOff(req.params.object, (staff_reply) => {
            res.send(staff_reply);
        });
    }
});

// server.addAppApi('/staffserv/ChangePassword/:staffId/:oldPassword/:newPassword', (req, res) => {
//    StaffServ.Instance.ChangePassword(req.params.staffId, req.params.oldPassword, req.params.newPassword, (staff_reply) => {
server.addAppApi('/staffserv/ChangePassword/:object', (req, res) => {
    const obj = { staffID: '', oldPassword: '', newPassword: '' };
    if (validateJsonObjectFormat(req, res, obj)) {
        StaffServ.Instance.ChangePassword(req.params.object, (staff_reply) => {
            res.send(staff_reply);
        });
    }
});

// server.addAppApi('/staffserv/GetStaffAuthority/:staffId/:password', (req, res) => {
//    StaffServ.Instance.GetStaffAuthority(req.params.staffId, req.params.password, 1, (staff_reply) => {
server.addAppApi('/staffserv/GetStaffAuthority/:object', (req, res) => {
    const obj = { staffID: '', password: '', rqtPurpose: 0 };
    if (validateJsonObjectFormat(req, res, obj)) {
        StaffServ.Instance.GetStaffAuthority(
            req.params.object,
            (staff_reply) => {
                res.send(staff_reply);
            }
        );
    }
});

server.addAppApi('/customerserv/TbDeposit/:object', (req, res) => {
    const obj = { accountNumber: '', amount: 0 };
    if (validateJsonObjectFormat(req, res, obj)) {
        CustomerServ.Instance.TbDeposit(req.params.object, (customer_reply) => {
            res.send(customer_reply);
        });
    }
});
// server.getApp().get('/customerserv/PayBet/:params', (req, res) => {
server.addAppApi('/customerserv/PayBet/:object', (req, res) => {
    const obj = { tsn: '', payMethod: '' };
    if (validateJsonObjectFormat(req, res, obj)) {
        CustomerServ.Instance.PayBet(req.params.object, (customer_reply) => {
            res.send(customer_reply);
        });
    }
});

// server.getApp().get('/customerserv/QRCAccountRelease/:params', (req, res) => {
server.addAppApi('/customerserv/QRCAccountRelease/:object', (req, res) => {
    const obj = { qrcValue: '' };
    if (validateJsonObjectFormat(req, res, obj)) {
        CustomerServ.Instance.QRCAccountRelease(
            req.params.object,
            (customer_reply) => {
                res.send(customer_reply);
            }
        );
    }
});

server.addAppApi('/customerserv/QRCAccountAccess/:object', (req, res) => {
    const obj = { qrcValue: '' };
    if (validateJsonObjectFormat(req, res, obj)) {
        CustomerServ.Instance.QRCAccountAccess(
            req.params.object,
            (customer_reply) => {
                res.send(customer_reply);
            }
        );
    }
});

server.addAppApi('/bcserv/BCConnTest/:object', (req, res) => {
    const obj = { bcType: 0 };
    if (validateJsonObjectFormat(req, res, obj)) {
        BCServ.Instance.BCConnTest(req.params.object, (customer_reply) => {
            res.send(customer_reply);
        });
    }
});

server.addAppApi('/bcserv/testTkt/', (req, res) => {
    // console.log("22<<24=",22<<24);

    BCServ.Instance.testTkt((customer_reply) => {
        res.send(customer_reply);
    });
});
server.addAppApi('/bcserv/test1/', (req, res) => {
    BCServ.Instance.Test1((customer_reply) => {
        res.send(customer_reply);
    });
});
server.addAppApi('/simulate/testTkt1/:object', (req, res) => {
    const t: TTSTWrapper = new TTSTWrapper();
    const p = new TICKET_DETAIL();
    let d = '0';
    switch (req.params.object) {
        case '49':
            d =
                '00000000000000000000000000000000000000001011000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000100000000000000100000000000000000000000000010000000000000000000000001000000000000000010010000000000000000000000100000000000001000000000000000000000000000000000000000000000000100000000000000000000000000000000000000100000100000000000000000000000000';
            break;
        case '18':
            d =
                '00000000000000000000000000000000000000000000000000000000000010010000000000000000000000000000000000001000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000001001100000000000000000000000000000000000100000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';
            break;
        case '19':
            d =
                '00000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000100000000' +
                '0000000000000000001000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000100000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000100100000000' +
                '0000000000100000000000' +
                '0000000000000000000000' +
                '0000000000000000000001' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000100000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000100000000000' +
                '0000000000000100000000' +
                '0000000000000000000000';
            break;
        case '35':
            d =
                '00000000000000110000011' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000010000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000001000' +
                '0000000000000000000000' +
                '0000000000010000010000' +
                '0000000000000000000000' +
                '0000000000000100000000' +
                '0000000000000000000000' +
                '0000000000000000001000';
            break;
        case '24':
            d =
                '00000000000000000000000' +
                '0000000000001000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000';
            break;
        case '135':
            d =
                '000000000000000001000000000000000000001000000000000000001000000010000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';
            break;
        case '180':
            d =
                '00000000000000000000100' +
                '0000000000001000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000100000000' +
                '0000000000000000000000' +
                '0000000000001000000100' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000001000000000' +
                '0000000000000000000000' +
                '0000000000000000000000';
            break;
        case '181':
            d =
                '00000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000';
            break;
        case '182':
            d =
                '00000000000010000000000' +
                '0000000000000001110000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000001000000000' +
                '0000000100000001110000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000001000010100000' +
                '0000000001000000000000' +
                '0000000100000000010000' +
                '0000000000000000000000';
            break;
        case '183':
            d =
                '00000000000000000000000' +
                '0000000000000000000000' +
                '0000000100000000000000' +
                '0000000000000100000000' +
                '0000000000000000100000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000010000000' +
                '0000000000000000010000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000010000000001000' +
                '0000000000000001000000' +
                '0000000001000000010000' +
                '0000000000000000000000' +
                '0000000100000000000000';
            break;
        case '184':
            d =
                '00000000001000100000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000010000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000001000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000001000000000000' +
                '0000000000000000000000' +
                '0000000000010000000000' +
                '0000000000000100000000' +
                '0000000010000000000000';
            break;

        case '185':
            d =
                '00000001010000100000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000010000010000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000001010000001000000' +
                '0000001000000000000000' +
                '0000000000000000000000' +
                '0000001000000000000000' +
                '0000001010000000100000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000100000' +
                '0000000000000000000000' +
                '0000000000000000010000' +
                '0000000100000000000000';
            break;
        case '186':
            d =
                '00000000001001010010000' +
                '0000000000000000000000' +
                '0000000000001000000100' +
                '0000000000000000000000' +
                '0000000000000000001000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000100000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000010000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000100000000000' +
                '0000000000100010000100' +
                '0000000000000000000000' +
                '0000000100000000000001';
            break;
        case '187':
            d =
                '00000000001000010000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000001000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000010000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000010010000000000' +
                '0000000000000100000000' +
                '0000000000000000000000';
            break;
        case '72':
            d =
                '00000000000000000000100' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000';
            break;
        case '31':
            d =
                '00000000000000000000000' +
                '0000001000000100000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000';
            break;
        case '18':
            d =
                '00000000000000000000000' +
                //'0000000000000000000000' +
                '0000000000010000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000001000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000100000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000010000000000';
            break;
        case '71':
            d =
                '00000000000000100000000' +
                '0000000000000100000000' +
                '0000000000000100000000' +
                '0000000000000100000000' +
                '0000000000000100000100' +
                '0000000000000100000000' +
                '0000000000000000010000' +
                '0000000000000010000000' +
                '0000000000000001001000' +
                '0000000000000000010000' +
                '0000000000000000000000' +
                '0000000000000011100000' +
                '0000000000000011100000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000010000000000' +
                '0000000000010000001000' +
                '0000000000010000000010' +
                '0000000000010100000000' +
                '0000000000010001010010';
            break;
        case '116':
            d =
                '00000000000001100000010' +
                '0000000000000001000000' +
                '0000000000000001000000' +
                '0000000000000001000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000';
            break;
        case '120':
            d =
                //'00000000000000000000000' +
                '00000000000001000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000010000001' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000010000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000010000000' +
                '0000000000000000000000' +
                '0000000000000010000000' +
                '0000000000000000000000' +
                '0000000000000000000000';
            break;
        case '150':
            d =
                '00000000000000000000000' +
                '0000000000000100000000' +
                '0000000000000000000000' +
                '0000000000001000010000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000100000100' +
                '0000000000001000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000001000000000' +
                '0000000000000000100000' +
                '0000000000000000000000';
            break;
        case '151':
            d =
                '00000000000000100010000' +
                '0000000000000000000000' +
                '0000000000001000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000100000000' +
                '0000000000001000010000' +
                '0000000000000000000000' +
                '0000000000000100000000' +
                '0000000000000000000000' +
                '0000000000010000001000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000100000000' +
                '0000000000010000000000' +
                '0000000000000000000100' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000001000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000100' +
                '0000000000000000000000' +
                '0000000000000000000000';
            break;
        case '118':
            d =
                '00000000000000000000000' +
                '0000000000000001100000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000011000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000001000' +
                '0000000000000000000000';
            break;
        case '122':
            d =
                '00000000000010000000000' +
                '0000000000000000000000' +
                '0000000000010000000000' +
                '0000000000000100000000' +
                '0000000000000000000000' +
                '0000000000000100000000' +
                '0000000000001000000000' +
                '0000000000000000000000' +
                '0000000000001000000000' +
                '0000000000000010000000' +
                '0000000000000000000000' +
                '0000000000000000100000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000010010000000' +
                '0000000000000000010000';
            break;
        case '146':
            d =
                '00000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000110100100000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000110100100000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000111000010000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000111000010000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000111000010000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000111000010000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000001000100' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000';
            break;
        case '152':
            d =
                '00000000000000000010000' +
                '0000000000000100000000' +
                '0000000000010000010000' +
                '0000000000000000000000' +
                '0000000000000010000000' +
                '0000000000000000000000' +
                '0000000000000000010000' +
                '0000000000010000000000' +
                '0000000000000000010000' +
                '0000000000000010000000' +
                '0000000000010000010000' +
                '0000000000000000000000' +
                '0000000000000000010000' +
                '0000000000000000000000' +
                '0000000000010000010000' +
                '0000000000000010000000' +
                '0000000000000000010000' +
                '0000000000000000000000' +
                '0000000000010100010000' +
                '0000000000000000000000' +
                '0000000000000100010000' +
                '0000000000000000000000' +
                '0000000000010000010000' +
                '0000000000000000000000' +
                '0000000000000001010000' +
                '0000000000000000000000' +
                '0000000000010000010000' +
                '0000000000000000000000' +
                '0000000000000000010000' +
                '0000000000000000000000' +
                '0000000000010000010000' +
                '0000000000000100000000' +
                '0000000000000000011111' +
                '0000000000000000011111' +
                '0000000000000010011111';
            break;
        case '155':
            d =
                '00000000100010000000000' +
                '0000000000000000000000' +
                '0000001000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000100001000000000' +
                '0000001000000000000000' +
                '0000000000000000000000' +
                '0000000100000010000000' +
                '0000000000000000000000' +
                '0000010000000000000000' +
                '0000000000000000000000' +
                '0000000000000000100001' +
                '0000000100000000011000' +
                '0000010000000001000000' +
                '0000000000000000001000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                //'0000010100000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000001000000000' +
                '0000010000000000000000' +
                '0000000100000000000000' +
                '0000000000000000000000' +
                '0000000010010000000000' +
                '0000010000000000000000' +
                '0000000000000000000000' +
                '0000001100000010000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000000000000000000000' +
                '0000001000000000000000' +
                '0000000000000100000000' +
                '0000000000000000000000';
            break;
    }
    // res={"status":"RID_NO_ERROR","track":"0","day":48,
    // "date":"48 65 48 48 48 48 48 48 48","ticket_id":"120",
    // "pool":"48 119 48 48 48 48 48 48 48",
    // "formula":"000000000000000000000000000000000000000000000000000000",
    // "race":"0000000000000000",
    // "selection":"0000000","value":"00001000000000000","mb_type":0,"draw_type":48,
    // "entryNo":"1","type":"5","event":"1","exot_flag":"1","allup_flag":"0","status1":"0","addon_flag":"0","sb_flag":"1","game_type":"8","game_method":"0","quick_pick":"0","match":"0 1 0 0 0 0 0 0 0 0","score1":"0.000000 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000","score2":"0.000000 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000"}

    // 135 const
    const a: string = t.CTSTvalidate(
        true,
        true,
        true,
        Number.parseInt(req.params.object),
        1,
        d,
        p
    );
    console.log('date1=' + p.date[1].charCodeAt(0));
    const obc = { p: p, status: a };
    console.log('a=' + a);
    res.send(obc);
});

server.addAppApi('/simulate/validate/:slipid/:slipdata', (req, res) => {
    const t: TTSTWrapper = new TTSTWrapper();
    const p = new TICKET_DETAIL();
    const a: number = t.CTSTvalidate(
        true,
        true,
        true,
        Number.parseInt(req.params.slipid),
        1,
        req.params.slipdata,
        p
    );
    const obc = { p: p, status: a };
    res.send(obc);
});

// import { SamHardware } from './hardware';
server.addAppApi('/simulate/subscribe/', (req, res) => {
    // let ki = new SamHardware;
    // ki.listenFirstChange().subscribe((data: string) => {
    //     res.send(data);
    // });
    // res.send('hello');
    const server1 = new KioskServer();
    server1.emitEvent('retryCount_Event', 123);
    res.send('hello');
});

server.addAppApi('/simulate/SignOn1/:object', (req, res) => {
    // tslint:disable-next-line: no-eval
    const params = eval('(' + req.params.object + ')');
    if (0) {
        console.log(params);

        // let return1 = String.fromCharCode((0x41)) + '12:00A07JAN82/A' + String.fromCharCode(14) + '/';
        const return1 = Buffer.concat([
            Buffer.from('@@@@@@A/12:00/07JAN88/'),
            Buffer.from([0, 1]),
            Buffer.from('A/A'),
            Buffer.from([0, 7, 27, 60]),
        ]);

        const return2 = { rc: 0, rplyMsg: return1, iBs: 0 };
        res.send(return2);
    } else {
        setTimeout(() => {
            res.send('hello world');
        }, 15000);
    }
});
import axios from 'axios-https-proxy-fix';
import { HttpSend } from './httpsend/HttpSend';
const qs = require('qs');
server.addAppApi('/simulate/https/:s', (req, res) => {
    const https = require('https');
    //   const httpad = require('axios/lib/adapters/http');
    const http1 = axios.post('', qs.stringify({ second: req.params.s }), {
        baseURL: 'http://localhost:5002/sleepasyn/', // "https://10.194.102.130:8001/kiosk/",//"https://devgit01.corpdev.hkjc.com:8443",
        //       adapter:httpad,
        timeout: 5000,
        // data:{second:6},
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    http1
        .then((res1) => {
            res.send('res=' + JSON.stringify(res1.data));
        })
        .catch((err) => {
            console.log('err=' + err);
            res.send('err=' + err);
        });
    // res.send('hello');
});
// import { Commreq } from './RPC/Commreq';
server.getApp().post('/sleepasyn/', (req, res) => {
    console.log('query=' + JSON.stringify(req.query));
    console.log('params=' + JSON.stringify(req.params));
    console.log('method=' + JSON.stringify(req.method));
    console.log('headers=' + JSON.stringify(req.headers));
    console.log('url=' + JSON.stringify(req.url));
    console.log('body=' + JSON.stringify(req.body));
    if (!req.body.second) {
        req.body.second = 5;
    }
    setTimeout(
        (resp) => {
            res.send(resp);
        },
        req.body.second * 1000,
        {
            res: 'sleep ' + req.body.second + ' second intest5asyn',
            pa: req.body.name + '--haha',
        }
    );
    // Commreq.Instance.test5asyn(req.body.second, resp => {
    //     res.send(resp);
    // }, req.body.name + '--haha');
});
server.getApp().post('/sleepasyn1/', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
    res.header(
        'Content-Type',
        'application/x-www-form-urlencoded;charset=utf-8'
    );
    // console.log('query=' + JSON.stringify(req.query));
    // console.log('params=' + JSON.stringify(req.params));
    // console.log('method=' + JSON.stringify(req.method));
    // console.log('headers=' + JSON.stringify(req.headers));
    // console.log('url=' + JSON.stringify(req.url));
    // console.log('body=' + JSON.stringify(req.body));
    if (!req.body.second) {
        req.body.second = 16;
    }
    setTimeout(
        (resp) => {
            res.send(resp);
        },
        req.body.second * 1000,
        {
            res: 'sleep ' + req.body.second + ' second intest5asyn',
            pa: req.body.name + '--haha',
        }
    );
    // Commreq.Instance.test5asyn(req.body.second, resp => {
    //     res.send(resp);
    // }, req.body.name + '--haha');
});

server.addAppApi('/simulate/httpstest/:nothing?', (req, res) => {
    const a: Messages = {
        message: Buffer.from('1234567'),
        messageCode: 58,
        betObj: null,
    };
    console.log('/simulate/httpstest/:nothi?');
    HttpSend.getInstance().sendRecvMonitorThread(
        a,
        (resp) => {
            res.send(resp);
        },
        true
    );
});

server.addAppApi('/sleepasyn/:second?', (req, res) => {
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
server.addAppApi('/sleepasyn1/:second?', (req, res) => {
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
server.addAppApi('/bcreturn/', (req, res) => {
    class A {
        public a;
        public b;
    }
    let a1: A[] = [];
    let a2: A[] = [];
    let a3;
    {
        let tmp1 = new A();
        tmp1.a = '123';
        tmp1.b = '456';
        a3 = tmp1;
        a1.push(tmp1);
        tmp1.b = '789';
        a2.push(tmp1);
    }
    console.log(a1);
    console.log('\n\n');
    console.log(a2);
    console.log('\n\n');
    console.log(a3);

    let ab = [0, 1, 2, 3, 4];
    console.log('\n\n');
    console.log('abtype=' + typeof ab);

    let msn =
        '7f 2 40 40 40 40 71 40 4d 53 4e 57 45 44 20 52 30 33 20 46 2d 46 20 52 45 46 55 4e 44 5b 4b';
    let abcarr = msn.split(' ');
    let message = '';
    abcarr.forEach(function (e) {
        let ss = Number.parseInt(e, 16);
        message += String.fromCharCode(ss);
    });
    let buf = new ByteArrayBuilder();
    buf.Append(message);
    console.log('\nbuf=' + buf.ToArray().toString());

    let strmsn = '@@@@q@MSNWED R03 F-F REFUND[K';

    let bb = Array.prototype.map
        .call(Buffer.from(strmsn), (d) => d.toString(16))
        .join(' ');
    console.log('\nbb=' + bb);
    res.send({ errorstatus: '0', betstatus: '14', replybody: '' });
});

server.addAppApi('/simulate/sigon/:fff?', (req, res) => {
    res.send({
        errorstatus: '1',
        betstatus: '0',
        replybody: 'A10:00A/06JAN82/A@5',
    });
});
server.addAppApi('/stafflistserv/getStaffList/:token?', (req, res) => {
    let object = { authorization: 'Bearer ' + req.params.token };
    if (req.headers.authorization) {
        object = { authorization: req.headers.authorization };
    }
    StaffListServ.Instance.getStaffList(object, (customer_reply) => {
        res.send(customer_reply);
    });
});

server.addAppApi('/stafflistserv/addStaff/:object/:token?', (req, res) => {
    const obj = { staffList: { staffCard: [{ staffNum: '', staffID: '' }] } };
    if (validateJsonObjectFormat(req, res, obj)) {
        let object = { authorization: 'Bearer ' + req.params.token };
        if (req.headers.authorization) {
            object = { authorization: req.headers.authorization };
        }
        StaffListServ.Instance.addStaff(
            req.params.object,
            object,
            (customer_reply) => {
                res.send(customer_reply);
            }
        );
    }
});

server.addAppApi('/stafflistserv/login/:pa?', (req, res) => {
    StaffListServ.Instance.login((customer_reply) => {
        res.send(customer_reply);
    });
});

server.addAppApi('/comservwrapper', (req, res) => {
    // const t: CommservWrapper = new CommservWrapper();
    //const a: string = t.msgFormat(0, ['f']);
    // res.send(atob);
    // fs.readFile(
    //     path.join('/home/ubuntu/.Kiosk/ngbt/data/', 'simulatedOdds.bin'),
    //     { encoding: 'utf-8' },
    //     function (err, bytesRead) {
    //         if (err) throw err;
    //         // var data = JSON.parse(bytesRead);
    //         console.log(typeof bytesRead);
    //         console.log(bytesRead.length);
    //         console.log('readFile success');
    //         res.send(bytesRead);
    //     }
    // );

    const a: string = theOddsServ.msgFormat(1, ['000000', '999999'], 2);
});

server.addAppApi('/football/bet', (req, res) => {
    const obj = { staffList: { staffCard: [{ staffNum: '', staffID: '' }] } };
    if (validateJsonObjectFormat(req, res, obj)) {
        let object = { authorization: 'Bearer ' + req.params.token };
        if (req.headers.authorization) {
            object = { authorization: req.headers.authorization };
        }
        StaffListServ.Instance.addStaff(
            req.params.object,
            object,
            (customer_reply) => {
                res.send(customer_reply);
            }
        );
    }
});
server.addAppApi('/random1', (req, res) => {
    // let a = new FillBetSlipUtil(28);
    // a.xmax = 28;
    // //180[12,6,6,4,4,3,4,4,3,4,4];
    // //181[19,5,5,5,5,5,5,5,5,5,4,4,4,4,4];
    // //182[19,5,5,5,5,5,5,5,5,5,4,4,4,4,4,4];
    // //183[19,5,5,5,5,5,5,5,5,5,4,4,4,4];
    // let xa=[28, 4,4,4,4,4, 4,4,4,4, 16,4,4,4,4, 4,4,4,4,4, 4,4,4,4, 4,4,4,4, 4,4];
    // //180[12,1,4,1,4,5,1,4,5,1,4];
    // //181[7,1,7,7,1,7,7,1,7,7,1,1,4,3,6];
    // //182[7,1,7,7,1,7,7,1,7,7,1,1,4,1,2,6];
    // //183[7,1,7,7,1,7,7,1,7,7,1,1,6,7];
    // let ya=[6, 1,1,1,3,10, 2,1,3,10, 1,1,1,3,10, 1,1,1,3,10, 1,1,3,10, 1,1,3,10, 9,6];

    let a = FillBetSlipUtil.creatslipdata(186, true);
    let xa = a[0];
    let ya = a[1];
    let a1 = new FillBetSlipUtil(xa[0]);
    a1.pushlist(xa, ya);
    let bb = Array.prototype.map.call(a1.result, (d) => String.fromCharCode(d));
    let res1 = '';
    for (let x = 0; x < 22; x++) {
        for (let y = 0; y < xa[0]; y++) {
            res1 += bb[x + y * 22] + ' ';
        }
        res1 += '<br>';
    }

    res.send(res1);
});
server.addAppApi('/random', (req, res) => {
    let a = FillBetSlipUtil.creatslipdata(186);

    let bb = Array.prototype.map.call(a.result, (d) => String.fromCharCode(d));
    let res1 =
        ' <table><th> </th><th>1&nbsp;&nbsp;</th> <th> 2&nbsp;&nbsp; </th> <th> 3 &nbsp;&nbsp;</th> <th> 4 &nbsp;&nbsp;</th> <th>' +
        '5&nbsp;&nbsp; </th> <th> 6&nbsp;&nbsp; </th> <th> 7&nbsp;&nbsp; </th> <th> 8&nbsp;&nbsp;</th> <th>  9&nbsp;&nbsp;</th> <th>  10</th> <th>' +
        '11</th> <th> 12</th> <th> 13</th> <th> 14</th> <th> 15</th> <th> 16</th> <th>' +
        '17</th> <th> 18</th> <th> 19</th> <th> 20</th> <th> 21</th> <th> 22</th> <th>' +
        '23</th> <th> 24</th> <th> 25</th> <th> 26</th> <th> 27</th> <th> 28</th> <th> 29</th>';
    for (let x = 0; x < 22; x++) {
        res1 += '<tr><td>' + (x + 1);
        if (x < 10) {
            res1 += '&nbsp;';
        }

        res1 += '&nbsp;&nbsp;</td>';
        for (let y = 0; y < a.xmax; y++) {
            res1 += '<td>' + bb[x + y * 22] + ' </td> ';
        }
        res1 += '</tr>';
    }
    res1 += '</table>';

    const t: TTSTWrapper = new TTSTWrapper();
    const p = new TICKET_DETAIL();
    const A10: string = t.CTSTvalidate(
        true,
        true,
        true,
        186,
        1,
        '0' + a.result,
        p
    );
    const obc = { p: p, status: A10 };
    res1 += JSON.stringify(obc);

    res.send(res1);
});
server.addAppApi('/starttest', (req, res) => {
    logger.info('starttest');
    setInterval(() => {
        let arr = [180, 181, 182, 183, 184, 185, 186, 187];
        let t1 = randomBytes(1);
        let index = t1[0] % 4;
        let a = FillBetSlipUtil.creatslipdata(arr[index]);
        let bb = Array.prototype.map.call(a.result, (d) =>
            String.fromCharCode(d)
        );
        const t: TTSTWrapper = new TTSTWrapper();
        const p = new TICKET_DETAIL();
        const A10: string = t.CTSTvalidate(
            true,
            true,
            true,
            arr[index],
            1,
            '0' + a.result,
            p
        );
        const obc = { p: p, status: A10 };
        let res2 = '';
        if (A10 !== 'RID_NO_ERROR') {
            logger.info('------------------------------------------------');
            logger.info(
                '   1  2  3  4  5  6  7  8  9  10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29'
            );
            for (let x = 0; x < 22; x++) {
                res2 = '' + (x + 1);
                if (x < 9) {
                    res2 += ' ';
                }
                res2 += ' ';
                for (let y = 0; y < a.xmax; y++) {
                    res2 += bb[x + y * 22] + '  ';
                }
                logger.info(res2);
            }
            logger.info(JSON.stringify(obc));
            logger.info('------------------------------------------------');
        }
        console.log('\n------------------------------------------------');
        console.log(
            '\n   1  2  3  4  5  6  7  8  9  10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29'
        );
        for (let x = 0; x < 22; x++) {
            res2 = '' + (x + 1);
            if (x < 9) {
                res2 += ' ';
            }
            res2 += ' ';
            for (let y = 0; y < a.xmax; y++) {
                res2 += bb[x + y * 22] + '  ';
            }
            console.log('\n' + res2);
        }
        console.log('\n' + JSON.stringify(obc));
        console.log('\n------------------------------------------------');
    }, 10000);
    //RID_NO_ERROR
    res.send('s');
});
server.addAppApi('/stoptest', (req, res) => {});

import { terminalConfig } from '../share/main-proc/terminal-config/terminal-config';
import { BreakpointObserver } from '@angular/cdk/layout';
import { A11y } from 'swiper/dist/js/swiper.esm';
import { randomBytes } from 'crypto';
import { theOddsServ } from './addon/commservwrapper';

console.log('a=' + parseInt('0x12', 10).toString());
server.addAppApi('/test3', (req, res) => {
    let result = true;
    let msgReply = new ByteArrayBuilder();
    msgReply.Append(Buffer.from('ABCD10A$A@@@@.@@$@.@@$@.@@/III/B@@@@@B@'));
    let escAccAcsReply = new MSG_ESC_ACC_ACS_REPLY();

    if (msgReply.GetMsgCode() === 112) {
        result = false;
        escAccAcsReply.errorText = msgReply.GetErrorText();
    } else {
        let offset = 1;
        escAccAcsReply.txn = msgReply.ExtractNF(offset, 4);
        offset += 4;

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
            // customer.AccountNumber = escAccAcsReply.integratedAccNum;
        }
    }
});

export { server1 };

// const placestafftest = new PlaceStaffTest(server);
// placestafftest.init();
// const customertest = new CustomerTest(server);
// customertest.init();

var app1 = require('express')();
var http1 = require('http').Server(app1);
var io1 = require('socket.io')(http1);
app1.get('/', function (req, res) {
    res.send('sam test');
});
var server1 = http1.listen(3346, function () {
    console.log('listening on *:3346');
});
io1.on('connect', (socket: any) => {
    console.log('Connected client on port %s.', this.port);
    socket.on('message', (m: string) => {
        console.log('[server](message): %s', m);
        io1.emit('message', m);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
    socket.on('retryReply_Event', (m: string) => {
        console.log('retryReply_Event');
    });
});
io1.emit('rlogin_9999_20', 'welcome to localhost3346');
