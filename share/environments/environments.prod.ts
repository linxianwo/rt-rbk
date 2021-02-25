import * as os from 'os';

export const AppConfig = {
    production: true,
    _environment: 'PROD',
    _hwEnv: 'PROD',
    kioskFolder: os.homedir() + '/.Kiosk',

    get hwEnv() {
        return this._hwEnv.toUpperCase();
    },
    get environment() {
        return this._environment.toUpperCase();
    },
};
