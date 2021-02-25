import { configs, TerminalConfigs } from './configs-model';
import { existsSync, writeFileSync, readFileSync } from 'fs';
import * as _ from 'lodash';
import { GlobalFile, readNSave } from '../../../share/utils/global-file';
import { logger } from '../../../share/utils/logs';
import { FBPoolTypeStr } from '../../models/render/poolTypeStr';
import { Configs } from './configs.enum';

class TerminalConfig extends GlobalFile<TerminalConfigs> {
    private name = 'terminal-config.json';
    private fileBackup = '.backup';

    constructor() {
        super();
        this.fileName = this.name; // set this file name
        this.initCust = this.initContent; // set a callback for custom init, assign some value to content.
        this.init();
    }

    public get configs(): TerminalConfigs {
        return this.content;
    }

    private initContent() {
        if (existsSync(this.filePath) === false) {
            // || !this.content
            // copy terminal config to the local location
            if (!this.recover()) {
                this.setDefaultConfigs();
            }
        } else {
            if (this.content && this.content.configVersion) {
                this.upgradeConfigFile();
            } else {
                if (!this.recover()) {
                    this.setDefaultConfigs();
                    // this.fileContentDirtied = true; // after init & file dirtied, the read & save will not from file but default configs
                    logger.fatal(
                        'The config file is dirtied, app cannot run properly!'
                    );
                }
            }
        }
    }

    private upgradeConfigFile() {
        // store old setting to new configs
        try {
            if (this.content.configVersion !== configs.configVersion) {
                const newIndicatorFootball = this.content.supervisorConfig
                    .poolEnabledIndicator.football;
                const judgeCondition =
                    (newIndicatorFootball[0].name === FBPoolTypeStr.FCS &&
                        newIndicatorFootball[1].name === FBPoolTypeStr.FHA) ||
                    (newIndicatorFootball[1].name === FBPoolTypeStr.FCS &&
                        newIndicatorFootball[0].name === FBPoolTypeStr.FHA &&
                        newIndicatorFootball.length === 2);
                if (!judgeCondition) {
                    this.content.supervisorConfig.poolEnabledIndicator.football = [
                        { name: FBPoolTypeStr.FCS, selected: false },
                        { name: FBPoolTypeStr.FHA, selected: false },
                    ];
                }

                this.replaceNotConfigurable();
                _.merge(configs, this.content);
                this.content = configs;
            }
        } catch (error) {
            logger.error(error);
        }
    }

    private replaceNotConfigurable() {
        this.content.configVersion = configs.configVersion;
        this.content.terminalFunction.version =
            configs.terminalFunction.version;
        // slide, receipt, extension, appVersion.
        this.content.internalParam.slideVersion =
            configs.internalParam.slideVersion;
        this.content.internalParam.receiptVersion =
            configs.internalParam.receiptVersion;
        this.content.internalParam.receiptExtension =
            configs.internalParam.receiptExtension;
        this.content.internalParam.appVersion =
            configs.internalParam.appVersion;
        // this.content.bcConfig = configs.bcConfig;
    }

    private setDefaultConfigs() {
        this.content = configs;
        logger.fatal('terminal config is set to default!');
    }

    private recover() {
        let ret = false;
        if (existsSync(`${this.filePath}${this.fileBackup}`) === true) {
            try {
                const val = readFileSync(
                    `${this.filePath}${this.fileBackup}`,
                    'utf8'
                );
                this.content = JSON.parse(val);
                this.save();
                ret = true;
                logger.info(`config file recover succeeded`);
            } catch (error) {
                logger.error(`config file recover failed : ${error}`);
            }
        }
        return ret;
    }

    public backup() {
        if (this.content && this.content.configVersion) {
            try {
                const val = JSON.stringify(this.content);
                JSON.parse(val); // prevent incorrect format of content
                if (val.length > 2000) {
                    writeFileSync(`${this.filePath}${this.fileBackup}`, val);
                }
            } catch (error) {
                logger.error(`backup terminal config failed: ${error}`);
            }
        } else {
            logger.error(`backup terminal config failed: cotent is empty`);
        }
    }

    // ---------------get set property---------------------------
    //      ----------terminal function---------------
    @readNSave()
    public get hardwareId() {
        return this.configs.terminalFunction.hardwareId;
    }
    public set hardwareId(val: string) {
        this.configs.terminalFunction.hardwareId = val;
    }

