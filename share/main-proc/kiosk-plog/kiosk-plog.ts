import { GlobalFile, readNSave, save } from '../../utils/global-file';
import { KioskPlogContent } from './kiosk-plog-model';
import { existsSync } from 'fs-extra';

class KioskPlog extends GlobalFile<KioskPlogContent> {
    private name = 'KioskPlog.json';

    constructor() {
        super();
        this.initCust = this.initContent; // set a callback for custom init, assign some value to content.
        this.fileName = this.name; // set this file name
        this.init();
    }

    private initContent() {
        //  init the content in memory if nothing read or file not exist.
        if (existsSync(this.filePath) === false) {
            // || !this.content
            // copy kioskPlog config to the local location
            this.resetKioskPlog();
        } else {
            if (!this.content) {
                this.resetKioskPlog();
            }
        }
    }

    @save()
    public resetKioskPlog() {
        let ret = false;

        this.content = null;
        this.content = new KioskPlogContent();
        if (this.content) {
            ret = true;
        }

        return ret;
    }

    @readNSave()
    public get printedReceipt(): number {
        return this.content.printedReceipt;
    }

    public set printedReceipt(value: number) {
        this.content.printedReceipt = value;
    }

    @readNSave()
    public get paperOut(): number {
        return this.content.paperOut;
    }

    public set paperOut(value: number) {
        this.content.paperOut = value;
    }

    @readNSave()
    public get paperJammed(): number {
        return this.content.paperJammed;
    }

    public set paperJammed(value: number) {
        this.content.paperJammed = value;
    }

    @readNSave()
    public get printerFault(): number {
        return this.content.printerFault;
    }

    public set printerFault(value: number) {
        this.content.printerFault = value;
    }

    @readNSave()
    public get qrcError(): number {
        return this.content.qrcError;
    }

    public set qrcError(value: number) {
        this.content.qrcError = value;
    }

    @readNSave()
    public get nfcError(): number {
        return this.content.nfcError;
    }

    public set nfcError(value: number) {
        this.content.nfcError = value;
    }

    @readNSave()
    public get commLineUbcError(): number {
        return this.content.commLineUbcError;
    }

    public set commLineUbcError(value: number) {
        this.content.commLineUbcError = value;
    }

    @readNSave()
    public get commLineWebError(): number {
        return this.content.commLineWebError;
    }

    public set commLineWebError(value: number) {
        this.content.commLineWebError = value;
    }

    @readNSave()
    public get commLineCbgwError(): number {
        return this.content.commLineCbgwError;
    }

    public set commLineCbgwError(value: number) {
        this.content.commLineCbgwError = value;
    }

    @readNSave()
    public get helpLightError(): number {
        return this.content.helpLightError;
    }

    public set helpLightError(value: number) {
        this.content.helpLightError = value;
    }

    @readNSave()
    public get doorSensorError(): number {
        return this.content.doorSensorError;
    }

    public set doorSensorError(value: number) {
        this.content.doorSensorError = value;
    }

    @readNSave()
    public get scanFed(): number {
        return this.content.scanFed;
    }

    public set scanFed(value: number) {
        this.content.scanFed = value;
    }

    @readNSave()
    public get scanJammed(): number {
        return this.content.scanJammed;
    }

    public set scanJammed(value: number) {
        this.content.scanJammed = value;
    }

    @readNSave()
    public get scanRead(): number {
        return this.content.scanRead;
    }

    public set scanRead(value: number) {
        this.content.scanRead = value;
    }

    @readNSave()
    public get scanFault(): number {
        return this.content.scanFault;
    }

    public set scanFault(value: number) {
        this.content.scanFault = value;
    }

    @readNSave()
    public get tktMarking(): number {
        return this.content.tktMarking;
    }

    public set tktMarking(value: number) {
        this.content.tktMarking = value;
    }

    @readNSave()
    public get printerErrorCode(): number {
        return this.content.printerErrorCode;
    }

    public set printerErrorCode(value: number) {
        this.content.printerErrorCode = value;
    }
    @readNSave()
    public get scanErrorCode(): number {
        return this.content.scanErrorCode;
    }

    public set scanErrorCode(value: number) {
        this.content.scanErrorCode = value;
    }
    @readNSave()
    public get nfcErrorCode(): number {
        return this.content.nfcErrorCode;
    }

    public set nfcErrorCode(value: number) {
        this.content.nfcErrorCode = value;
    }
    @readNSave()
    public get qrcErrorCode(): number {
        return this.content.qrcErrorCode;
    }

    public set qrcErrorCode(value: number) {
        this.content.qrcErrorCode = value;
    }

    @readNSave()
    public get helplightErrorCode(): number {
        return this.content.helplightErrorCode;
    }

    public set helplightErrorCode(value: number) {
        this.content.helplightErrorCode = value;
    }

    @readNSave()
    public get monitorErrorCode(): number {
        return this.content.monitorErrorCode;
    }

    public set monitorErrorCode(value: number) {
        this.content.monitorErrorCode = value;
    }

    @readNSave()
    public get reqRacingTimeStamp(): string {
        return this.content.reqRacingTimeStamp;
    }

    public set reqRacingTimeStamp(value: string) {
        this.content.reqRacingTimeStamp = value;
    }

    @readNSave()
    public get resRacingTimeStamp(): string {
        return this.content.resRacingTimeStamp;
    }

    public set resRacingTimeStamp(value: string) {
        this.content.resRacingTimeStamp = value;
    }

    @readNSave()
    public get reqFootballTimeStamp(): string {
        return this.content.reqFootballTimeStamp;
    }

    public set reqFootballTimeStamp(value: string) {
        this.content.reqFootballTimeStamp = value;
    }

    @readNSave()
    public get resFootballTimeStamp(): string {
        return this.content.resFootballTimeStamp;
    }

    public set resFootballTimeStamp(value: string) {
        this.content.resFootballTimeStamp = value;
    }
}

const kioskPlog = new KioskPlog();
kioskPlog.read();

export { kioskPlog };
