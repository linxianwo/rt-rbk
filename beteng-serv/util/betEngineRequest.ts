import { RequestBase } from '../../share/utils/request-base';
import { ServerPorts } from '../../share/main-proc/processes/ports';
import { logger } from '../../share/utils/logs';
import {
    ResponseObject,
    ResponseObjectCode,
    ERROR_MSG,
} from '../../share/models/response-common';
import { objectFormatIsStandard } from '../../share/utils/format-check';
import { CommonAPIValue } from '../../share/protocols/kiosk-api-event';
import { FootballBetObject } from '../../share/models/comm-serv/Football/FootballBetObject';
import { getObjectKeyFromValue } from '../../share/methods/util';
import { PCODE } from '../../share/models/comm-serv/CommonDefs';
import { FootballBetObjectCriteria } from '../../share/models/beteng-serv/football/FootballCriteria';
import { getWeekDayString } from './racing-util';
import { RacingMeeting } from '../../share/models/comm-serv/Racing/Enums';

// const apiBaseAddress = 'http://localhost:';

export const getRacingInfo = (req, res, next) => {
    req.checkPoolStatus = false;
    const url =
        CommonAPIValue.apiBaseAddress +
        ServerPorts.infoServer +
        '/api/racing/enabledTrackTotalInfo';
    const options = {
        method: 'GET',
        uri: url,
        timeout: 10000,
    };
    const resObj: ResponseObject = {
        code: ResponseObjectCode.SUCCESS_CODE,
        body: null,
        message: 'success',
    };
    RequestBase.requestWithOpts(
        options,
        (enabledTracksStr) => {
            req.enabledTracksStr = enabledTracksStr;
            next();
        },
        (error) => {
            resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
            logger.error(
                'request return error, cannot get info from server info-serv'
            );
            resObj.message = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
            res.status(500).send(resObj);
            logger.fatal(error);
        }
    );
};
export const validateTrackFromInfoServer = (req, res, next) => {
    const resObj: ResponseObject = {
        code: ResponseObjectCode.SUCCESS_CODE,
        body: null,
        message: 'success',
    };
    if (!req.enabledTracksStr) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_EX_TKT_MEET_NOT_DEFINE;
        res.status(200).send(resObj);
        return;
    }

    let enabledTracks = null;
    let resObjFromInfo: ResponseObject = null;
    try {
        resObjFromInfo = JSON.parse(req.enabledTracksStr);
    } catch (err) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
        logger.error(
            'the param is not a json or json array object:' +
                req.enabledTracksStr
        );
        res.status(500).send(resObj);
        return;
    }

    if (resObjFromInfo.code === 0) {
        enabledTracks = resObjFromInfo.body;
    } else {
        resObj.code = resObjFromInfo.code;
        resObj.message = resObjFromInfo.message;
        logger.error('error from info server' + resObjFromInfo.message);
        res.status(500).send(resObj);
        return;
    }
    // check the enabledTracks format
    const stdEnabledTracks = [
        {
            Venue: 'HV',
            Date: '14-03-2019',
            IsDefault: true,
            EnabledRaces: [
                {
                    RaceNo: 1,
                    EnabledPools: [
                        {
                            Pool: 'CWA',
                            PoolEngName: '3 Pick 1',
                            PoolChnName: '...',
                            EnabledStarters: [
                                {
                                    Number: 1,
                                    CompositeName: 'A1',
                                    Composite: [2, 4],
                                    NumberEngName: 'Overnight Favourites',
                                    NumberChnName: '...',
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ];
    if (
        !enabledTracks ||
        objectFormatIsStandard(enabledTracks, stdEnabledTracks) === false
    ) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
        logger.error('get wrong format data from info server');
        res.status(500).send(resObj);
        return;
    }

    if (enabledTracks.length === 0) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_EX_TKT_MEET_NOT_DEFINE;
        res.status(200).send(resObj);
        return;
    }

    if (enabledTracks.every((track) => track.EnabledRaces.length === 0)) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
        logger.error('get no race from track');
        res.status(200).send(resObj);
        return;
    }

    const defaultTrack = enabledTracks.filter((track) => track.IsDefault);
    const defaultTrackNum = defaultTrack.length;
    if (defaultTrackNum > 1) {
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
        logger.error(
            'get default track number greater than 1 from info server'
        );
        res.status(200).send(resObj);
        return;
    }
    // else if (defaultTrackNum === 0) {
    //     resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
    //     resObj.message = ERROR_MSG.RID_EX_TKT_MEET_NOT_DEFINE;
    //     res.status(200).send(resObj);
    //     return;
    // }
    req.enabledTracks = enabledTracks;
    req.defaultTrack = defaultTrack.length === 0 ? null : defaultTrack[0];
    next();
};

export const getFootballMatchInfo = (req, res, next) => {
    const betObj: FootballBetObject = req.footballBetObject;
    const queryMatchList = [];
    let poolStr = '';
    let queryMatchInfo: {
        betType: number;
        matchDay: string;
        matchNumber: number;
    };
    for (const game of betObj.gameList) {
        poolStr = getObjectKeyFromValue(game.pool.code, PCODE);
        queryMatchInfo = {
            betType: FootballBetObjectCriteria[poolStr].scBetType,
            matchDay: getWeekDayString(game.matchDay),
            matchNumber: game.matchNumber,
        };
        queryMatchList.push(queryMatchInfo);
    }

    if (betObj.tgameList.length > 0) {
        poolStr = getObjectKeyFromValue(betObj.tgameList[0].pool.code, PCODE);
    }
    // for (let tgame of betObj.tgameList) {
    //     poolStr = getObjectKeyFromValue(tgame.pool.code, PCODE);
    //     queryMatchInfo = {
    //         betType: FootballBetObjectCriteria[poolStr].scBetType,
    //         matchDay: getWeekDayString(tgame.RaceDay),
    //         matchNumber: getWeekDayCode(tgame.RaceDate)
    //     };
    //     queryMatchList.push(queryMatchInfo);
    // }
    if (queryMatchList.length === 0 && poolStr !== 'PC_JKC') {
        next();
    } else {
        const queryMatchListStr = encodeURIComponent(
            JSON.stringify(queryMatchList)
        );
        let url = '';
        if (poolStr === 'PC_JKC') {
            url =
                CommonAPIValue.apiBaseAddress +
                ServerPorts.infoServer +
                '/api/racing/jkcinfo';
        } else {
            url =
                CommonAPIValue.apiBaseAddress +
                ServerPorts.infoServer +
                '/api/football/footballInfo/enabledMatches/' +
                queryMatchListStr;
        }
        const options = {
            method: 'GET',
            uri: url,
            timeout: 10000,
        };
        const resObj: ResponseObject = {
            code: ResponseObjectCode.SUCCESS_CODE,
            body: null,
            message: 'success',
        };
        RequestBase.requestWithOpts(
            options,
            (footballMatchInfoStr) => {
                let resObjFromInfo = null;
                try {
                    resObjFromInfo = JSON.parse(footballMatchInfoStr);
                } catch (err) {
                    resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                    resObj.message = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
                    logger.error(
                        'the param is not a json or json array object:' +
                            req.enabledTracksStr
                    );
                    res.status(500).send(resObj);
                    return;
                }

                if (poolStr === 'PC_JKC') {
                    const jkcInfoObj = resObjFromInfo.body;
                    const jkcInfoList = jkcInfoObj.jkcStarterInfo;
                    for (const tgame of betObj.tgameList) {
                        tgame.Meeting = RacingMeeting[jkcInfoObj.track];
                        if (jkcInfoList.length) {
                            for (const context of tgame.contextList) {
                                for (const jkcInfo of jkcInfoList) {
                                    if (
                                        jkcInfo.No &&
                                        context.scContext &&
                                        jkcInfo.No === context.scContext.nSeln
                                    ) {
                                        context.odds = Math.round(
                                            Number(jkcInfo.Odds) * 1000
                                        );
                                        context.scContext.strNameCh =
                                            jkcInfo.NameC;
                                        context.scContext.strNameEn =
                                            jkcInfo.NameE;
                                    }
                                }
                            }
                        } else {
                            resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                            resObj.message =
                                ERROR_MSG.RID_EX_TKT_POOL_NOT_DEFINE_JKC;
                            res.status(200).send(resObj);
                            return;
                        }
                    }
                } else {
                    let i = 0;
                    for (const game of betObj.gameList) {
                        game.bVoidLeg = resObjFromInfo.body[i].isVoidLeg;
                        i++;
                    }
                }

                next();
            },
            (error) => {
                resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                logger.error(
                    'request return error, cannot get info from server info-serv'
                );
                resObj.message = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
                res.status(500).send(resObj);
                logger.fatal(error);
            }
        );
    }
};

export const getMarkSixInfo = (req, res, next) => {
    const url =
        CommonAPIValue.apiBaseAddress +
        ServerPorts.infoServer +
        '/api/marksix/definedMarkSix';
    const options = {
        method: 'GET',
        uri: url,
        timeout: 10000,
    };
    const resObj: ResponseObject = {
        code: ResponseObjectCode.SUCCESS_CODE,
        body: null,
        message: 'success',
    };
    RequestBase.requestWithOpts(
        options,
        (resObjStr) => {
            let resObjFromInfo: ResponseObject = null;
            try {
                resObjFromInfo = JSON.parse(resObjStr);
            } catch (err) {
                resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                resObj.message = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
                logger.error(
                    'the param is not a json or json array object:' + resObjStr
                );
                res.status(500).send(resObj);
                return;
            }

            if (resObjFromInfo.code === 0) {
                const definedMarkSix = resObjFromInfo.body;
                if (!definedMarkSix) {
                    resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
                    resObj.message = ERROR_MSG.RID_EX_BE_MK6_NOT_DEFINED;
                    res.status(200).send(resObj);
                    return;
                }
            } else {
                resObj.code = resObjFromInfo.code;
                resObj.message = resObjFromInfo.message;
                logger.error('error from info server' + resObjFromInfo.message);
                res.status(500).send(resObj);
                return;
            }
            next();
        },
        (error) => {
            resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
            logger.error(
                'request return error, cannot get info from server info-serv'
            );
            resObj.message = ERROR_MSG.RID_SYS_ERR_EXCEPTION;
            res.status(500).send(resObj);
            logger.fatal(error);
        }
    );
};