    @readNSave()
    public get branchNumber() {
        return this.configs.terminalFunction.branchNumber;
    }
    public set branchNumber(val: string) {
        this.configs.terminalFunction.branchNumber = val;
    }

    @readNSave()
    public get windowNumber() {
        return this.configs.terminalFunction.windowNumber;
    }
    public set windowNumber(val: string) {
        this.configs.terminalFunction.windowNumber = val;
    }

    @readNSave()
    public get ipAddress() {
        return this.configs.terminalFunction.ipAddress;
    }
    public set ipAddress(val: string) {
        this.configs.terminalFunction.ipAddress = val;
    }

    @readNSave()
    public get onCourse() {
        return this.configs.terminalFunction.onCourse;
    }
    public set onCourse(val: boolean) {
        this.configs.terminalFunction.onCourse = val;
    }
    @readNSave()
    public get phantomGroup() {
        return this.configs.terminalFunction.phantomGroup;
    }

    public set phantomGroup(val: number) {
        this.configs.terminalFunction.phantomGroup = val;
    }

    @readNSave()
    public get version() {
        return this.configs.terminalFunction.version;
    }

    @readNSave()
    public get terminalMode() {
        return this.configs.terminalFunction.terminalMode;
    }
    public set terminalMode(val: string) {
        this.configs.terminalFunction.terminalMode = val;
    }

    @readNSave()
    public get informationSource() {
        return this.configs.terminalFunction.informationSource;
    }
    public set informationSource(val: string) {
        this.configs.terminalFunction.informationSource = val;
    }

    @readNSave()
    public get scanner() {
        return this.configs.terminalFunction.scanner;
    }
    public set scanner(val: boolean) {
        this.configs.terminalFunction.scanner = val;
    }

    @readNSave()
    public get markSixUrl() {
        return this.configs.infoConfig.markSixUrl;
    }
    public set markSixUrl(val: string) {
        this.configs.infoConfig.markSixUrl = val;
    }

    @readNSave()
    public get racingZhUrl() {
        return this.configs.infoConfig.racingZhUrl;
    }
    public set racingZhUrl(val: string) {
        this.configs.infoConfig.racingZhUrl = val;
    }

    @readNSave()
    public get racingEnUrl() {
        return this.configs.infoConfig.racingEnUrl;
    }
    public set racingEnUrl(val: string) {
        this.configs.infoConfig.racingEnUrl = val;
    }

    @readNSave()
    public get FootballAllOddsUrl() {
        return this.configs.infoConfig.footballAllOddsUrl;
    }
    public set FootballAllOddsUrl(val: string) {
        this.configs.infoConfig.footballAllOddsUrl = val;
    }

    @readNSave()
    public get FootballAllUpUrl() {
        return this.configs.infoConfig.footballAllUpUrl;
    }
    public set FootballAllUpUrl(val: string) {
        this.configs.infoConfig.footballAllUpUrl = val;
    }

    @readNSave()
    public get FootballInPlayMatchesUrl() {
        return this.configs.infoConfig.footballInPlayMatchesUrl;
    }
    public set FootballInPlayMatchesUrl(val: string) {
        this.configs.infoConfig.footballInPlayMatchesUrl = val;
    }

    @readNSave()
    public get proxyA() {
        return this.configs.infoConfig.proxyA;
    }
    public set proxyA(val: string) {
        this.configs.infoConfig.proxyA = val;
    }

    @readNSave()
    public get proxyB() {
        return this.configs.infoConfig.proxyB;
    }
    public set proxyB(val: string) {
        this.configs.infoConfig.proxyB = val;
    }

    // proxy
    @readNSave()
    public get proxyMarkSixInterval() {
        return isNaN(this.configs.infoConfig.proxy.markSix_interval)
            ? 30000
            : this.configs.infoConfig.proxy.markSix_interval;
    }
    public set proxyMarkSixInterval(val: number) {
        this.configs.infoConfig.proxy.markSix_interval = val;
    }

    @readNSave()
    public get proxyRacingInterval() {
        return isNaN(this.configs.infoConfig.proxy.racing_interval)
            ? 30000
            : this.configs.infoConfig.proxy.racing_interval;
    }
    public set proxyRacingInterval(val: number) {
        this.configs.infoConfig.proxy.racing_interval = val;
    }

    @readNSave()
    public get proxyFootballNonInPlayInterval() {
        return isNaN(this.configs.infoConfig.proxy.football_non_inplay_interval)
            ? 60000
            : this.configs.infoConfig.proxy.football_non_inplay_interval;
    }
    public set proxyFootballNonInPlayInterval(val: number) {
        this.configs.infoConfig.proxy.football_non_inplay_interval = val;
    }

