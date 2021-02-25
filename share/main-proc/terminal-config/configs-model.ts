import { PoolTypeStr, FBPoolTypeStr } from '../../models/render/poolTypeStr';
import { Configs, RouteSwitcher } from './configs.enum';
import * as _ from 'lodash';

interface Pools {
    name: string;
    selected: boolean;
}

interface PoolList {
    racing: Pools[];
    football: Pools[];
}
interface TerminalFunction {
    // TerminalFunction.hardwareId.val
    hardwareId: string; // Kiosk hardware id, cannot be reset to other value
    branchNumber: string;
    windowNumber: string;
    ipAddress: string; // Kiosk fixed IP address
    onCourse: boolean; // on(true) or off(false) course
    phantomGroup: number;
    version: string; // Kiosk app version, release ver + printer template ver
    terminalMode: string; // online or offline
    informationSource: string; // the information source option, e.g. 'WEB'
    scanner: boolean; // true enable scanner
}

interface ServiceConfig {
    touchScreenBet: boolean; // support(true) touch screen betting,
    // if disable(false) all self pick ignore
    mainlineOnTop: boolean;
    demoMode: boolean; // customer can go inside bet screen without login
    selfPickMk6: boolean; // bet type page display mk6 button or not
    mk6Selling: boolean; // bet type page control self-pick and Bet slip selling
    selfPickRace: boolean; // bet type page display racing button or not
    selfPickFB: boolean; // bet type page display football button or not
    kioskLang: boolean; // if Chinese(true), homepage = Chinese & receipt print = bilingual
    // if English(false) homepage = English & receipt printing = English, original value copy
    customerLang: boolean; // copy the kiosk languag each time when customer log out, i.e. restore
}

interface SupervisorConfig {
    svtTimeOut: number; // if val == 0, the terminal will not timeout, this counting include all page but first page.
    // If timeout popup a count down dialog
    cvDepTimeOut: number; // CV deposit page timeout, also for fps
    fpsTimeOut: number; // fps transaction timeout
    countDTimeOut: number; // count down dialog dismiss time
    errMsgTimeOut: number; // error dialog dismiss time
    defaultRaceBetType: PoolList;
    betAcpMsgDisTime: number; // bet accepted msg dismiss time
    printReceipt: boolean; // if true, the betting screen will display
    // two buttons, bet slip betting popup a dialog
    // to ask print or not.
    // if false, the betting screen display one button.
    betSlipReceiptDlg: boolean; // to control bet slip betting receipt dialog
    newIndicator: PoolList; // new pools with indicator
    specialIndicator: PoolList; // special pools with indicator
    poolEnabledIndicator: PoolList;
    terminalPIN: string;
    FPS: boolean;
    actBlcDisDuration: number; // Account Balance Display Duration
    ubcMode: string; // the local/remote UBC
    networkMode: string; // the network type, this param is for UI display and control, set method will also set
    // infoNetworkMode & txnNetworkMode
    infoNetworkMode: string; // the infoserv network type, infoServ should use this param
    txnNetworkMode: string; // the commserv and ubc network type
    racingMk6DataRouteSwitcher: number;
}

interface InternalParam {
    msn: number;
    currentDate: number;
    slideVersion: number;
    receiptVersion: number;
    receiptExtension: string;
    appVersion: number;
    signonTime: string;
    fullPackageVersion: string;
    logLevel: string;
}

interface BcConfig {
    BC01a_url: string;
    BC02a_url: string;
    BC01b_url: string;
    BC02b_url: string;
    BCStaffList1a_url: string;
    BCStaffList1b_url: string;
    BCUpdateServ1a_url: string;
    BCUpdateServ1b_url: string;
}

interface InfoConfig {
    markSixUrl: string; // mark6 information url
    racingZhUrl: string; // racing information of Chinese url
    racingEnUrl: string; // racing information of English url
    footballAllOddsUrl: string; // football information of AllOdds url
    footballAllUpUrl: string; // football information of AllUP url
    footballInPlayMatchesUrl: string; // football information of InPlayMatches url
    proxyA: string; // when window number is odd, use proxyA
    proxyB: string; // when window number is even, use proxyB
    apiKey: string; // for infoServ http request
    proxy: Proxy;
    nonProxy: NonProxy;
    saveJson: boolean;
}

interface Proxy {
    markSix_interval: number;
    racing_interval: number;
    football_non_inplay_interval: number;
    football_inplay_interval: number;
}

interface NonProxy {
    markSix_interval: number;
    racing_interval: number;
    football_non_inplay_interval: number;
    football_inplay_interval: number;
}

