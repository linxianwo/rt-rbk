import * as bindings from 'bindings';
import { TICKET_DETAIL } from '../../share/models/beteng-serv/ticketdetail';
export class TTSTWrapper {
    private _wrapper: any;
    constructor() {
        const addon = require('./addon.node');
        this._wrapper = new addon.TTSTWrapper();
    }

    /**
     *
     * CTermConfig_* -> TerminalConfig
     * @param {boolean} CTermConfig_cornerHiLoEnabled # // by Richard, 20181214, CHiLo Enhancement for CHiLo Enable / Disable
     * @param {boolean} CTermConfig_isM6PUIEnabled # Q310: Enable / Disable M6 PUI
     * @param {boolean} CTermConfig_rdtManager_isMeetingDefined
     * # request the race day table from the BE,struct RaceDayTableMessage.numberOfTracks==0?false:true
     * @param {number} CMSTkt_m_id # ticket_id
     * @param {number} CMSTkt_m_entryNo # entry no for multi-bets tkt & set no for section bet
     * @param {string} CMSTkt_m_ms # Slip data c++ format
     * @param {TICKET_DETAIL} td#JSON:{status:"enum ERROR_CODE",track:"TICKET_DETAIL.track"
     * ,day:"TICKET_DETAIL.day",date:"TICKET_DETAIL.date",....(The rest of the reference TICKET_DETAIL properties as key-value)
     * ,match:"0 0 0 0 0 0 0 0 0 0",
     * "score1":"0.000000 0.000000 0.000000 0.000000 0.000000 0.000000
     * 0.000000 0.000000 0.000000 0.000000","score2":"0.000000 0.000000
     * 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000
     * 0.000000"
     * @returns {number} c++ fuction valTktDtl return
     * }
     * @memberof TTSTWrapper
     */
    public CTSTvalidate(
        CTermConfig_cornerHiLoEnabled: boolean,
        CTermConfig_isM6PUIEnabled: boolean,
        CTermConfig_rdtManager_isMeetingDefined: boolean,
        CMSTkt_m_id: number,
        CMSTkt_m_entryNo: number,
        CMSTkt_m_ms: string,
        td: TICKET_DETAIL
    ): any {
        const res = this._CTSTvalidate(
            CTermConfig_cornerHiLoEnabled,
            CTermConfig_isM6PUIEnabled,
            CTermConfig_rdtManager_isMeetingDefined,
            CMSTkt_m_id,
            CMSTkt_m_entryNo,
            CMSTkt_m_ms
        );
        //console.log('res=' + res);
        let restmp;
        try {
            restmp = JSON.parse(res);

            td.track = restmp.track;
            //td.day = restmp.day;
            if (restmp.day === 0) {
                td.day = '';
            } else {
                td.day = String.fromCharCode(restmp.day);
            }
            td.date = restmp.date
                .split(' ')
                .map(Number)
                .map((e) => {
                    return String.fromCharCode(e);
                });
            //td.date = String(restmp.date).split('');
            td.ticket_id = Number(restmp.ticket_id);
            td.pool = restmp.pool
                .split(' ')
                .map(Number)
                .map((e) => {
                    return String.fromCharCode(e);
                });
            td.formula = restmp.formula
                .split(' ')
                .map(Number)
                .map((e) => {
                    return String.fromCharCode(e);
                });
            td.race = restmp.race
                .split(' ')
                .map(Number)
                .map((e) => {
                    return String.fromCharCode(e);
                });
            td.selection = restmp.selection
                .split(' ')
                .map(Number)
                .map((e) => {
                    return String.fromCharCode(e);
                });
            td.value = restmp.value
                .split(' ')
                .map(Number)
                .map((e) => {
                    return String.fromCharCode(e);
                });
            //td.pool = String(restmp.pool).split('');
            // td.formula = String(restmp.formula).split('');
            // td.race = String(restmp.race).split('');
            // td.selection = String(restmp.selection).split('');
            // td.value = String(restmp.value).split('');
            // console.log("\ntype=" + typeof(restmp.mb_type));
            if (restmp.mb_type === 0) {
                td.mb_type = '';
            } else {
                td.mb_type = String.fromCharCode(restmp.mb_type);
            }
            if (restmp.draw_type === 0) {
                td.draw_type = '';
            } else {
                td.draw_type = String.fromCharCode(restmp.draw_type);
            }

            td.entryNo = Number(restmp.entryNo);
            td.type = Number(restmp.type);
            td.event = Number(restmp.event);
            td.exot_flag = Number(restmp.exot_flag);
            td.allup_flag = Number(restmp.allup_flag);
            td.status = Number(restmp.status1);
            td.addon_flag = Number(restmp.addon_flag);
            td.sb_flag = Number(restmp.sb_flag);
            td.game_type = Number(restmp.game_type);
            td.game_method = Number(restmp.game_method);
            td.quick_pick = Number(restmp.quick_pick);
            const matchtmp: string[] = restmp.match.split(' ');
            const score1tmp: string[] = restmp.score1.split(' ');
            const score2tmp: string[] = restmp.score2.split(' ');
            td.match = matchtmp.map(Number);
            td.score1 = score1tmp.map(Number);
            td.score2 = score2tmp.map(Number);
        } catch (e) {
            return 'RID_UNKNOWN_ERROR';
        }
        console.log('td=' + JSON.stringify(td));
        return restmp.status;
    }

    /**
     *
     * CTermConfig_* -> TerminalConfig
     * @param {boolean} CTermConfig_cornerHiLoEnabled # // by Richard, 20181214, CHiLo Enhancement for CHiLo Enable / Disable
     * @param {boolean} CTermConfig_isM6PUIEnabled # Q310: Enable / Disable M6 PUI
     * @param {boolean} CTermConfig_rdtManager_isMeetingDefined
     * # request the race day table from the BE,struct RaceDayTableMessage.numberOfTracks==0?false:true
     * @param {number} CMSTkt_m_id # ticket_id
     * @param {number} CMSTkt_m_entryNo # entry no for multi-bets tkt & set no for section bet
     * @param {string} CMSTkt_m_ms # Slip data c++ format
     * @returns {string} #JSON:{status:"enum ERROR_CODE",track:"TICKET_DETAIL.track"
     * ,day:"TICKET_DETAIL.day",date:"TICKET_DETAIL.date",....(The rest of the reference TICKET_DETAIL properties as key-value)
     * ,match:"0 0 0 0 0 0 0 0 0 0",
     * "score1":"0.000000 0.000000 0.000000 0.000000 0.000000
     * 0.000000 0.000000 0.000000 0.000000 0.000000","score2":"0.000000
     * 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000
     * 0.000000 0.000000"
     * }
     * @memberof TTSTWrapper
     */
    private _CTSTvalidate(
        CTermConfig_cornerHiLoEnabled: boolean,
        CTermConfig_isM6PUIEnabled: boolean,
        CTermConfig_rdtManager_isMeetingDefined: boolean,
        CMSTkt_m_id: number,
        CMSTkt_m_entryNo: number,
        CMSTkt_m_ms: string
    ): string {
        //   return this._wrapper.handled(88,0,1,1,"hello world",true,false,false);
        // @param {number} CMSTkt_m_status # unuse, default 0
        // @param {number} CMSTkt_m_error # unuse, default 0
        return this._wrapper.handled(
            CMSTkt_m_id,
            CMSTkt_m_entryNo,
            0,
            0,
            CMSTkt_m_ms,
            CTermConfig_cornerHiLoEnabled,
            CTermConfig_isM6PUIEnabled,
            CTermConfig_rdtManager_isMeetingDefined
        );
    }
}