    @readNSave()
    public get proxyFootballInPlayInterval() {
        return isNaN(this.configs.infoConfig.proxy.football_inplay_interval)
            ? 20000
            : this.configs.infoConfig.proxy.football_inplay_interval;
    }
    public set proxyFootballInPlayInterval(val: number) {
        this.configs.infoConfig.proxy.football_inplay_interval = val;
    }

    // nonProxy
    @readNSave()
    public get nonProxyMarkSixInterval() {
        return isNaN(this.configs.infoConfig.nonProxy.markSix_interval)
            ? 30000
            : this.configs.infoConfig.nonProxy.markSix_interval;
    }
    public set nonProxyMarkSixInterval(val: number) {
        this.configs.infoConfig.nonProxy.markSix_interval = val;
    }

    @readNSave()
    public get nonProxyRacingInterval() {
        return isNaN(this.configs.infoConfig.nonProxy.racing_interval)
            ? 30000
            : this.configs.infoConfig.nonProxy.racing_interval;
    }
    public set nonProxyRacingInterval(val: number) {
        this.configs.infoConfig.nonProxy.racing_interval = val;
    }

    @readNSave()
    public get nonProxyFootballNonInPlayInterval() {
        return isNaN(
            this.configs.infoConfig.nonProxy.football_non_inplay_interval
        )
            ? 60000
            : this.configs.infoConfig.nonProxy.football_non_inplay_interval;
    }
    public set nonProxyFootballNonInPlayInterval(val: number) {
        this.configs.infoConfig.nonProxy.football_non_inplay_interval = val;
    }

    @readNSave()
    public get nonProxyFootballInPlayInterval() {
        return isNaN(this.configs.infoConfig.nonProxy.football_inplay_interval)
            ? 20000
            : this.configs.infoConfig.nonProxy.football_inplay_interval;
    }
    public set nonProxyFootballInPlayInterval(val: number) {
        this.configs.infoConfig.nonProxy.football_inplay_interval = val;
    }

    @readNSave()
    public get saveJsonData() {
        return this.configs.infoConfig.saveJson;
    }
    public set saveJsonData(val: boolean) {
        this.configs.infoConfig.saveJson = val;
    }
    //      -----------------service config-----------------
    @readNSave()
    public get touchScreenBet() {
        return this.configs.serviceConfig.touchScreenBet;
    }
    public set touchScreenBet(val: boolean) {
        this.configs.serviceConfig.touchScreenBet = val;
    }

    @readNSave()
    public get mainlineOnTop() {
        return this.configs.serviceConfig.mainlineOnTop;
    }
    public set mainlineOnTop(val: boolean) {
        this.configs.serviceConfig.mainlineOnTop = val;
    }

    @readNSave()
    public get demoMode() {
        return this.configs.serviceConfig.demoMode;
    }
    public set demoMode(val: boolean) {
        this.configs.serviceConfig.demoMode = val;
    }

    @readNSave()
    public get selfPickMk6() {
        return this.configs.serviceConfig.selfPickMk6;
    }
    public set selfPickMk6(val: boolean) {
        this.configs.serviceConfig.selfPickMk6 = val;
    }

    @readNSave()
    public get mk6Selling() {
        return this.configs.serviceConfig.mk6Selling;
    }
    public set mk6Selling(val: boolean) {
        this.configs.serviceConfig.mk6Selling = val;
    }

    @readNSave()
    public get selfPickRace() {
        return this.configs.serviceConfig.selfPickRace;
    }
    public set selfPickRace(val: boolean) {
        this.configs.serviceConfig.selfPickRace = val;
    }

    @readNSave()
    public get selfPickFB() {
        return this.configs.serviceConfig.selfPickFB;
    }
    public set selfPickFB(val: boolean) {
        this.configs.serviceConfig.selfPickFB = val;
    }

    @readNSave()
    public get kioskLang() {
        return this.configs.serviceConfig.kioskLang;
    }
    public set kioskLang(val: boolean) {
        this.configs.serviceConfig.kioskLang = val;
    }

    @readNSave()
    public get customerLang() {
        return this.configs.serviceConfig.customerLang;
    }
    public set customerLang(val: boolean) {
        this.configs.serviceConfig.customerLang = val;
    }
    //      -----------------SupervisorConfig-----------------
    @readNSave()
    public get svtTimeOut() {
        return this.configs.supervisorConfig.svtTimeOut;
    }
    public set svtTimeOut(val: number) {
        this.configs.supervisorConfig.svtTimeOut = val;
    }

