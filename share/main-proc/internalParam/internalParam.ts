import { GlobalFile, readNSave, save } from '../../utils/global-file';
import { InternalContent } from './internalParam-model';
import { existsSync } from 'fs-extra';

class InternalParam extends GlobalFile<InternalContent> {
    private name = 'InternalParam.json';

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
            this.resetInternalParam();
        } else {
            if (!this.content) {
                this.resetInternalParam();
            }
        }
    }

    @save()
    public resetInternalParam() {
        let ret = false;

        this.content = null;
        this.content = new InternalContent();
        if (this.content) {
            ret = true;
        }

        return ret;
    }

    @readNSave()
    public get msn(): number {
        return this.content.msn;
    }

    public set msn(value: number) {
        this.content.msn = value;
    }

    @readNSave()
    public get currentDate(): number {
        return this.content.currentDate;
    }

    public set currentDate(value: number) {
        this.content.currentDate = value;
    }

    @readNSave()
    public get signonTime(): string {
        return this.content.signonTime;
    }

    public set signonTime(value: string) {
        this.content.signonTime = value;
    }
}

const internalParam = new InternalParam();
internalParam.read();

export { internalParam };
