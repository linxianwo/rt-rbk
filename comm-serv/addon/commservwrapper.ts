import * as bindings from 'bindings';
class OddServWrapper {
    private _wrapper: any;
    static m_instance: OddServWrapper;
    constructor() {
        const addon = require('./addon.node');
        this._wrapper = new addon.CommservWrapper();
    }
    public static getInstance(): OddServWrapper {
        if (!this.m_instance) {
            this.m_instance = new OddServWrapper();
        }
        return this.m_instance;
    }
    public msgFormat(method: number, request: string[], length: number) {
        return this._wrapper.handled(method, request, length);
    }
}
let theOddsServ = OddServWrapper.getInstance();

export { theOddsServ };
