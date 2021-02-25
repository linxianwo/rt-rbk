// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `index.ts`, but if you do
// `ng build --env=prod` then `index.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
import * as os from 'os';

export const AppConfig = {
    production: false,
    _environment: 'DEV1',
    _hwEnv: 'DEV',
    kioskFolder: os.homedir() + '/.Kiosk',

    get hwEnv() {
        return this._hwEnv.toUpperCase();
    },
    get environment() {
        return this._environment.toUpperCase();
    },
};