interface UbcConfig {
    defaultIP: string; // currently connected bc ip
    bcIPA: string;
    bcIPB: string;
    timeout: number;
    broadcastEndpoint: string;
}
export interface TerminalConfigs {
    terminalFunction: TerminalFunction;
    serviceConfig: ServiceConfig;
    supervisorConfig: SupervisorConfig;
    internalParam: InternalParam;
    env: string;
    configVersion: string;
    softwareVersion: string;
    bcConfig: BcConfig;
    infoConfig: InfoConfig;
    ubcConfig: UbcConfig;
}

const racingPools: Pools[] = [
    { name: PoolTypeStr.WIN, selected: false },
    { name: PoolTypeStr.PLA, selected: false },
    { name: PoolTypeStr.WP, selected: false },
    { name: PoolTypeStr.QIN, selected: false },
    { name: PoolTypeStr.QPL, selected: false },
    { name: PoolTypeStr.QQP, selected: false },
    { name: PoolTypeStr.TCE, selected: false },
    { name: PoolTypeStr.QTT, selected: false },
    { name: PoolTypeStr.TRI, selected: false },
    { name: PoolTypeStr.FF, selected: false },
    { name: PoolTypeStr.DBL, selected: false },
    { name: PoolTypeStr.TBL, selected: false },
    { name: PoolTypeStr.DT, selected: false },
    { name: PoolTypeStr.TT, selected: false },
    { name: PoolTypeStr.SIXUP, selected: false },
    { name: PoolTypeStr.JKC, selected: false },
    // { name: PoolTypeStr.TNC, selected: false },
    { name: PoolTypeStr.IWIN, selected: false },
    { name: PoolTypeStr.CWA, selected: false },
    { name: PoolTypeStr.CWB, selected: false },
    { name: PoolTypeStr.CWC, selected: false },
    { name: PoolTypeStr.FCT, selected: false },
];
const footballPools: Pools[] = [
    { name: FBPoolTypeStr.HAD, selected: false },
    { name: FBPoolTypeStr.FHA, selected: false },
    { name: FBPoolTypeStr.HHA, selected: false },
    { name: FBPoolTypeStr.FHD, selected: false },
    { name: FBPoolTypeStr.HDC, selected: false },
    { name: FBPoolTypeStr.HIL, selected: false },
    { name: FBPoolTypeStr.FHL, selected: false },
    { name: FBPoolTypeStr.CHL, selected: false },
    { name: FBPoolTypeStr.CRS, selected: false },
    { name: FBPoolTypeStr.FCS, selected: false },
    { name: FBPoolTypeStr.NTS, selected: false },
    { name: FBPoolTypeStr.BTS, selected: false },
    { name: FBPoolTypeStr.TTG, selected: false },
    { name: FBPoolTypeStr.OOE, selected: false },
    { name: FBPoolTypeStr.FGS, selected: false },
    { name: FBPoolTypeStr.HFT, selected: false },
    { name: FBPoolTypeStr.SPC, selected: false },
    { name: FBPoolTypeStr.DHCP, selected: false },
    { name: FBPoolTypeStr.CHP, selected: false },
    { name: FBPoolTypeStr.TSP, selected: false },
    { name: FBPoolTypeStr.FLT, selected: false },
    { name: FBPoolTypeStr.WCT, selected: false },
    { name: FBPoolTypeStr.WCY, selected: false },
    { name: FBPoolTypeStr.TQL, selected: false },
    { name: FBPoolTypeStr.GPW, selected: false },
    { name: FBPoolTypeStr.GPF, selected: false },
    { name: FBPoolTypeStr.TPS, selected: false },
    { name: FBPoolTypeStr.HFMP, selected: false },
    { name: FBPoolTypeStr.FTS, selected: false },
    { name: FBPoolTypeStr.TTS, selected: false },
];
// const test = ((val) => {
//     const ret = [];
//     val.forEach(poolType => {
//         ret.push({ name: PoolTypeStr[poolType], selected: false });
//     });
//     return ret;
// })(Object.keys(PoolTypeStr));

// console.log(test);

const defRaceBetType_racingPools = _.cloneDeep(racingPools);
const specialIndicator_racingPools = _.cloneDeep(racingPools);
const specialIndicator_footballPools = _.cloneDeep(footballPools);

/*
_.map(racingPools, (pool) => {
    if (!(pool.name === PoolTypeStr.IWIN ||
        pool.name === PoolTypeStr.FCT)) {
        pool.selected = true;
    }
    return pool;
});*/

const defRaceBetType: PoolList = {
    racing: defRaceBetType_racingPools,
    football: [],
};

const newIndicator: PoolList = {
    racing: [
        { name: PoolTypeStr.IWIN, selected: false },
        { name: PoolTypeStr.FCT, selected: false },
    ],
    football: [],
};

const specialIndicator: PoolList = {
    racing: specialIndicator_racingPools,
    football: specialIndicator_footballPools,
};

const poolEnabledIndicator: PoolList = _.cloneDeep(newIndicator);
poolEnabledIndicator.football = [
    { name: FBPoolTypeStr.FCS, selected: false },
    { name: FBPoolTypeStr.FHA, selected: false },
];
/* {
    racing: poolEnabledIndicator_racingPools,
    football: []
};*/