    @readNSave()
    public get cvDepTimeOut() {
        return this.configs.supervisorConfig.cvDepTimeOut;
    }
    public set cvDepTimeOut(val: number) {
        this.configs.supervisorConfig.cvDepTimeOut = val;
    }

    @readNSave()
    public get fpsTimeOut() {
        return this.configs.supervisorConfig.fpsTimeOut;
    }
    public set fpsTimeOut(val: number) {
        this.configs.supervisorConfig.fpsTimeOut = val;
    }

    @readNSave()
    public get countDTimeOut() {
        return this.configs.supervisorConfig.countDTimeOut;
    }
    public set countDTimeOut(val: number) {
        this.configs.supervisorConfig.countDTimeOut = val;
    }

    @readNSave()
    public get errMsgTimeOut() {
        return this.configs.supervisorConfig.errMsgTimeOut;
    }
    public set errMsgTimeOut(val: number) {
        this.configs.supervisorConfig.errMsgTimeOut = val;
    }

    @readNSave()
    // default race bet type
    public get defaultPool() {
        const pools = this.configs.supervisorConfig.defaultRaceBetType.racing;
        const index = _.findIndex(pools, ['selected', true]);
        if (index > -1) {
            return pools[index].name;
        } else {
            return 'WIN';
        }
    }

    @readNSave()
    public get betAcpMsgDisTime() {
        return this.configs.supervisorConfig.betAcpMsgDisTime;
    }
    public set betAcpMsgDisTime(val: number) {
        this.configs.supervisorConfig.betAcpMsgDisTime = val;
    }

    @readNSave()
    public get printReceipt() {
        return this.configs.supervisorConfig.printReceipt;
    }
    public set printReceipt(val: boolean) {
        this.configs.supervisorConfig.printReceipt = val;
    }

    @readNSave()
    public get betSlipReceiptDlg() {
        return this.configs.supervisorConfig.betSlipReceiptDlg;
    }
    public set betSlipReceiptDlg(val: boolean) {
        this.configs.supervisorConfig.betSlipReceiptDlg = val;
    }

    @readNSave()
    public get newIndicator() {
        return this.configs.supervisorConfig.newIndicator;
    }
    public set newIndicator(val: any) {
        this.configs.supervisorConfig.newIndicator = val;
    }

    @readNSave()
    public get specialIndicator() {
        return this.configs.supervisorConfig.specialIndicator;
    }
    public set specialIndicator(val: any) {
        this.configs.supervisorConfig.specialIndicator = val;
    }

    @readNSave()
    public get poolEnabledIndicator() {
        return this.configs.supervisorConfig.poolEnabledIndicator;
    }
    public set poolEnabledIndicator(val: any) {
        this.configs.supervisorConfig.poolEnabledIndicator = val;
    }

    @readNSave()
    public get terminalPIN() {
        return this.configs.supervisorConfig.terminalPIN;
    }
    public set terminalPIN(val: string) {
        this.configs.supervisorConfig.terminalPIN = val;
    }

    @readNSave()
    public get FPS() {
        return this.configs.supervisorConfig.FPS;
    }
    public set FPS(val: boolean) {
        this.configs.supervisorConfig.FPS = val;
    }

    @readNSave()
    public get actBlcDisDuration() {
        return this.configs.supervisorConfig.actBlcDisDuration;
    }
    public set actBlcDisDuration(val: number) {
        this.configs.supervisorConfig.actBlcDisDuration = val;
    }

    @readNSave()
    public get ubcMode() {
        return this.configs.supervisorConfig.ubcMode;
    }
    public set ubcMode(val: string) {
        this.configs.supervisorConfig.ubcMode = val;
    }

