import { logger } from '../share/utils/logs';
import { KioskServer } from '../share/utils/server';
import { BettingServ } from './bettingServ';
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
} from '../share/models/comm-serv/Football/FootballBetObject';
import { StaffListServ } from './staffListServ';
import { internalParam } from '../share/main-proc/internalParam/internalParam';
import { HttpSend } from './httpsend/HttpSend';
import { BCEventSocketIo } from './httpsend/BCEventSocketIo';

const server = new KioskServer();

function commservInit(server: KioskServer) {
    internalParam.msn = 0;
    HttpSend.getInstance().initKioskServer(server);
    BCEventSocketIo.getInstance().initKioskServer(server);
    // const socket1 = io('http://localhost:3346/');
    // socket1.on('connect',() => {
    //     console.log('on connect socketio');
    // });
    // socket1.on('rlogin_9999_20',(msg) => {
    //     console.log('on rlogin_ socketio' + msg);
    //     socket1.emit('retryReply_Event','hh');
    // });
    console.log('commservInit');
}

server.addAppApi('/', (req, res) => {
    console.log('/ map');
    res.setHeader('Content-type', 'text/html');
    res.send('<h1>Welcome Kiosk Comm--Server</h1>');
});

server.addAppApi('/bettingserv/placeracing/:betObj', (req, res, next) => {
    const betObj = JSON.parse(req.params.betObj);
    logger.info('betobject=' + JSON.stringify(betObj));
    BettingServ.Instance.PlaceRacing(betObj, (bet_reply) => {
        res.send(bet_reply);
    });
});

server.addAppApi('/bettingserv/placemarksix/:betObj', (req, res, next) => {
    const betObj = JSON.parse(req.params.betObj);
    logger.info('betobject=' + JSON.stringify(betObj));
    BettingServ.Instance.PlaceMarkSix(betObj, (bet_reply) => {
        res.send(bet_reply);
    });
});

server.addAppApi('/bettingserv/PlaceFootball/:betObj', (req, res, next) => {
    const betObj = FootballBetObject.jsonParse(req.params.betObj);
    logger.info('betobject=' + JSON.stringify(betObj));
    BettingServ.Instance.PlaceFootball(betObj, (bet_reply) => {
        res.send(bet_reply);
    });
});

//******for post request ************/
server.addPostApi('/bettingserv/placeracing', (req, res, next) => {
    const betObj = req.body;
    logger.info('betobject=' + JSON.stringify(betObj));
    BettingServ.Instance.PlaceRacing(betObj, (bet_reply) => {
        res.send(bet_reply);
    });
});

server.addPostApi('/bettingserv/placemarksix', (req, res, next) => {
    const betObj = req.body;
    logger.info('betobject=' + JSON.stringify(betObj));
    BettingServ.Instance.PlaceMarkSix(betObj, (bet_reply) => {
        res.send(bet_reply);
    });
});

server.addPostApi('/bettingserv/PlaceFootball', (req, res, next) => {
    const betObj = FootballBetObject.jsonParse(JSON.stringify(req.body));
    logger.info('betobject=' + JSON.stringify(betObj));
    BettingServ.Instance.PlaceFootball(betObj, (bet_reply) => {
        res.send(bet_reply);
    });
});
//**************************************/

server.addAppApi('/bettingserv/reportWarning/:object', (req, res) => {
    const obj = {
        warningText: '',
        bReportStaff: false,
        AttendingStaffId_QRC: '',
    };
    // server;
    if (validateJsonObjectFormat(req, res, obj)) {
        BettingServ.Instance.reportWarning(req.params.object, (reply) => {
            res.send(reply);
        });
    }
});

server.addAppApi('/staffserv/SignOn/:object', (req, res) => {
    const obj = { staffId: '', staffPin: '' };
    // server;
    if (validateJsonObjectFormat(req, res, obj)) {
        logger.info('SignOn input=' + JSON.stringify(req.params.object));
        StaffServ.Instance.SignOn(req.params.object, (staff_reply) => {
            res.send(staff_reply);
        });
    }
});

