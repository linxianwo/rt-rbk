import {
    ResponseObject,
    ResponseObjectCode,
    SUCCESS_RESPONSE,
    ERROR_MSG,
    updateERROR_MSG,
} from '../../share/models/response-common';
import { logger } from '../../share/utils/logs';
import { objectFormatIsStandard } from '../../share/utils/format-check';
import { Slip } from '../../share/models/hw-serv/betslip-models';
import { TTSTWrapper } from '../ttst-wrapper/ttst-wrapper';
import { TICKET_DETAIL } from '../../share/models/beteng-serv/ticketdetail';
import { isKeyInObject } from '../../share/methods/util';

/**
 * description: check the object's(from req paramter) format is same as objType's format or not
 *
 * @param {*} req  http Request
 * @param {*} res  http Response
 * @param {*} standardInstance a standard instance can represent the accepted object format
 * @returns {boolean}
 */
export const validateJsonObjectFormat = (
    req,
    res,
    standardInstance,
    paramObj?
): boolean => {
    let param;
    const resObj: ResponseObject = {
        code: ResponseObjectCode.SUCCESS_CODE,
        body: null,
        message: 'success',
    };

    res.setHeader('Content-Type', 'application/json;charset=UTF-8');
    if (paramObj !== undefined) {
        param = paramObj;
    } else {
        if (req.method === 'POST') {
            param = req.body;
        } else {
            param = req.params.object;

            try {
                param = JSON.parse(param);
            } catch (err) {
                resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                resObj.message = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
                logger.error(
                    'the param is not a json or json array object:' +
                        req.params.object
                );
                res.status(400).send(resObj);
                return false;
            }
        }
    }

    // console.log('param', param);
    if (param && objectFormatIsStandard(param, standardInstance)) {
        if (paramObj === undefined) {
            req.params.object = param;
        }
        return true;
    } else {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
        logger.error('the wrong format received');
        res.status(400).send(resObj);
        return false;
    }
};

export const validateBetSlipFormat = (req, res, next) => {
    updateERROR_MSG();
    req.betslipRequest = true;
    const betSlip = new Slip();
    Object.assign(betSlip, {
        slipCol: 0,
        slipRow: 0,
        slipID: [0],
        slipData: [0],
        slipDump: [0],
        slipName: '',
        slipDataOcr: '',
        slipDataBar: '',
    });
    if (validateJsonObjectFormat(req, res, betSlip)) {
        req.betSlip = req.params.object;
        next();
    }
};

export const sendResponseObject = (req, res) => {
    const resObj: ResponseObject = Object.assign({}, SUCCESS_RESPONSE);
    res.status(200).send(resObj);
};

export const betSlipToTicketDetail = (req, res, next) => {
    const resObj: ResponseObject = Object.assign({}, SUCCESS_RESPONSE);
    const betSlip: Slip = req.betSlip;
    const ttstWrapper = new TTSTWrapper();
    const ticketDetail = new TICKET_DETAIL();
    let error_status = '';
    try {
        error_status = ttstWrapper.CTSTvalidate(
            true,
            true,
            true,
            parseInt(betSlip.slipID.slice().reverse().join(''), 2),
            1,
            '0' + betSlip.slipData.join(''),
            ticketDetail
        );
    } catch (error) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
        res.status(200).send(resObj);
        logger.info('ttst error:' + error);
    }
    // const errKey: string = getErrMsgKey(error_status);

    if (error_status === 'RID_NO_ERROR') {
        req.ticketDetail = ticketDetail;
        next();
    } else {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        if (isKeyInObject(error_status, ERROR_MSG)) {
            resObj.message = ERROR_MSG[error_status];
        } else {
            resObj.message = ERROR_MSG['RID_UNKNOWN_ERROR'];
            logger.error(
                `error key ${error_status} not defined in kiosk errorMessage list`
            );
        }
        res.status(200).send(resObj);
        return;
    }
};

export const validateTicketDetailFormat = (req, res, next) => {
    const ticketDetail = new TICKET_DETAIL();
    Object.assign(ticketDetail, {
        track: '',
        day: '',
        date: [''],
        ticket_id: 0,
        pool: [''],
        formula: [''],
        race: [''],
        selection: [''],
        value: [''],
        mb_type: '',
        draw_type: '',
        entryNo: 0,
        type: 0,
        event: 0,
        exot_flag: 0,
        allup_flag: 0,
        status: 0,
        addon_flag: 0,
        sb_flag: 0,
        game_type: 0,
        game_method: 0,
        quick_pick: 0,
        match: [0],
        score1: [0],
        score2: [0],
    });
    if (validateJsonObjectFormat(req, res, ticketDetail, req.ticketDetail)) {
        next();
    }
};