    @readNSave()
    public get networkMode() {
        return this.configs.supervisorConfig.networkMode;
    }
    public set networkMode(val: string) {
        this.configs.supervisorConfig.networkMode = val;
        this.configs.supervisorConfig.txnNetworkMode = val;
        this.configs.supervisorConfig.infoNetworkMode = val;
        // if (val === Configs.NETWORK_4G || val === Configs.NETWORK_WIFI) {
        if (this.configs.env !== Configs.ENV_UAT) {
            if (val === Configs.NETWORK_4G) {
                this.configs.supervisorConfig.ubcMode = Configs.UBC_MODE_REM;
                this.configs.bcConfig.BC01a_url =
                    'https://10.245.17.51:8001/kiosk/';
                this.configs.bcConfig.BC02a_url =
                    'https://10.245.17.53:8001/kiosk/';
                this.configs.bcConfig.BC01b_url =
                    'https://10.245.17.52:8001/kiosk/';
                this.configs.bcConfig.BC02b_url =
                    'https://10.245.17.54:8001/kiosk/';
                // even
                if (
                    Math.round(
                        Number(this.configs.terminalFunction.windowNumber)
                    ) %
                    2 ===
                    0
                ) {
                    this.configs.bcConfig.BCStaffList1a_url =
                        'https://10.245.17.53:8002';
                    this.configs.bcConfig.BCStaffList1b_url =
                        'https://10.245.17.54:8002';
                    this.configs.bcConfig.BCUpdateServ1a_url =
                        'http://10.245.17.53:8003';
                    this.configs.bcConfig.BCUpdateServ1b_url =
                        'http://10.245.17.54:8003';
                } else {
                    // odd
                    this.configs.bcConfig.BCStaffList1a_url =
                        'https://10.245.17.51:8002';
                    this.configs.bcConfig.BCStaffList1b_url =
                        'https://10.245.17.52:8002';
                    this.configs.bcConfig.BCUpdateServ1a_url =
                        'http://10.245.17.51:8003';
                    this.configs.bcConfig.BCUpdateServ1b_url =
                        'http://10.245.17.52:8003';
                }
            } else {
                this.configs.supervisorConfig.ubcMode = Configs.UBC_MODE_LOC;
                this.configs.bcConfig.BC01a_url =
                    'http://localhost:5005/ubc/sendToBCA';
                this.configs.bcConfig.BC02a_url =
                    'http://localhost:5005/ubc/sendToBCA';
                this.configs.bcConfig.BC01b_url =
                    'http://localhost:5005/ubc/sendToBCB';
                this.configs.bcConfig.BC02b_url =
                    'http://localhost:5005/ubc/sendToBCB';
                const ip253 =
                    this.configs.terminalFunction.ipAddress.substr(
                        0,
                        this.configs.terminalFunction.ipAddress.lastIndexOf('.')
                    ) + '.253';
                const ip254 =
                    this.configs.terminalFunction.ipAddress.substr(
                        0,
                        this.configs.terminalFunction.ipAddress.lastIndexOf('.')
                    ) + '.254';

                // even
                if (
                    Math.round(
                        Number(this.configs.terminalFunction.windowNumber)
                    ) %
                    2 ===
                    0
                ) {
                    this.configs.bcConfig.BCStaffList1a_url =
                        'https://' + ip253 + ':8002';
                    this.configs.bcConfig.BCStaffList1b_url =
                        'https://' + ip254 + ':8002';
                    this.configs.bcConfig.BCUpdateServ1a_url =
                        'http://' + ip253 + ':8003';
                    this.configs.bcConfig.BCUpdateServ1b_url =
                        'http://' + ip254 + ':8003';
                    this.configs.ubcConfig.defaultIP = ip253;
                    this.configs.ubcConfig.bcIPA = ip253;
                    this.configs.ubcConfig.bcIPB = ip254;
                } else {
                    // odd
                    this.configs.bcConfig.BCStaffList1a_url =
                        'https://' + ip254 + ':8002';
                    this.configs.bcConfig.BCStaffList1b_url =
                        'https://' + ip253 + ':8002';
                    this.configs.bcConfig.BCUpdateServ1a_url =
                        'http://' + ip254 + ':8003';
                    this.configs.bcConfig.BCUpdateServ1b_url =
                        'http://' + ip253 + ':8003';
                    this.configs.ubcConfig.defaultIP = ip254;
                    this.configs.ubcConfig.bcIPA = ip253;
                    this.configs.ubcConfig.bcIPB = ip254;
                }
            }
        }
    }

    @readNSave()
    public get infoNetworkMode() {
        return this.configs.supervisorConfig.infoNetworkMode;
    }
    public set infoNetworkMode(val: string) { }

