import { AppBase } from '../../share/utils/app-base';
import { BetEngineAPI } from '../../share/protocols/kiosk-api-event';
import { validateBetSlipFormat, sendResponseObject } from './routeShare';
import { validatePayRec } from './slipDataValidate';

class DepositValidate extends AppBase {
    constructor() {
        super();
    }
}

const depositValidate = new DepositValidate();
depositValidate
    .getApp()
    .get(
        `${BetEngineAPI.DEPOSIT_APP_VC_AND_WINNING_TICKET_ENTRY}${BetEngineAPI.PARAMETER_ENTRY}`,
        validateBetSlipFormat,
        validatePayRec,
        sendResponseObject
    );

depositValidate
    .getApp()
    .post(
        `${BetEngineAPI.DEPOSIT_APP_VC_AND_WINNING_TICKET_ENTRY}`,
        validateBetSlipFormat,
        validatePayRec,
        sendResponseObject
    );

export const depositApp = depositValidate.getApp();