server.addAppApi('/staffserv/SignOff/:object', (req, res) => {
    const obj = { shroffSignOff: '' };
    if (validateJsonObjectFormat(req, res, obj)) {
        logger.info('SignOff input=' + JSON.stringify(req.params.object));
        StaffServ.Instance.SignOff(req.params.object, (staff_reply) => {
            res.send(staff_reply);
        });
    }
});

server.addAppApi('/staffserv/ChangePassword/:object', (req, res) => {
    const obj = { staffID: '', oldPassword: '', newPassword: '' };
    if (validateJsonObjectFormat(req, res, obj)) {
        logger.info(
            'ChangePassword input=' + JSON.stringify(req.params.object)
        );
        StaffServ.Instance.ChangePassword(req.params.object, (staff_reply) => {
            res.send(staff_reply);
        });
    }
});

server.addAppApi('/staffserv/GetStaffAuthority/:object', (req, res) => {
    const obj = { staffID: '', password: '', rqtPurpose: 0 };
    if (validateJsonObjectFormat(req, res, obj)) {
        logger.info(
            'GetStaffAuthority input=' + JSON.stringify(req.params.object)
        );
        StaffServ.Instance.GetStaffAuthority(
            req.params.object,
            (staff_reply) => {
                res.send(staff_reply);
            }
        );
    }
});

server.addAppApi('/staffserv/GetRdt/', (req, res) => {
    StaffServ.Instance.GetRdt((staff_reply) => {
        res.send(staff_reply);
    });
});

server.addAppApi('/customerserv/TbDeposit/:object', (req, res) => {
    const obj = { accountNumber: '', amount: 0 };
    if (validateJsonObjectFormat(req, res, obj)) {
        logger.info('TbDeposit input=' + JSON.stringify(req.params.object));
        CustomerServ.Instance.TbDeposit(req.params.object, (customer_reply) => {
            res.send(customer_reply);
        });
    }
});

server.addAppApi('/customerserv/PayBet/:object', (req, res) => {
    const obj = { tsn: '', payMethod: '' };
    if (validateJsonObjectFormat(req, res, obj)) {
        logger.info('PayBet input=' + JSON.stringify(req.params.object));
        CustomerServ.Instance.PayBet(req.params.object, (customer_reply) => {
            res.send(customer_reply);
        });
    }
});

server.addAppApi('/customerserv/QRCAccountRelease/:object', (req, res) => {
    const obj = { qrcValue: '' };
    if (validateJsonObjectFormat(req, res, obj)) {
        logger.info(
            'QRCAccountRelease input=' + JSON.stringify(req.params.object)
        );
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
        logger.info(
            'QRCAccountAccess input=' + JSON.stringify(req.params.object)
        );
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
        // BCServ.Instance.BCConnTest(req.params.object, (customer_reply) => {
        //     res.send(customer_reply);
        // });
        BCServ.Instance.testTkt((customer_reply) => {
            res.send(customer_reply);
        });
    }
});

server.addAppApi('/bcserv/testTkt/', (req, res) => {
    BCServ.Instance.testTkt((customer_reply) => {
        res.send(customer_reply);
    });
});

server.addAppApi('/getBCServerTime', async (req, res) => {
    const ret = await BCServ.Instance.getBCServerTime();
    res.send(ret);
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
    const obj = {
        staffList: {
            staffCard: [
                {
                    staffID: '',
                    cardID: '',
                    attendingStaffId: '',
                    hardwareId: '',
                    windowNumber: '',
                    branchNumber: '',
                },
            ],
        },
    };
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

server.addAppApi('/updateServ/getAPIKey/:token', (req, res) => {
    let object = { authorization: 'Bearer ' + req.params.token };
    if (req.headers.authorization) {
        object = { authorization: req.headers.authorization };
    }
    StaffListServ.Instance.getAPIKey(object, (customer_reply) => {
        res.send(customer_reply);
    });
});

export { server };
commservInit(server);

const placestafftest = new PlaceStaffTest(server);
placestafftest.init();
const customertest = new CustomerTest(server);
customertest.init();
