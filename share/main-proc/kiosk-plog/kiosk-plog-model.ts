// this class to log down info , during app start up till print the log
class KioskPlogContent {
    public printedReceipt = 0; // total receipt printed count
    public paperOut = 0; // total paper out event count
    public paperJammed = 0; // the number of paperJammed
    public printerFault = 0; // printer fault count
    public qrcError = 0; // qrc reader fault count
    public nfcError = 0; // nfc reader fault count
    public commLineUbcError = 0; // connect ubc error count
    public commLineWebError = 0; // connect web error count
    public commLineCbgwError = 0; // connect cbgw error count
    public helpLightError = 0; // help light fault count
    public doorSensorError = 0; // door sensor fault count
    public scanFed = 0; // betslipt scanner fed count
    public scanJammed = 0; // betslipt scanner jammed count
    public scanRead = 0; // betslipt scanner read count
    public scanFault = 0; // betslipt scanner fault count
    public tktMarking = 0; // ticket marking count
    public printerErrorCode = 0; // printer record code
    public scanErrorCode = 0; // scanner record code
    public nfcErrorCode = 0; // nfc record code
    public qrcErrorCode = 0; // qrc record code
    public helplightErrorCode = 0; // helplight record code
    public monitorErrorCode = 0; // systemMonitor record code
    public reqRacingTimeStamp = ''; // request racing xml file time stamp
    public resRacingTimeStamp = ''; // response racing xml file time stamp
    public reqFootballTimeStamp = ''; // request football json file time stamp
    public resFootballTimeStamp = ''; // response football json file time stamp

    constructor() {}
}

export { KioskPlogContent };