    @readNSave()
    public get racingMk6DataRouteSwitcher() {
        return this.configs.supervisorConfig.racingMk6DataRouteSwitcher;
    }
    public set racingMk6DataRouteSwitcher(val: number) {
        this.configs.supervisorConfig.racingMk6DataRouteSwitcher = val;
    }
    @readNSave()
    public get txnNetworkMode() {
        return this.configs.supervisorConfig.txnNetworkMode;
    }
    public set txnNetworkMode(val: string) { }
    // -----------------get set property end-----------------
    // ---------------get set property---------------------------
    //      ----------InternalParam function---------------
    // msn: number;
    // currentDate: number;
    // slideVersion: number;
    // receiptVersion: number;
    // appVersion: number;
    // signonTime: number;
    @readNSave()
    public get msn() {
        return this.configs.internalParam.msn;
    }
    public set msn(val: number) {
        this.configs.internalParam.msn = val;
    }

    @readNSave()
    public get currentDate() {
        return this.configs.internalParam.currentDate;
    }
    public set currentDate(val: number) {
        this.configs.internalParam.currentDate = val;
    }

    @readNSave()
    public get slideVersion() {
        let ret = this.configs.internalParam.slideVersion;
        if (typeof this.configs.internalParam.slideVersion === 'string') {
            ret = parseInt(this.configs.internalParam.slideVersion, 10);
            ret = ret ? ret : 0;
        }
        return ret;
    }
    public set slideVersion(val: number) {
        this.configs.internalParam.slideVersion = val;
    }

    @readNSave()
    public get receiptVersion() {
        let ret = this.configs.internalParam.receiptVersion;
        if (typeof this.configs.internalParam.receiptVersion === 'string') {
            ret = parseInt(this.configs.internalParam.receiptVersion, 10);
            ret = ret ? ret : 0;
        }
        return ret;
    }
    public set receiptVersion(val: number) {
        this.configs.internalParam.receiptVersion = val;
    }

    @readNSave()
    public get receiptExtension() {
        return this.configs.internalParam.receiptExtension;
    }
    public set receiptExtension(val: string) {
        this.configs.internalParam.receiptExtension = val;
    }

    @readNSave()
    public get appVersion() {
        let ret = this.configs.internalParam.appVersion;
        if (typeof this.configs.internalParam.appVersion === 'string') {
            ret = parseInt(this.configs.internalParam.appVersion, 10);
            ret = ret ? ret : 0;
        }
        return ret;
    }
    public set appVersion(val: number) {
        this.configs.internalParam.appVersion = val;
    }

    @readNSave()
    public get signonTime() {
        return this.configs.internalParam.signonTime;
    }
    public set signonTime(val: string) {
        this.configs.internalParam.signonTime = val;
    }

    @readNSave()
    public get fullPackageVersion() {
        return this.configs.internalParam.fullPackageVersion;
    }
    public set fullPackageVersion(val: string) {
        this.configs.internalParam.fullPackageVersion = val;
    }
    // ---------------other function---------------------------
    @readNSave()
    public get softwareVersion() {
        return this.configs.softwareVersion;
    }
    public set softwareVersion(val: string) {
        this.configs.softwareVersion = val;
    }
    @readNSave()
    public get defaultIP() {
        return this.configs.ubcConfig.defaultIP;
    }
    public set defaultIP(val: string) {
        this.configs.ubcConfig.defaultIP = val;
    }
    @readNSave()
    public get bcIPA() {
        return this.configs.ubcConfig.bcIPA;
    }
    public set bcIPA(val: string) {
        this.configs.ubcConfig.bcIPA = val;
    }
    @readNSave()
    public get bcIPB() {
        return this.configs.ubcConfig.bcIPB;
    }
    public set bcIPB(val: string) {
        this.configs.ubcConfig.bcIPB = val;
    }
    @readNSave()
    public get timeout() {
        return this.configs.ubcConfig.timeout;
    }
    public set timeout(val: number) {
        this.configs.ubcConfig.timeout = val;
    }
    @readNSave()
    public get broadcastEndpointt() {
        return this.configs.ubcConfig.broadcastEndpoint;
    }
    public set broadcastEndpoint(val: string) {
        this.configs.ubcConfig.broadcastEndpoint = val;
    }
    @readNSave()
    public get apiKey() {
        return this.configs.infoConfig.apiKey;
    }
    public set apiKey(val: string) {
        this.configs.infoConfig.apiKey = val;
    }

    @readNSave()
    public get logLevel() {
        return this.content.internalParam.logLevel;
    }
    public set logLevel(level: string) {
        this.content.internalParam.logLevel = level;
    }
}

const terminalConfig = new TerminalConfig();
if (logger && logger.level) {
    logger.level = terminalConfig.logLevel;
    logger.fatal('log level set to:' + logger.level);
}

export { terminalConfig };
