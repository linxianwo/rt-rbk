import { Slip } from '../../models/hw-serv/betslip-models';
import { SlipType, supportBetSlipList } from '../../models/betSlip';
import { logger } from '../../utils/logs';
import { terminalConfig } from '../../main-proc/terminal-config/terminal-config';
export function getBetSlipTypeById(slip: Slip) {
    const iwn = terminalConfig.poolEnabledIndicator.racing[0].selected;
    const forecast = terminalConfig.poolEnabledIndicator.racing[1].selected;
    try {
        if (
            slip.slipID.length === 0 &&
            slip.slipName.length > 0 &&
            slip.slipDataBar.length > 0 &&
            slip.slipDataOcr.length > 0
        ) {
            return SlipType.SLIP_CV_WINNING_TICKET;
        }
        const slipId = parseInt(slip.slipID.slice().reverse().join(''), 2);

        if (slipId === 253) {
            return SlipType.SLIP_BET_ACCOUNT_DEPOSIT;
        }
        if (!supportBetSlipList.includes(slipId)) {
            return SlipType.SLIP_UNKNOWN;
        }

        if (
            (slipId > 0 && slipId < 60 && slipId !== 39) ||
            (slipId > 180 && slipId < 187) ||
            ((slipId === 180 || slipId === 187) && forecast) ||
            ((slipId === 198 || slipId === 199) && iwn)
        ) {
            return SlipType.SLIP_RACING;
        } else if (slipId >= 60 && slipId < 75) {
            return SlipType.SLIP_MARKSIX;
            // Jason Yang 07-02-2020: should not support football betslip in marksix&racing version
        } else if ((slipId > 75 && slipId < 193) || slipId === 39) {
            // } else if (slipId === 39) {
            return SlipType.SLIP_FOOTBALL;
        } else {
            return SlipType.SLIP_UNKNOWN;
        }
    } catch (error) {
        logger.info('getBetSlipTypeById error:' + error);
    }
    return SlipType.SLIP_UNKNOWN;
}