export const configs: TerminalConfigs = {
    terminalFunction: {
        hardwareId: '0B17',
        branchNumber: '0000',
        windowNumber: '20',
        ipAddress: '10.202.1.99',
        onCourse: false,
        phantomGroup: 0,
        version: '08A',
        terminalMode: Configs.Mode_TR,
        informationSource: Configs.InfoSrc_WS_CMC,
        scanner: true,
    },
    serviceConfig: {
        touchScreenBet: true,
        mainlineOnTop: true,
        demoMode: true,
        selfPickMk6: true,
        mk6Selling: true,
        selfPickRace: true,
        selfPickFB: true,
        kioskLang: true,
        customerLang: true,
    },
    supervisorConfig: {
        svtTimeOut: 15,
        cvDepTimeOut: 5,
        fpsTimeOut: 60,
        countDTimeOut: 5,
        errMsgTimeOut: 5,
        defaultRaceBetType: defRaceBetType,
        betAcpMsgDisTime: 3,
        printReceipt: false,
        betSlipReceiptDlg: false,
        newIndicator: newIndicator,
        specialIndicator: specialIndicator,
        poolEnabledIndicator: poolEnabledIndicator,
        terminalPIN: '999999',
        FPS: true,
        actBlcDisDuration: 5,
        ubcMode: Configs.UBC_MODE_REM,
        networkMode: Configs.NETWORK_4G,
        infoNetworkMode: Configs.NETWORK_4G,
        txnNetworkMode: Configs.NETWORK_4G,
        racingMk6DataRouteSwitcher: RouteSwitcher.WebServer,
    },
    internalParam: {
        msn: 0,
        currentDate: Date.now(),
        slideVersion: 22,
        receiptVersion: 12,
        receiptExtension: 'B',
        appVersion: 7, // this app version is not used in commserv, but use terminalfucntion.version
        signonTime: '',
        fullPackageVersion: '1',
        logLevel: 'all',
    },
    env: Configs.ENV_PROD,
    configVersion: '1.6',
    softwareVersion: '0.0.1',
    bcConfig: {
        BC01a_url: 'http://localhost:5005/ubc/sendToBCA', // HV
        BC02a_url: 'http://localhost:5005/ubc/sendToBCA',
        BC01b_url: 'http://localhost:5005/ubc/sendToBCB', // ST
        BC02b_url: 'http://localhost:5005/ubc/sendToBCB',
        BCStaffList1a_url: 'https://10.194.161.78:4568', // HV
        BCStaffList1b_url: 'https://10.194.161.77:4568', // ST                            // ST
        BCUpdateServ1a_url: 'http://10.194.161.78:4567', // HV
        BCUpdateServ1b_url: 'http://10.194.161.77:4567', // ST
    },
    infoConfig: {
        markSixUrl:
            'https://iosbsinfo.qcew.com/infoA/AOSBS/MS01_GetInfo.ashx?QT=MS_INFO&Lang=zh-HK',
        racingZhUrl:
            'https://iosbsinfo.qcew.com/infoA/AOSBS/HR_GetInfo.ashx?QT=HR_ODDS_ALL&Race=*&Venue=*&Result=1&Dividend=1&JTC=1&JKC=1&Lang=zh-HK',
        racingEnUrl:
            'https://iosbsinfo.qcew.com/infoA/AOSBS/HR_GetInfo.ashx?QT=HR_ODDS_ALL&Race=*&Venue=*&Result=1&Dividend=1&JTC=1&JKC=1&Lang=en-US',
        proxyA: '',
        proxyB: '',
        apiKey: '',
        footballAllOddsUrl:
            'https://sp4dinfo.qcew.com/infoS/MASBAI/FB_GetInfo.ashx?QT=FB_ODDS_ALL',
        footballAllUpUrl:
            'https://sp4dinfo.qcew.com/infoS/MASBAI/FB_GetInfo.ashx?QT=CO_ALLUPFORMULA',
        footballInPlayMatchesUrl:
            'https://sp4dinfo.qcew.com/infoS/MASBAI/FB_GetInfo.ashx?QT=FB_ODDS_INPLAY',
        proxy: {
            markSix_interval: 30000,
            racing_interval: 30000,
            football_non_inplay_interval: 60000,
            football_inplay_interval: 10000,
        },
        nonProxy: {
            markSix_interval: 30000,
            racing_interval: 30000,
            football_non_inplay_interval: 60000,
            football_inplay_interval: 10000,
        },
        saveJson: false,
    },
    ubcConfig: {
        defaultIP: '10.194.102.130',
        bcIPA: '10.194.102.130',
        bcIPB: '10.194.102.130',
        timeout: 10,
        broadcastEndpoint: '9104',
    },
};
