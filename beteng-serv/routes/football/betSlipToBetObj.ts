import {
    ERROR_MSG,
    ResponseObject,
    SUCCESS_RESPONSE,
    ResponseObjectCode,
} from '../../../share/models/response-common';
import { TICKET_DETAIL } from '../../../share/models/beteng-serv/ticketdetail';
import {
    FootballBetObject,
    Game,
    ODDS_INDICATION,
    Context,
    SHomeAwayDraw,
    SHandicap,
    STotalScore,
    SHighLow,
    SCornerHighLow,
    SOddEven,
    SFirstScorer,
    SChampion,
    SGroupWinner,
    STopScorer,
    SToQualify,
    SCorrectScore,
    SHalfFullTime,
    SHftCrsp,
    SGroupForecast,
    SFinalist,
    SChamp1stRun,
    Pool,
    TourGame,
    SHandiHomeAwayDraw,
} from '../../../share/models/comm-serv/Football/FootballBetObject';
import {
    PCODE,
    TPCODE,
    ALLUP_TYPE,
} from '../../../share/models/comm-serv/CommonDefs';
import * as FootballCriteriaGlobal from '../../../share/models/beteng-serv/football/FootballCriteria';
import {
    getObjectKeyFromValue,
    isKeyInObject,
} from '../../../share/methods/util';
import {
    SCBET_TYPE,
    SSpecial,
} from '../../../share/models/comm-serv/Racing/RacingFixOddsBettingObject';
const MARK = '1';
const NOTMARK = '0';
const HOME_WIN = 0;
const AWAY_WIN = 1;
const DRAW = 2;
const START_INDEX = 1;
const STB_SELECTIONS_SIZE = 3;
const HAD_SELECTIONS_SIZE = 3;
const FGS_SELECTIONS_SIZE = 41;
const CRS_SELECTIONS_SIZE = 31;
const CRSP_SELECTIONS_SIZE = CRS_SELECTIONS_SIZE + 1;
const HFT_SELECTIONS_SIZE = 9;
const THFP_SELECTIONS_SIZE = HFT_SELECTIONS_SIZE + 1;
const HDC_SELECTIONS_SIZE = 2;
const HCSP_SELECTIONS_SIZE = CRSP_SELECTIONS_SIZE * 2;
const TTG_SELECTIONS_SIZE = 8;
const HIL_ML_SELECTIONS_MIN_SIZE = 18;
const HIL_ML_SELECTIONS_SIZE = 20;
const OOE_SELECTIONS_SIZE = 2;
const SPC_SELECTIONS_SIZE = 6;
const MAX_NUM_OF_ITEM = 20;
const NOV_NUM = 21;
const TT_PLAYER = 1;
const NOV_JKC_NUM = 1;
const ADTP_TKT_MAX_SELN = 9; //  include FIELD
const TOFP_TKT_MAX_SELN = 19; //  include FIELD
const GPWF_TKT_MAX_SELN = 10;
const GPWF_NEW_TKT_MAX_SELN = 6;
// const CHP_TKT_MAX_SELN        34    // same tkt as tps, user request to support upto 50
const CHP_TKT_MAX_SELN = 50; // exclude OTHERS
const TPS_TKT_MAX_SELN = 51; //  include OTHERS
const SPC_TKT_MAX_SELN = 6;
// const JKC_TKT_MAX_SELN        12
const JKC_TKT_MAX_SELN = 14; // Q408 Peter See 02/08/2008 [no of selections: 12.14]

const TKT_MAX_GRP = 6;
const MAX_TEAM_SELN = 64;
const TPS_OTHERS = 51;
const CHP_SELECTIONS_SIZE = MAX_TEAM_SELN;
const GPW_SELECTIONS_SIZE = MAX_TEAM_SELN;
const TPS_SELECTIONS_SIZE = TPS_OTHERS;
const TOFP_HALF_SELECTIONS_SIZE = MAX_TEAM_SELN + 1;
const ADTP_SELECTIONS_SIZE = MAX_TEAM_SELN + 1;
const GPWF_SELECTIONS_PER_GRP = 10;
const TOFP_CHAMPION = true;
const TOFP_1ST_RUNNERUP = false;

const DEFAULT_TOUR_NO = 0;
const DEFAULT_EVT_NO = 0;
const DEFAULT_GRP_NO = 1;
const DEFAULT_TEAM_NO = 0;
const DEFAULT_ITEM_NO = 0;
const DEFAULT_TPS_TYPE_NO = TT_PLAYER;
const fgs_tbl = [
    101,
    102,
    103,
    104,
    105,
    106,
    107,
    108,
    109,
    110,
    111,
    112,
    113,
    114,
    115,
    116,
    117,
    118,
    119,
    120,
    201,
    202,
    203,
    204,
    205,
    206,
    207,
    208,
    209,
    210,
    211,
    212,
    213,
    214,
    215,
    216,
    217,
    218,
    219,
    220,
    0,
];
const ttg_tbl = [0, 1, 2, 3, 4, 5, 6, 7];
const hdc_tbl = [HOME_WIN, AWAY_WIN];
const tql_tbl = [HOME_WIN, AWAY_WIN];
const hda_tbl = [HOME_WIN, DRAW, AWAY_WIN];
const first_hft_tbl = [
    HOME_WIN,
    HOME_WIN,
    HOME_WIN,
    DRAW,
    DRAW,
    DRAW,
    AWAY_WIN,
    AWAY_WIN,
    AWAY_WIN,
];

const second_hft_tbl = [
    HOME_WIN,
    DRAW,
    AWAY_WIN,
    HOME_WIN,
    DRAW,
    AWAY_WIN,
    HOME_WIN,
    DRAW,
    AWAY_WIN,
];

const hil_tbl = [0, 1]; //  0 = over; 1 = under
const ooe_tbl = [1, 0]; //  0 = even; 1 = odd
const XPOOL = 2;
const MAX_SCBET_LEG = 8;
const NO_OF_LEGS_OF_DHCP = 2;
const NO_OF_LEGS_OF_THFP = 3;
const NO_OF_LEGS_OF_HAFU6 = 6;
const NO_OF_LEGS_OF_HAFU8 = 8;
const CRS_H_O_INDEX = 12; // crs home other selection[]
const CRS_D_O_INDEX = 17; // crs draw other selection[]
const CRS_A_O_INDEX = 30;
const CRS_F_INDEX = 31;
const HFTP_F_INDEX = 9;

const CRS_O_VALUE = 63;
const CRS_H_O_VALUE = 0;
const CRS_A_O_VALUE = 1;
const CRS_D_O_VALUE = 2;

const crs_home_tbl = [
    1,
    2,
    2,
    3,
    3,
    3,
    4,
    4,
    4,
    5,
    5,
    5,
    CRS_H_O_INDEX,
    0,
    1,
    2,
    3,
    CRS_D_O_INDEX,
    0,
    0,
    1,
    0,
    1,
    2,
    0,
    1,
    2,
    0,
    1,
    2,
    CRS_A_O_INDEX,
    CRS_F_INDEX,
];

const crs_away_tbl = [
    0,
    0,
    1,
    0,
    1,
    2,
    0,
    1,
    2,
    0,
    1,
    2,
    CRS_H_O_INDEX,
    0,
    1,
    2,
    3,
    CRS_D_O_INDEX,
    1,
    2,
    2,
    3,
    3,
    3,
    4,
    4,
    4,
    5,
    5,
    5,
    CRS_A_O_INDEX,
    CRS_F_INDEX,
];

// RHO newly added for STB section HAD
const sc_value_stb_tbl = [
    0,
    10,
    20,
    40,
    50,
    100,
    200,
    400,
    500,
    1000,
    2000,
    4000,
    5000,
    10000,
    20000,
    40000,
    50000,
    100000,
];

//  for HFMP, DHCP, and 3x ACRS
const sc_value_little_amt_tbl = [
    0,
    2,
    3,
    4,
    5,
    10,
    20,
    40,
    50,
    100,
    200,
    400,
    500,
    1000,
    2000,
    4000,
    5000,
    10000,
    20000,
    40000,
    50000,
    100000,
];

//  for 6x ACRS
const sc_value_little_amt_6x_ACRS_tbl = [
    0,
    2,
    3,
    4,
    5,
    10,
    20,
    40,
    50,
    100,
    200,
    400,
    500,
    1000,
    2000,
    4000,
    5000,
    10000,
    20000,
    40000,
];

const sc_value_tbl = [
    0,
    10,
    20,
    40,
    50,
    100,
    200,
    400,
    500,
    1000,
    2000,
    4000,
    5000,
    10000,
    20000,
    40000,
    50000,
    100000,
    200000,
    400000,
    500000,
];

const TKT_SCBET_HAD = 81; /* sport */
const TKT_SCBET_TTG = 82; /* sport */
const TKT_SCBET_CRS = 83; /* sport */
const TKT_SCBET_HFT = 84; /* sport */
const TKT_SCBET_HDC = 85; /* sport */
const TKT_SCBET_HFTP = 86; /* sport */
const TKT_SCBET_CRSP = 87; /* sport */
const TKT_SCBET_AHAD = 88; /* sport */
const TKT_SCBET_AHAD_7X = 89; /* sport */
const TKT_SCBET_THFP = 90; /* sport */
const TKT_SCBET_HIL = 91; /* sport */
const TKT_SCBET_HCSP = 92; /* sport */
const TKT_SCBET_FGS = 93; /* sport */
const TKT_SCBET_OOE = 94; /* sport */
const TKT_SCBET_HHAD = 95; /* sport */
const TKT_SCBET_AHHAD = 96; /* sport */
const TKT_SCBET_AHHAD_7X = 97; /* sport */
const TKT_SCBET_ACRS_6X = 98; /* all up crs 6x w/o partial bet */
// const TKT_SCBET_ACRS      99  /* sport */
const TKT_SCBET_HFMP6 = 100; /* sport */
// const TKT_SCBET_MULTI_SCORE   101 /* sport */
const TKT_SCBET_AMULTI = 102; /* sport */
const TKT_SCBET_AHFT = 103; /* sport */
// const TKT_SCBET_DHCP      104 /* sport */
const TKT_SCBET_AHFT_6X = 105; /* sport */
const TKT_SCBET_AMULTI_6X = 106; /* sport */
const TKT_SCBET_A2HAD = 107; /* sport */
const TKT_SCBET_A2HAD_6X = 108; /* sport */
const TKT_SCBET_GPF = 109; /* sport */
const TKT_SCBET_CHP = 110; /* sport */
const TKT_SCBET_TOFP = 111; /* sport */
const TKT_SCBET_SPC = 112; /* sport */
const TKT_SCBET_ADTP = 113; /* sport */
const TKT_SCBET_GPF_4X = 114; /* sport */
const TKT_SCBET_HFMP68 = 115; /* sport */
const TKT_SCBET_CHP_TPS = 116; /* sport */
const TKT_SCBET_GPW_GPF_4X15 = 117; /* sport */
const TKT_SCBET_GPW_GPF_4X = 118; /* sport */
const TKT_SCBET_AHDC = 119; /* sport */
//
// deprecate this ID on 23/11/2004, replace by 124
//
// const TKT_SCBET_AHDC_6X   120 /* sport */
//

// 	by Samuel Chan, 20140516
// 	new SPC ticket, ID 120
const TKT_SCBET_SPC_LONG = 120; /* sport */

const TKT_SCBET_STB = 121; /* sport */
const TKT_SCBET_DHCP = 122; /* sport */
const TKT_SCBET_ACRS = 123; /* sport */
const TKT_SCBET_AHDC_6X = 124; /* sport */
const TKT_SCBET_AMULTI_8X = 125; /* sport */
const TKT_SCBET_AHDC_8X = 126; /* sport */
const TKT_SCBET_GPW_GPF_8X = 127; /* sport */
const TKT_SCBET_FGS_3X = 128; /* all up fgs 8x */
// const TKT_SCBET_SCC       129 /* scorecast */
const TKT_SCBET_ACRS_6X_P = 130; /* all up crs 6x w/ partial bet */
const TKT_SCBET_FHAD_3X = 131; /* all up fhad 3x */
const TKT_SCBET_FHAD_6X = 132; /* all up fhad 6x */
const TKT_SCBET_FHAD_8X = 133; /* all up fhad 8x */
const TKT_SCBET_AHFT_1X_6X = 134; /* all up hft 1x - 6x */
const TKT_SCBET_NTS_TQL = 135; /* NTS TQL */
const TKT_SCBET_ACRS100_6X = 136; /* all up crs 6x w/ 100 match number */
const TKT_SCBET_AHFT100_6X = 137; /* all up hft 1x - 6x w/ 100 match number */
const TKT_SCBET_ACRS100_3X = 138; /* all up crs 3x w/ 100 match number */

// Mar2011 M2: add fts ticket
const TKT_SCBET_FTS_3X = 139; /* all up fts 3x */
const TKT_SCBET_FTS_6X = 140; /* all up fts 6x */
const TKT_SCBET_FTS_8X = 141; /* all up fts 8x */

// MR2011 FHLO: add FHLO ticket
const TKT_SCBET_FHLO_3X = 142; /* all up fhlo 3x */
const TKT_SCBET_FHLO_6X = 143; /* all up fhlo 6x */
const TKT_SCBET_FHLO_8X = 144; /* all up fhlo 8x */

// by Ken Lam, MSR2012 FCRS: add FCRS ticket
const TKT_SCBET_FCRS_3X = 145; /* all up FCRS 3x */
const TKT_SCBET_FCRS_6X = 146; /* all up FCRS 6x */

// PSR2013 CHLO
const TKT_SCBET_CHLO_3X = 147; /* all up chlo 3x */
const TKT_SCBET_CHLO_6X = 148; /* all up chlo 6x */
const TKT_SCBET_CHLO_8X = 149; /* all up chlo 8x */

// By Star feng, 20150602
// Multiple Lines R0
// Add new ticket id for Multiple Lines
const TKT_SCBET_AMULTI_ML = 150; /* sport */
const TKT_SCBET_AMULTI_ML_6X = 151; /* sport */
const TKT_SCBET_AMULTI_ML_8X = 152; /* sport */
const TKT_SCBET_FHLO_ML_3X = 153; /* all up fhlo 3x */
const TKT_SCBET_FHLO_ML_6X = 154; /* all up fhlo 6x */
const TKT_SCBET_FHLO_ML_8X = 155; /* all up fhlo 8x */

// by Richard, 20190111, CHiLo Enhancement for CHiLo Enable / Disable
const TKT_SCBET_FHLO_ML_3X_ENHAN = 156; /* all up fhlo 3x for enhancement*/
const TKT_SCBET_FHLO_ML_6X_ENHAN = 157; /* all up fhlo 6x for enhancement */
const TKT_SCBET_FHLO_ML_8X_ENHAN = 158; /* all up fhlo 8x for enhancement */
const TKT_NOVELTY_JKC = 192;
const ticketFormulaMap = {
    formula_sc_short: [
        TKT_SCBET_AHAD,
        TKT_SCBET_AHHAD,
        TKT_SCBET_ACRS,
        TKT_SCBET_A2HAD,
        TKT_SCBET_AMULTI,
        TKT_SCBET_AMULTI_ML,
        TKT_SCBET_AHDC,
        TKT_SCBET_AHFT,
        TKT_SCBET_FGS_3X,
        TKT_SCBET_FHAD_3X,
        TKT_SCBET_FTS_3X,
        TKT_SCBET_FHLO_3X,
        TKT_SCBET_FHLO_ML_3X,
        TKT_SCBET_FHLO_ML_3X_ENHAN,
        TKT_SCBET_FCRS_3X,
        TKT_SCBET_CHLO_3X,
        TKT_SCBET_ACRS100_3X,
    ],
    formula_sc_long: [
        TKT_SCBET_AHAD_7X,
        TKT_SCBET_AHHAD_7X,
        TKT_SCBET_A2HAD_6X,
        TKT_SCBET_AMULTI_6X,
        TKT_SCBET_AMULTI_ML_6X,
        TKT_SCBET_AHDC_6X,
        TKT_SCBET_AHFT_6X,
        TKT_SCBET_ACRS_6X,
        TKT_SCBET_ACRS_6X_P,
        TKT_SCBET_FHAD_6X,
        TKT_SCBET_FTS_6X,
        TKT_SCBET_FHLO_6X,
        TKT_SCBET_FHLO_ML_6X,
        TKT_SCBET_FHLO_ML_6X_ENHAN,
        TKT_SCBET_FCRS_6X,
        TKT_SCBET_CHLO_6X,
        TKT_SCBET_ACRS100_6X,
    ],
    formula_sc_gpf: [
        TKT_SCBET_GPF_4X,
        TKT_SCBET_GPW_GPF_4X,
        TKT_SCBET_GPW_GPF_4X15,
    ],
    formula_sc_8: [
        TKT_SCBET_AHDC_8X,
        TKT_SCBET_AMULTI_8X,
        TKT_SCBET_AMULTI_ML_8X,
        TKT_SCBET_FHAD_8X,
        TKT_SCBET_FHLO_8X,
        TKT_SCBET_FHLO_ML_8X,
        TKT_SCBET_FHLO_ML_8X_ENHAN,
        TKT_SCBET_CHLO_8X,
        TKT_SCBET_FTS_8X,
    ],
    formula_sc_gpf8: [TKT_SCBET_GPW_GPF_8X],
    formula_sc_hafu_1_6: [TKT_SCBET_AHFT_1X_6X, TKT_SCBET_AHFT100_6X],
};
const findFormulaArrayByTktId = (ticketId: number) => {
    for (const key of Object.keys(ticketFormulaMap)) {
        const value = ticketFormulaMap[key];
        if (value.includes(ticketId)) {
            return FootballCriteriaGlobal[key];
        }
    }
    return [];
};

const setAllUp = (
    leg: number,
    combination: number,
    betObj: FootballBetObject
) => {
    betObj.allUp.leg = leg;
    betObj.allUp.combination = combination;
};

const setBetAllUp = (
    tktDtl: TICKET_DETAIL,
    betObj: FootballBetObject
): string => {
    const status: string = ERROR_MSG.RID_NO_ERROR;
    if (
        tktDtl.pool[1] === TPCODE.SC_SPCT ||
        tktDtl.pool[1] === TPCODE.SC_SPCM
    ) {
        //  this is to indicate how many items have been selected
        setAllUp(tktDtl.event, 1, betObj);
    } else if (tktDtl.pool[1] === TPCODE.SC_STB) {
        setAllUp(tktDtl.event, 1, betObj);
    } else if (tktDtl.pool[1] === TPCODE.SC_THFP) {
        setAllUp(3, 1, betObj);
    } else if (tktDtl.pool[1] === TPCODE.SC_DHCP) {
        setAllUp(2, 1, betObj);
    } else if (tktDtl.pool[1] === TPCODE.SC_HFMP6) {
        if (tktDtl.quick_pick) {
            setAllUp(NO_OF_LEGS_OF_HAFU6 * 2, 1, betObj);
        } else {
            setAllUp(NO_OF_LEGS_OF_HAFU6, 1, betObj);
        }
    } else if (tktDtl.pool[1] === TPCODE.SC_HFMP8) {
        if (tktDtl.quick_pick) {
            setAllUp(NO_OF_LEGS_OF_HAFU8 * 2, 1, betObj);
        } else {
            setAllUp(NO_OF_LEGS_OF_HAFU8, 1, betObj);
        }
    } else if (!tktDtl.allup_flag) {
        setAllUp(1, 1, betObj);
    } else {
        let formula: number[] = [];
        let form = 0;
        let cnt = 1; //  loop counter
        formula = findFormulaArrayByTktId(tktDtl.ticket_id);

        //  looking for the position of the formula of the ticket, the position
        //  is used to determine whether the event( no of races selected )
        //  is matched with the formula marked

        while (tktDtl.formula[cnt]) {
            if (tktDtl.formula[cnt] === MARK) {
                form = formula[cnt];
            }
            cnt++;
        }

        if (form) {
            const leg = (form & 0xff00) >> 8;
            const combination = form & 0x00ff;

            setAllUp(leg, combination, betObj);
        } else {
            setAllUp(1, 1, betObj);
        }
    }

    return status;
};

const setPool = (
    tktDtl: TICKET_DETAIL,
    leg: number,
    betObj: FootballBetObject
): string => {
    let status: string = ERROR_MSG.RID_NO_ERROR;
    let poolStr = '';
    let bAllUp = false,
        // bPariMu = false,
        bSingle = false;
    let pool = tktDtl.pool[1]; //  always use the same pool if only normal all up

    if (tktDtl.allup_flag === 1) {
        bAllUp = true;
        bSingle = false;
        betObj.allUpType = ALLUP_TYPE.NORMAL_ALLUP;
    } else if (tktDtl.allup_flag === XPOOL) {
        bAllUp = true;
        bSingle = false;
        pool = tktDtl.pool[leg + 1];
        betObj.allUpType = ALLUP_TYPE.XPOOL_ALLUP;
    }
    const scStr = getObjectKeyFromValue(pool, TPCODE);
    if (scStr === '') {
        status = ERROR_MSG.RID_EX_TKT_POOL_NOT_DEFINE_JKC;
    } else {
        poolStr = scStr.replace('S', 'P');
    }
    if (isKeyInObject(poolStr, PCODE)) {
        if (
            FootballCriteriaGlobal.FootballBetObjectCriteria[poolStr] &&
            FootballCriteriaGlobal.FootballBetObjectCriteria[poolStr]
                .oddsIndicator === ODDS_INDICATION.PARI_MUTUEL
        ) {
            betObj.oddsIndicator = ODDS_INDICATION.PARI_MUTUEL;
        } else {
            betObj.oddsIndicator = ODDS_INDICATION.FIXED_ODDS_WITHOUT_ODDS;
        }
    } else {
        status = ERROR_MSG.RID_EX_TKT_POOL_NOT_DEFINE_JKC;
    }
    if (status === ERROR_MSG.RID_NO_ERROR) {
        if (betObj.scBetType === SCBET_TYPE.MATCH_BET) {
            const poolObj = new Pool(PCODE[poolStr], bAllUp, bSingle);
            betObj.gameList[leg].pool = poolObj;
            betObj.gameList[leg].maxNumOfContexts =
                FootballCriteriaGlobal.FootballBetObjectCriteria[
                    poolStr
                ].maxNumOfContexts;
            betObj.gameList[leg].minNumOfContexts =
                FootballCriteriaGlobal.FootballBetObjectCriteria[
                    poolStr
                ].minNumOfContexts;
        } else {
            const poolObj = new Pool(PCODE[poolStr], bAllUp, bSingle);
            betObj.tgameList[leg].pool = poolObj;
            betObj.tgameList[leg].maxNumOfContexts =
                FootballCriteriaGlobal.FootballBetObjectCriteria[
                    poolStr
                ].maxNumOfContexts;
            betObj.tgameList[leg].minNumOfContexts =
                FootballCriteriaGlobal.FootballBetObjectCriteria[
                    poolStr
                ].minNumOfContexts;
        }
    }
    return status;
};

const setMatch = (mNum, mDay, leg, betObj: FootballBetObject): string => {
    let status = ERROR_MSG.RID_NO_ERROR;

    if (leg <= betObj.allUp.leg) {
        if (betObj.gameList.length <= 0) {
            status = ERROR_MSG.RID_MISSING_GAME;
        } else {
            betObj.gameList[leg].matchDay = mDay;
            betObj.gameList[leg].matchNumber = mNum;
        }
    } else {
        status = ERROR_MSG.RID_EX_BE_INVALID_LEGS_ORDER;
    }

    return status;
};

const setScContext = (pc: PCODE, s: number, c: Context) => {
    c.poolCode = pc;
    switch (pc) {
        case PCODE.PC_NTS: // Q408
        case PCODE.PC_ETS: // Q408
        case PCODE.PC_HAD:
        case PCODE.PC_AHAD:
        case PCODE.PC_STB: // added for section bet STB
        case PCODE.PC_FHAD: //  Q306
        case PCODE.PC_FTS: // 	Mar2011 M2
            c.scContext = new SHomeAwayDraw();
            c.scContext.result = s;
            break;

        case PCODE.PC_HHAD:
        case PCODE.PC_AHHAD:
            c.scContext = new SHandiHomeAwayDraw();
            c.scContext.result = s;
            break;
        case PCODE.PC_HDC:
            c.scContext = new SHandicap();
            c.scContext.result = s;
            break;
        case PCODE.PC_TTG:
            c.scContext = new STotalScore();
            c.scContext.totalScore = s;
            break;

        case PCODE.PC_HIL:
        case PCODE.PC_FHLO: // 	MR2011 FHLO
            c.scContext = new SHighLow();
            c.scContext.hilo = s;
            break;

        case PCODE.PC_CHLO: // 	PSR2013 CHLO, 20130610
            c.scContext = new SCornerHighLow();
            c.scContext.hilo = s;
            break;

        case PCODE.PC_OOE:
            c.scContext = new SOddEven();
            c.scContext.odd = s;
            break;

        case PCODE.PC_FGS:
            c.scContext = new SFirstScorer();
            c.scContext.playerID = s;
            break;

        case PCODE.PC_CHP:
            c.scContext = new SChampion();
            c.scContext.nTeamNo = s;
            break;

        case PCODE.PC_GPW:
            c.scContext = new SGroupWinner();
            c.scContext.nWinner = s;
            break;

        case PCODE.PC_TPS:
            c.scContext = new STopScorer();
            if (s === TPS_TKT_MAX_SELN) {
                c.scContext.nSeln = 0;
            } else {
                c.scContext.nSeln = s;
            }
            break;
        case PCODE.PC_SPCT:
        case PCODE.PC_SPCM:
        case PCODE.PC_JKC:
        case PCODE.PC_TWF:
        case PCODE.PC_WRN:
            c.scContext = new SSpecial();
            c.scContext.nSeln = s;
            break;

        case PCODE.PC_TQL: //  Q407
            c.scContext = new SToQualify();
            c.scContext.result = s;
            break;

        default:
            //            return error
            break;
    }
};
const addScContext = (
    pc: PCODE,
    s: number,
    cnOdds: number,
    g: Game
): string => {
    let status = ERROR_MSG.RID_NO_ERROR;

    switch (pc) {
        case PCODE.PC_NTS: // Q408
        case PCODE.PC_ETS: // Q408
        case PCODE.PC_STB: // RHO newly added for section HAT SB_STB
        case PCODE.PC_HAD:
        case PCODE.PC_HDC:
        case PCODE.PC_TTG:
        case PCODE.PC_HIL:
        case PCODE.PC_FHLO: // 	MR2011 FHLO
        case PCODE.PC_CHLO: // 	PSR2013 CHLO
        case PCODE.PC_OOE:
        case PCODE.PC_FGS:
        case PCODE.PC_FHAD: //  Q306
        case PCODE.PC_FTS: //  Mar2011 M2
        case PCODE.PC_HHAD:
        case PCODE.PC_AHHAD:
        case PCODE.PC_AHAD:
        case PCODE.PC_SPCM:
        case PCODE.PC_TQL: //  Q407
            {
                const c = new Context();
                setScContext(pc, s, c);
                c.odds = cnOdds;
                g.contextList.push(c);
                g.numOfContexts++;
            }
            break;
        default:
            status = ERROR_MSG.RID_EX_TKT_ILL_SELECTION;
            break;
    }

    return status;
};

const setCxt = (pc: PCODE, g: Game, scSeln: string[]): string => {
    let bEmpty = true;
    // bool bFirst = true;
    let k = 0,
        min = 0,
        max = 0,
        status: string = ERROR_MSG.RID_NO_ERROR;

    switch (pc) {
        case PCODE.PC_NTS: // Q408
        case PCODE.PC_ETS: // Q408
        case PCODE.PC_HAD:
        case PCODE.PC_AHAD:
        case PCODE.PC_HHAD:
        case PCODE.PC_AHHAD:
        case PCODE.PC_STB:
        case PCODE.PC_FHAD: //  Q306
        case PCODE.PC_FTS: //  Mar2011 M2
            max = HAD_SELECTIONS_SIZE;
            break;
        case PCODE.PC_HDC:
            max = HDC_SELECTIONS_SIZE;
            break;
        case PCODE.PC_FCRS: // 	by Ken Lam, MSR2012 FCRS
        case PCODE.PC_CRS:
        case PCODE.PC_ACRS:
        case PCODE.PC_CRSP:
            max = CRS_SELECTIONS_SIZE;
            break;
        case PCODE.PC_HCSP:
        case PCODE.PC_DHCP:
            max = HCSP_SELECTIONS_SIZE;
            break;
        case PCODE.PC_HFT:
        case PCODE.PC_HFTP:
        case PCODE.PC_THFP:
        case PCODE.PC_HFMP6:
        case PCODE.PC_HFMP8:
            max = HFT_SELECTIONS_SIZE;
            break;
        case PCODE.PC_TTG:
            max = TTG_SELECTIONS_SIZE;
            break;
        case PCODE.PC_HIL:
        case PCODE.PC_FHLO: // 	MR2011
        case PCODE.PC_CHLO: // 	PSR2013	CHLO
            // By Star feng, 20150715
            // Multiple Lines R0
            // add Enable / Disable Multiple Line
            min = HIL_ML_SELECTIONS_MIN_SIZE;
            max = HIL_ML_SELECTIONS_SIZE; // max = HIL_SELECTIONS_SIZE;

            break;
        case PCODE.PC_OOE:
        case PCODE.PC_TQL: //  Q407
            max = OOE_SELECTIONS_SIZE;
            break;
        case PCODE.PC_FGS:
            max = FGS_SELECTIONS_SIZE;
            break;
        case PCODE.PC_SPCM:
            max = SPC_SELECTIONS_SIZE;
            break;
    }

    while (scSeln[k + min] && k + min < max) {
        if (scSeln[k + min] === MARK) {
            switch (pc) {
                case PCODE.PC_FGS:
                    status = addScContext(PCODE.PC_FGS, fgs_tbl[k], 0, g);
                    break;
                case PCODE.PC_TTG:
                    status = addScContext(PCODE.PC_TTG, ttg_tbl[k], 0, g);
                    break;
                case PCODE.PC_HDC:
                    status = addScContext(PCODE.PC_HDC, hdc_tbl[k], 0, g);
                    break;
                case PCODE.PC_HIL:
                case PCODE.PC_FHLO: // 	MR2011 FHLO: Hil & FHLO should be same
                case PCODE.PC_CHLO: // 	PSR2013 CHLO
                    // By Star feng, 20150715
                    // Multiple Lines R0
                    // add Enable / Disable Multiple Line
                    /*if ( theTerminal.isMultiLinesEnabled() )
				{
					if (bFirst)
					{
						// by Samuel Chan, 20151130
						// set item number for multiple line pool, but should do outside CScbet, e.g. CTktSellDlg::processMultiLinePool
						//status = g.addScLinenumber( pc,  scSeln );
					}
					if (status === RID_NO_ERROR)
					{
						bFirst = false;
						status = g.addScContext( pc, hil_tbl[k]);
					}
				}
				else
				{
					status = g.addScContext( pc, hil_tbl[k]);
				}*/
                    status = addScContext(pc, hil_tbl[k], 0, g);
                    break;
                case PCODE.PC_OOE:
                    status = addScContext(PCODE.PC_OOE, ooe_tbl[k], 0, g);
                    break;
                case PCODE.PC_TQL: //  Q407
                    status = addScContext(PCODE.PC_TQL, tql_tbl[k], 0, g);
                    break;
                case PCODE.PC_NTS: // Q408
                case PCODE.PC_ETS: // Q408
                case PCODE.PC_STB: // RHO newly added for section HAD SC_STB
                case PCODE.PC_HAD:
                case PCODE.PC_FHAD: //  Q306
                case PCODE.PC_FTS: //  Mar2011 M2
                case PCODE.PC_AHAD:
                case PCODE.PC_HHAD:
                case PCODE.PC_AHHAD:
                    status = addScContext(pc, hda_tbl[k], 0, g);
                    break;
            }
            bEmpty = false;
        }
        k++;
        if (status !== ERROR_MSG.RID_NO_ERROR) {
            break;
        }
    }

    if (status === ERROR_MSG.RID_NO_ERROR && bEmpty) {
        status = ERROR_MSG.RID_EX_TKT_INS_SELECTION;
    }
    return status;
};

const calculateOffset = (offsetObj, leg, betObj: FootballBetObject): string => {
    let status: string = ERROR_MSG.RID_NO_ERROR;

    //  only go on when this not the first leg
    if (leg > 0) {
        offsetObj.offset = 0;
        for (let i = 0; i < leg; i++) {
            let pc = betObj.gameList[i].pool.code;
            switch (pc) {
                case PCODE.PC_HDC:
                    offsetObj.offset += HDC_SELECTIONS_SIZE;
                    break;
                case PCODE.PC_NTS: // Q408
                case PCODE.PC_ETS: // Q408
                case PCODE.PC_HAD:
                case PCODE.PC_HHAD:
                case PCODE.PC_FHAD:
                case PCODE.PC_FTS: //  Mar2011 M2
                    offsetObj.offset += HAD_SELECTIONS_SIZE;
                    break;
                case PCODE.PC_OOE:
                case PCODE.PC_TQL: //  Q407
                    offsetObj.offset += OOE_SELECTIONS_SIZE;
                    break;
                case PCODE.PC_HIL:
                case PCODE.PC_FHLO: // 	MR2011 FHLO
                case PCODE.PC_CHLO: // 	PSR2013 CHLO
                    // By Star feng, 20150715
                    // Multiple Lines R0
                    // add Enable / Disable Multiple Line

                    offsetObj.offset += HIL_ML_SELECTIONS_SIZE;

                    break;
                case PCODE.PC_TTG:
                    offsetObj.offset += TTG_SELECTIONS_SIZE;
                    break;
                /*
            case PC_CRS:
                offset += CRS_SELECTIONS_SIZE;
                break;
            case PC_CRSP:
                offset += CRSP_SELECTIONS_SIZE;
                break;
            case PC_HFT:
                offset += HFT_SELECTIONS_SIZE;
                break;
*/
                default:
                    //  pools that do not support all up
                    //  e.g. FGS, HFMP6
                    status = ERROR_MSG.RID_EX_TKT_POOL_NOT_DEFINE_JKC;
            }
        }
    }

    return status;
};

////////////////////////////////////////////////////////////////////////////////
//
//  if NOT (HCSP || DHCP), neglects the last param
//
//  for ADTP and GPF, s1 is group no. and s2 is team no.
//
////////////////////////////////////////////////////////////////////////////////
const setScCxt = (pc: PCODE, s1, s2, bFirstHalf, c: Context) => {
    c.poolCode = pc;
    switch (pc) {
        case PCODE.PC_FCRS: // 	by Ken Lam, MSR2012 FCRS
        case PCODE.PC_CRS:
        case PCODE.PC_CRSP:
            c.scContext = new SCorrectScore();
            c.scContext.homeScores = s1;
            c.scContext.awayScores = s2;
            break;
        case PCODE.PC_HFT:
        case PCODE.PC_HFTP:
        case PCODE.PC_THFP:
        //    case PC_HFMP:
        case PCODE.PC_HFMP6:
        case PCODE.PC_HFMP8:
            c.scContext = new SHalfFullTime();
            c.scContext.halfTimeResult = s1;
            c.scContext.fullTimeResult = s2;
            break;
        case PCODE.PC_HCSP:
        case PCODE.PC_DHCP:
            c.scContext = new SHftCrsp();
            c.scContext.homeScores = s1;
            c.scContext.awayScores = s2;
            c.scContext.firstHalf = bFirstHalf;
            break;
            break;
        case PCODE.PC_GPF:
            c.scContext = new SGroupForecast();
            c.scContext.nWinner = s1;
            c.scContext.nRunnerUp = s2;
            break;
        case PCODE.PC_ADTP:
            c.scContext = new SFinalist();
            c.scContext.nGrpNo = s1;
            c.scContext.nTeamNo = s2;
            break;

        //    case PC_TPS:
        //        m_scContext.S_TopScorer.nType   = s1;
        //        m_scContext.S_TopScorer.nSeln   = s2;
        //        break;
        default:
            break;
    }
};
const addScCxt = (
    pc: PCODE,
    s1,
    s2,
    cnOdds,
    bFirstHalf: boolean,
    g: Game
): string => {
    let status: string = ERROR_MSG.RID_NO_ERROR;

    switch (pc) {
        case PCODE.PC_FCRS: // 	by Ken Lam, MSR2012 FCRS
        case PCODE.PC_CRS:
        case PCODE.PC_CRSP:
        case PCODE.PC_ACRS:
        case PCODE.PC_HFT:
        case PCODE.PC_HFTP:
        case PCODE.PC_THFP:
        case PCODE.PC_HFMP6:
        case PCODE.PC_HFMP8:
            {
                const c = new Context();
                setScCxt(pc, s1, s2, false, c);
                c.odds = cnOdds;
                g.contextList.push(c);
                g.numOfContexts++;
            }
            break;
        case PCODE.PC_HCSP:
        case PCODE.PC_DHCP:
            {
                const c = new Context();
                setScCxt(pc, s1, s2, bFirstHalf, c);
                c.odds = cnOdds;
                g.contextList.push(c);
                g.numOfContexts++;
            }
            break;
        default:
            status = ERROR_MSG.RID_EX_TKT_ILL_SELECTION;
            break;
    }

    return status;
};

////////////////////////////////////////////////////////////////////////////////
//
//  only for THFP, HCSP, HFMP6, HFMP8, CRSP, DHCP, ADTP, TOFP
//
//  REMARK: bFirstHalf is only for HCSP, DHCP, TOFP
//          bFirstHalf is true, it means it is for champion for TOFP
//          bFirstHalf is false, it means it is for 1st runner up for TOFP
//
////////////////////////////////////////////////////////////////////////////////
const setField = (bFirstHalf: boolean, pc: PCODE, c: Context) => {
    switch (pc) {
        case PCODE.PC_THFP:
        //    case PC_HFMP:
        case PCODE.PC_HFMP6:
        case PCODE.PC_HFMP8:
            c.scContext = new SHalfFullTime();
            c.scContext.field = true;
            break;
        case PCODE.PC_HCSP:
        case PCODE.PC_DHCP:
            c.scContext = new SHftCrsp();
            c.scContext.firstHalf = bFirstHalf;
            c.scContext.field = true;
            break;
        case PCODE.PC_CRSP:
            c.scContext = new SCorrectScore();
            c.scContext.field = true;
            break;
        case PCODE.PC_TOFP:
            c.scContext = new SChamp1stRun();
            c.scContext.bChampion = bFirstHalf;
            c.scContext.bField = true;
            break;
        case PCODE.PC_ADTP:
            c.scContext = new SFinalist();
            c.scContext.bField = true;
            break;
    }
    /*
    if ( m_poolCode === PC_THFP || m_poolCode === PC_HFMP )
        m_scContext.S_HalfFullTime.field = true;
    else if ( m_poolCode === PC_HCSP || m_poolCode === PC_DHCP ) {
        if ( bFirstHalf ) {
            m_scContext.S_HftCrsp.firstHalf = true;
            m_scContext.S_HftCrsp.field = true;
        }
        else {
            m_scContext.S_HftCrsp.firstHalf = false;
            m_scContext.S_HftCrsp.field = true;
        }
    }
    else if ( m_poolCode === PC_CRSP ) {
        m_scContext.S_CorrectScore.field = true;
    }
*/
};

////////////////////////////////////////////////////////////////////////////////
//
//  setCrsCxt(PCODE, CGame&, char*, bool)
//
//  for both CRS, CRSP & HCSP
//  init by TktDetail
//
//  when field is selected,
//  --  expand the field
//  --  adds all 28 contexts
//  --  calls setField in CContext
//
////////////////////////////////////////////////////////////////////////////////
const setCrsCxt = (
    pc: PCODE,
    g: Game,
    scSeln: string[],
    bFirstHalf: boolean
): string => {
    let bEmpty = true;
    let k = 0;
    let status: string = ERROR_MSG.RID_NO_ERROR;
    // all other selections and field are mutuel exclusive by ticket validation
    //
    //  only Pari-Mutuel has Field
    //
    if (
        scSeln[CRS_F_INDEX] === MARK &&
        pc !== PCODE.PC_DHCP &&
        g.getPool().bPariMutuel
    ) {
        //  loop 28 times in order to fill all the selections
        //  and DON'T forget to setField for the context in order to indicate that
        //  the added context is triggered field selected
        //
        while (k < CRS_F_INDEX) {
            if (k === CRS_H_O_INDEX) {
                status = addScCxt(
                    pc,
                    CRS_O_VALUE,
                    CRS_H_O_VALUE,
                    0,
                    bFirstHalf,
                    g
                );
            } else if (k === CRS_A_O_INDEX) {
                status = addScCxt(
                    pc,
                    CRS_O_VALUE,
                    CRS_A_O_VALUE,
                    0,
                    bFirstHalf,
                    g
                );
            } else if (k === CRS_D_O_INDEX) {
                status = addScCxt(
                    pc,
                    CRS_O_VALUE,
                    CRS_D_O_VALUE,
                    0,
                    bFirstHalf,
                    g
                );
            } else {
                status = addScCxt(
                    pc,
                    crs_home_tbl[k],
                    crs_away_tbl[k],
                    0,
                    bFirstHalf,
                    g
                );
            }

            if (
                pc === PCODE.PC_HCSP ||
                pc === PCODE.PC_CRSP /* || pc === PC_DHCP*/
            ) {
                setField(bFirstHalf, pc, g.contextList[g.numOfContexts - 1]);
            }

            k++;

            if (status !== ERROR_MSG.RID_NO_ERROR) {
                break;
            }
        }
    } else {
        if (scSeln[CRS_H_O_INDEX] === MARK) {
            status = addScCxt(pc, CRS_O_VALUE, CRS_H_O_VALUE, 0, bFirstHalf, g);
            bEmpty = false;
        }
        if (
            status === ERROR_MSG.RID_NO_ERROR &&
            scSeln[CRS_A_O_INDEX] === MARK
        ) {
            status = addScCxt(pc, CRS_O_VALUE, CRS_A_O_VALUE, 0, bFirstHalf, g);
            bEmpty = false;
        }
        if (
            status === ERROR_MSG.RID_NO_ERROR &&
            scSeln[CRS_D_O_INDEX] === MARK
        ) {
            status = addScCxt(pc, CRS_O_VALUE, CRS_D_O_VALUE, 0, bFirstHalf, g);
            bEmpty = false;
        }
        while (scSeln[k] && k < CRS_SELECTIONS_SIZE) {
            if (
                scSeln[k] === MARK &&
                k !== CRS_H_O_INDEX &&
                k !== CRS_A_O_INDEX &&
                k !== CRS_D_O_INDEX &&
                k !== CRS_F_INDEX
            ) {
                status = addScCxt(
                    pc,
                    crs_home_tbl[k],
                    crs_away_tbl[k],
                    0,
                    bFirstHalf,
                    g
                );
                bEmpty = false;
            }
            k++;
            if (status !== ERROR_MSG.RID_NO_ERROR) {
                break;
            }
        }

        if (
            bEmpty &&
            !g.bVoidLeg &&
            pc !== PCODE.PC_HFMP6 &&
            pc !== PCODE.PC_DHCP
        ) {
            status = ERROR_MSG.RID_EX_BE_INSUF_SELECT;
        }
        //        else if ( !bEmpty && g.isVoidLeg() ) {
        //            status = RID_EX_TKT_TOO_MANY_SELN;
        //        }
    }
    return status;
};

////////////////////////////////////////////////////////////////////////////////
//
//  setHftCxt(PCODE, CGame&, char*, int)
//
//  for both HFT, HFTP, THFP, HFMP6, HFMP8
//  init by TktDetail
//
//  when field is selected,
//  case THFP, HFMP6, HFMP8:
//      --  expand the field
//      --  adds all 9 contexts
//      --  calls setField in CContext
//
////////////////////////////////////////////////////////////////////////////////
const setHftCxt = (
    pc: PCODE,
    g: Game,
    scSeln: string[],
    leg,
    m_quickPick,
    m_bVoidMatches
): string => {
    let bEmpty = true;
    let k = 0;
    let status: string = ERROR_MSG.RID_NO_ERROR;

    if (m_quickPick) {
        if (pc === PCODE.PC_HFMP6 && leg > NO_OF_LEGS_OF_HAFU6 - 1) {
            //  HFMP6 qp is treat as a 12 legs bet, however, the capacity of scSeln
            //  is only for 6 legs. Hence, decrementing leg by 6
            leg = leg - NO_OF_LEGS_OF_HAFU6;
        } else if (pc === PCODE.PC_HFMP8 && leg > NO_OF_LEGS_OF_HAFU8 - 1) {
            //  HFMP8 qp is treat as a 16 legs bet, however, the capacity of scSeln
            //  is only for 6 legs. Hence, decrementing leg by 8
            leg = leg - NO_OF_LEGS_OF_HAFU8;
        }
    }

    //  only check for THFP, HFMP6 and HFMP8
    if (
        (pc === PCODE.PC_THFP ||
            pc === PCODE.PC_HFMP6 ||
            pc === PCODE.PC_HFMP8) &&
        scSeln[HFTP_F_INDEX] === MARK
    ) {
        for (k = 0; k < HFT_SELECTIONS_SIZE; k++) {
            status = addScCxt(
                pc,
                first_hft_tbl[k],
                second_hft_tbl[k],
                0,
                false,
                g
            );

            setField(false, pc, g.context(k));

            if (status !== ERROR_MSG.RID_NO_ERROR) {
                break;
            }
        }
    } else {
        while (k < HFT_SELECTIONS_SIZE) {
            if (scSeln[k] === MARK) {
                status = addScCxt(
                    pc,
                    first_hft_tbl[k],
                    second_hft_tbl[k],
                    0,
                    false,
                    g
                );
                bEmpty = false;
            }

            if (status !== ERROR_MSG.RID_NO_ERROR) {
                break;
            }
            k++;
        }

        //  quick pick can be empty selection in void leg
        //  HFMP6 & DHCP do not check this error here because bVoidMatches do not set ok now
        //  and HFMP6 & DHCP allow no selection for non first void leg
        if (bEmpty) {
            if (
                !m_quickPick &&
                !m_bVoidMatches[leg] &&
                pc !== PCODE.PC_HFMP6 &&
                pc !== PCODE.PC_DHCP
            ) {
                status = ERROR_MSG.RID_EX_TKT_INS_SELECTION;
            }
        }
    }

    if (pc === PCODE.PC_HFMP6 && leg > NO_OF_LEGS_OF_HAFU6 - 1 && !bEmpty) {
        status = ERROR_MSG.RID_EX_TKT_TOO_MANY_SELN;
    }

    return status;
};

////////////////////////////////////////////////////////////////////////////////
//
//  setContext( TICKET_DETAIL*, int)
//
//  set selections to every leg by looping n times,
//  where n is the number of leg get from setAllUp(tktDtl)
//
//  ONLY support all up for ACRS, AHAD and AHHAD now
//
//  when field is selected,
//  case THFP, HCSP, CRSP, HFMP6, HFMP8:
//      --  expand the field
//      --  adds all 28 contexts for HCSP and CRSP and 9 contexts for THFP,
//          HFMP6 and HFMP8
//      --  calls setField in context
//
////////////////////////////////////////////////////////////////////////////////
const setContext = (
    tktDtl: TICKET_DETAIL,
    leg: number,
    betObj: FootballBetObject
): string => {
    let status: string = ERROR_MSG.RID_NO_ERROR;
    let offset = 0; //  use for all up
    let g = betObj.gameList[leg];
    let pc = g.getPoolCode();
    const offsetObj = { offset: offset };
    switch (pc) {
        // selection either = SPACE/MARK else NULL for termiante
        // RHO newly added for SB_STB sectional HAD
        case PCODE.PC_STB:
            offset = STB_SELECTIONS_SIZE;
            g.nItemNum = tktDtl.entryNo; // RHO set the SCBet item no. equal to ticket EntryNo for SET NO.
            status = setCxt(
                pc,
                g,
                tktDtl.selection.slice(START_INDEX + leg * offset)
            );
            break;

        case PCODE.PC_AHAD:
        case PCODE.PC_AHHAD:
            offset = HAD_SELECTIONS_SIZE;
            status = setCxt(
                pc,
                g,
                tktDtl.selection.slice(START_INDEX + leg * offset)
            );
            break;

        case PCODE.PC_NTS: // Q408
        case PCODE.PC_ETS: // Q408 // Q408 [28/08/2008]
            g.nItemNum = tktDtl.game_type; // Store the No of Goal
            status = calculateOffset(offsetObj, leg, betObj);
            if (status === ERROR_MSG.RID_NO_ERROR) {
                offset = offsetObj.offset;
                status = setCxt(
                    pc,
                    g,
                    tktDtl.selection.slice(START_INDEX + offset)
                );
            }
            break;

        case PCODE.PC_HAD:
        case PCODE.PC_HHAD:
        case PCODE.PC_FHAD: //  Q306
        case PCODE.PC_FTS: //  Mar2011 M2
        case PCODE.PC_HDC:
        case PCODE.PC_OOE:
        case PCODE.PC_TTG:
        case PCODE.PC_TQL: //  Q407
            //  xpool
            status = calculateOffset(offsetObj, leg, betObj);
            if (status === ERROR_MSG.RID_NO_ERROR) {
                offset = offsetObj.offset;
                status = setCxt(
                    pc,
                    g,
                    tktDtl.selection.slice(START_INDEX + offset)
                );
            }
            break;
        case PCODE.PC_HIL:
        case PCODE.PC_FHLO: //	MR2011
        case PCODE.PC_CHLO: //	PSR2013
            status = calculateOffset(offsetObj, leg, betObj);
            if (status === ERROR_MSG.RID_NO_ERROR) {
                offset = offsetObj.offset;

                status = setCxt(
                    pc,
                    g,
                    tktDtl.selection.slice(START_INDEX + offset)
                );
                if (status === ERROR_MSG.RID_NO_ERROR) {
                    g.contextList.forEach((context) => {
                        if (pc === PCODE.PC_CHLO) {
                            context.scContext.comparedCorner1 =
                                '' + tktDtl.score1[leg + 1];
                            if (tktDtl.score2[leg + 1] > 0) {
                                context.scContext.split = true;
                                context.scContext.comparedCorner2 =
                                    '' + tktDtl.score2[leg + 1];
                            }
                        } else {
                            context.scContext.comparedScores1 =
                                '' + tktDtl.score1[leg + 1];
                            if (tktDtl.score2[leg + 1] > 0) {
                                context.scContext.split = true;
                                context.scContext.comparedScores2 =
                                    '' + tktDtl.score2[leg + 1];
                            }
                        }
                    });
                }
            }
            break;
        case PCODE.PC_FGS:
            offset = FGS_SELECTIONS_SIZE;
            status = setCxt(
                pc,
                g,
                tktDtl.selection.slice(START_INDEX + leg * offset)
            );
            break;
        case PCODE.PC_FCRS: // 	by Ken Lam, MSR2012 FCRS
        case PCODE.PC_CRS:
        case PCODE.PC_CRSP:
            if (g.getPool().bPariMutuel) {
                offset = CRSP_SELECTIONS_SIZE;
            } else {
                offset = CRS_SELECTIONS_SIZE;
            }
            status = setCrsCxt(
                pc,
                g,
                tktDtl.selection.slice(START_INDEX + leg * offset),
                false
            );
            break;

        case PCODE.PC_HCSP:
        case PCODE.PC_DHCP:
            {
                let legOffset = 0;
                //  this offset is set for 1st half and 2nd half
                offset = CRSP_SELECTIONS_SIZE; //  no. of seln for half time

                if (pc === PCODE.PC_DHCP) {
                    offset = CRS_SELECTIONS_SIZE;
                }

                if (leg > 0) {
                    legOffset = 1;
                }

                let bFirstHalf = true;
                // 	loop 2 times for both 1st and 2nd halves
                //
                for (
                    let i = 0;
                    i < 2 && status === ERROR_MSG.RID_NO_ERROR;
                    i++
                ) {
                    if (i === 0) {
                        bFirstHalf = true;
                    } else {
                        bFirstHalf = false;
                    }

                    status = setCrsCxt(
                        pc,
                        g,
                        tktDtl.selection.slice(
                            START_INDEX + (i + leg * 2) * offset + legOffset
                        ),
                        bFirstHalf
                    );
                }
            }
            break;

        case PCODE.PC_HFT:
            if (leg > 0) {
                offset = HFT_SELECTIONS_SIZE;
            }
            status = setHftCxt(
                pc,
                g,
                tktDtl.selection.slice(START_INDEX + leg * offset),
                leg,
                betObj.quickPick,
                betObj.bVoidMatches
            );
            break;

        case PCODE.PC_HFTP:
        case PCODE.PC_THFP:
        case PCODE.PC_HFMP6:
        case PCODE.PC_HFMP8:
            if (leg > 0) {
                //  add 1 for the terminator of a leg
                offset = THFP_SELECTIONS_SIZE + 1;
            }

            //  add 1 for starting from 1
            status = setHftCxt(
                pc,
                g,
                tktDtl.selection.slice(START_INDEX + leg * offset),
                leg,
                betObj.quickPick,
                betObj.bVoidMatches
            );
            break;

        case PCODE.PC_SPCM:
        default:
            status = ERROR_MSG.RID_EX_TKT_POOL_NOT_DEFINE_JKC;
            break;
    }

    return status;
};

const isHaFuIdentical = (
    nSeln1: number[],
    nSeln2: number[],
    nNumOfLegs: number
) => {
    let bIdentical = true;

    for (let i = 0; i < nNumOfLegs && bIdentical; i++) {
        if (nSeln1[i] !== nSeln2[i]) {
            bIdentical = false;
        }
    }

    return bIdentical;
};

const getHaFuQp = (seln: number[], nNumOfLegs) => {
    let i = 0;

    //  the number of legs for HaFu6 is 6
    //
    //    while ( i < NO_OF_LEGS_OF_HAFU6 ){
    while (i < nNumOfLegs) {
        //  mod 9 is to get the number range from 0 to 8
        //
        seln[i] = Math.random() % HFT_SELECTIONS_SIZE; // HFT_SELECTIONS_SIZE = 9
        i++;
    }
};

////////////////////////////////////////////////////////////////////////////////
//
//  setHftContext(PCODE, CGame&, bool*, CInt64*)
//
//  for both HFT, HFTP, THFP
//  init by ScBetEntry
//
//  when field is selected,
//  case THFP, HFMP6, HFMP8:
//      --  expand the field
//      --  adds all 9 contexts for THFP, HFMP6 and HFMP8
//      --  calls setField in CContext
//
////////////////////////////////////////////////////////////////////////////////
const setHftContext = (
    pc: PCODE,
    g: Game,
    scSeln: boolean[],
    odds: number[],
    m_quickPick: boolean
) => {
    let status: string = ERROR_MSG.RID_NO_ERROR;

    //  check FIELD first for ONLY THFP and HFMP6 or HFMP8 w/o QuickPick
    //
    if (
        (pc === PCODE.PC_THFP ||
            ((pc === PCODE.PC_HFMP6 || pc === PCODE.PC_HFMP8) &&
                !m_quickPick)) &&
        scSeln[THFP_SELECTIONS_SIZE - 1] === true
    ) {
        for (let i = 0; i < HFT_SELECTIONS_SIZE; i++) {
            status = addScCxt(
                pc,
                first_hft_tbl[i],
                second_hft_tbl[i],
                odds[i],
                false,
                g
            );
            setField(false, pc, g.contextList[i]);

            if (status !== ERROR_MSG.RID_NO_ERROR) {
                break;
            }
        }
    } else {
        for (let i = 0; i < HFT_SELECTIONS_SIZE; i++) {
            if (scSeln[i]) {
                status = addScCxt(
                    pc,
                    first_hft_tbl[i],
                    second_hft_tbl[i],
                    odds[i],
                    false,
                    g
                );

                if (status !== ERROR_MSG.RID_NO_ERROR) {
                    break;
                }
            }
        }
    }
    return status;
};

const setHftCxtMethod = (pc: PCODE, g: Game, scSeln, quickPick: boolean) => {
    const status = ERROR_MSG.RID_NO_ERROR;

    //  no odds means that it must not includes FIELD since
    //  FIELD is only for pari-mutuel
    const odds = new Array(HFT_SELECTIONS_SIZE).fill(0);

    setHftContext(pc, g, scSeln, odds, quickPick);

    return status;
};

////////////////////////////////////////////////////////////////////////////////
//
//  initHaFuQp(int mNum, byte mDay)
//
//  generates two sets of 9 selections of HaFu6 or HaFu8
//
////////////////////////////////////////////////////////////////////////////////
const initHaFuQp = (mNum, mDay, betObj: FootballBetObject): string => {
    const pc = betObj.gameList[0].getPoolCode();

    let status: string = ERROR_MSG.RID_NO_ERROR,
        nTry = 0,
        nLegs = NO_OF_LEGS_OF_HAFU6;

    if (pc === PCODE.PC_HFMP8) {
        nLegs = NO_OF_LEGS_OF_HAFU8;
    }

    const nSeln = [
        [-1, -1, -1, -1, -1, -1, -1, -1],
        [-1, -1, -1, -1, -1, -1, -1, -1],
    ];
    let bIdentical = true;
    const bSeln = new Array(NO_OF_LEGS_OF_HAFU8).fill(
        new Array(HFT_SELECTIONS_SIZE).fill(false)
    );

    //  treats HaFu6Qp as a 12 legs bet with one combination
    setAllUp(2 * nLegs, 1, betObj);

    if (status === ERROR_MSG.RID_NO_ERROR) {
        //  2 entries
        for (let k = 0; k < 2; k++) {
            //  number of entries = 2
            if (status === ERROR_MSG.RID_NO_ERROR) {
                //  always init the max size
                for (let i = 0; i < NO_OF_LEGS_OF_HAFU8; i++) {
                    bSeln[i].fill(false);
                }

                getHaFuQp(nSeln[k], nLegs);

                //  check if those selections of 2 entries are exactly the same
                //  generate those selections again if yes
                //
                if (k === 1) {
                    bIdentical = true;
                    nTry = 0;
                    while (bIdentical && nTry < 3) {
                        if (isHaFuIdentical(nSeln[0], nSeln[1], nLegs)) {
                            getHaFuQp(nSeln[k], nLegs);
                            nTry++;
                        } else {
                            bIdentical = false;
                        }
                    }
                    if (nTry >= 3 && bIdentical) {
                        status = ERROR_MSG.RID_EX_TKT_NO_POOL_MARK;
                    }
                }

                if (status === ERROR_MSG.RID_NO_ERROR) {
                    //  form an array of seln like tktDtl.selection
                    for (let m = 0; m < nLegs; m++) {
                        bSeln[m][nSeln[k][m]] = true;
                    }

                    for (let j = 0; j < nLegs; j++) {
                        if (j > 0 || k > 0) {
                            //  second leg of one of the entry
                            const tempPool = new Pool();
                            tempPool.setCode(pc);
                            const tempG = new Game();
                            tempG.bVoidLeg = betObj.bVoidMatches[j]
                                ? true
                                : false;
                            tempG.pool = tempPool;

                            betObj.gameList.push(tempG);
                        }
                        const pool = new Pool(pc, false, false);
                        pool.bPariMutuel = true;
                        betObj.gameList[j + nLegs * k].pool = pool;

                        betObj.oddsIndicator = ODDS_INDICATION.PARI_MUTUEL;

                        if (status === ERROR_MSG.RID_NO_ERROR) {
                            //  set the same date as the 1st leg
                            status = setMatch(
                                mNum,
                                mDay,
                                j + nLegs * k,
                                betObj
                            );

                            if (status === ERROR_MSG.RID_NO_ERROR) {
                                status = setHftCxtMethod(
                                    pc,
                                    betObj.gameList[j + nLegs * k],

                                    bSeln[j],
                                    betObj.quickPick
                                );
                            }

                            //  if any error break the for loop
                            if (status !== ERROR_MSG.RID_NO_ERROR) {
                                break;
                            }
                        }
                    }
                }
            }
            //  ensure those 2 timeStamps are different
            // Sleep(50);
        }
    }

    return status;
};

////////////////////////////////////////////////////////////////////////////////
//
//  NOTE:
//  1.  One item means one game.
//  2.  The 1st game has been init before triggering this routine
//  3.  SPC is a multiple games and non-allup pool except HFMP
//
////////////////////////////////////////////////////////////////////////////////
const setSpcmCxt = (
    tktDtl: TICKET_DETAIL,
    betObj: FootballBetObject
): string => {
    let status: string = ERROR_MSG.RID_NO_ERROR,
        gameNo = 0,
        nItemCnt = 0;
    const mNum = tktDtl.match[START_INDEX];

    const offset = SPC_TKT_MAX_SELN + 1; //  +1 for null terminator

    // itemMsk     = 1,	//	by Samuel Chan, 20140519
    const nSeln = 0;

    // 	by Samuel Chan, 20140519
    const itemMsk = 1;

    let scSeln = tktDtl.selection.slice(1),
        tmpSeln = NOTMARK;
    const mDay = (tktDtl.date[START_INDEX].charCodeAt(0) & 0x3f) - 1;
    const bEmpty = new Array(MAX_NUM_OF_ITEM).fill(true);

    //  check which item has selections
    for (let k = 0; k < MAX_NUM_OF_ITEM; k++) {
        if (tktDtl.game_type & (itemMsk << k)) {
            nItemCnt++;
            bEmpty[k] = false;

            //  since the 1st game has been added
            if (nItemCnt === 1) {
                betObj.gameList[0].nItemNum = k + 1; //  +1 due zero-indexing of k
            } else {
                const g = new Game();
                const pool = new Pool(PCODE.PC_SPCM, true, false, false);
                g.pool = pool;
                g.matchDay = mDay;
                g.matchNumber = mNum;
                //  no need to set pool, mDay, mNum since there are no different
                g.nItemNum = k + 1; //  +1 due zero-indexing of k
                betObj.gameList.push(g);
            }
        }
    }

    for (
        let i = 0;
        status === ERROR_MSG.RID_NO_ERROR && i < MAX_NUM_OF_ITEM;
        i++
    ) {
        if (!bEmpty[i]) {
            scSeln = tktDtl.selection.slice(START_INDEX + i * offset);

            for (
                let j = 0;
                status === ERROR_MSG.RID_NO_ERROR && j < SPC_TKT_MAX_SELN + 1;
                j++
            ) {
                tmpSeln = scSeln[j];

                if (tmpSeln === MARK) {
                    if (status === ERROR_MSG.RID_NO_ERROR) {
                        status = addScContext(
                            PCODE.PC_SPCM,
                            j + 1,
                            0,
                            betObj.gameList[gameNo]
                        ); //  +1 due zero-indexing of j
                    }
                }
            }

            if (status === ERROR_MSG.RID_NO_ERROR) {
                gameNo++;
            }
        }
    }

    if (status === ERROR_MSG.RID_NO_ERROR) {
        //  set all up leg to indicate multiple games
        betObj.allUp.leg = nItemCnt;
    }

    return status;
};

////////////////////////////////////////////////////////////////////////////////
//
//  special checking for tkt SC_HFMP68
//
//  if the marked match is for HaFu6, it must be error when there is mark at the
//  last 2 legs ( the 7th and 8th )
//
////////////////////////////////////////////////////////////////////////////////
const chkHaFu68Tkt = (tktDtl: TICKET_DETAIL) => {
    let status = ERROR_MSG.RID_NO_ERROR,
        nIndex = START_INDEX + NO_OF_LEGS_OF_HAFU6 * (THFP_SELECTIONS_SIZE + 1);

    //  only loop last extra selections
    for (let i = 0; i < 2 && status === ERROR_MSG.RID_NO_ERROR; i++) {
        for (
            let j = nIndex;
            j < nIndex + THFP_SELECTIONS_SIZE + 1 &&
            status === ERROR_MSG.RID_NO_ERROR;
            j++
        ) {
            if (tktDtl.selection[j] === MARK) {
                status = ERROR_MSG.RID_EX_TKT_TOO_MANY_SELN;
            }
        }

        nIndex =
            START_INDEX +
            (NO_OF_LEGS_OF_HAFU6 + 1) * (THFP_SELECTIONS_SIZE + 1);
    }

    return status;
};

const setByTkt = (tktDtl: TICKET_DETAIL, betObj: FootballBetObject): string => {
    let status: string = ERROR_MSG.RID_NO_ERROR;
    const m_gameList: Game[] = [];
    betObj.gameList = m_gameList;
    let i = 0;
    let pc;
    do {
        const g = new Game();
        m_gameList.push(g);

        status = setPool(tktDtl, i, betObj);

        if (status === ERROR_MSG.RID_NO_ERROR) {
            //                CGame g = game();
            pc = m_gameList[0].pool.code;

            //  chedck if default match
            //
            if (tktDtl.quick_pick) {
                betObj.quickPick = true;
            }

            //  special handling for HFMP
            //
            if (
                betObj.quickPick &&
                (pc === PCODE.PC_HFMP6 || pc === PCODE.PC_HFMP8)
            ) {
                const mDay =
                    (tktDtl.date[START_INDEX].charCodeAt(0) & 0x3f) - 1;
                const mNum = tktDtl.match[START_INDEX];

                status = setMatch(mNum, mDay, i, betObj);

                //  REMARK: treats HaFu6Qp as a 12-legs HFTP
                //
                if (status === ERROR_MSG.RID_NO_ERROR) {
                    //                        status = initHaFu6Qp(mNum, mDay);
                    status = initHaFuQp(mNum, mDay, betObj);
                }
            } else {
                ////////////////////////////////////////////////////////////////
                //  convert tktDtl.date[1] to matchDay
                //
                //  tktDtl   |  A   B   C   D   E   F   G
                //  ---------+----------------------------
                //  matchDay |  0   1   2   3   4   5   6
                //

                const mDay =
                    (tktDtl.date[START_INDEX + i].charCodeAt(0) & 0x3f) - 1;

                if (
                    tktDtl.pool[1] === TPCODE.SC_THFP ||
                    tktDtl.pool[1] === TPCODE.SC_DHCP || // tktDtl.pool[1] === SC_HFMP
                    tktDtl.pool[1] === TPCODE.SC_HFMP6 ||
                    tktDtl.pool[1] === TPCODE.SC_HFMP8
                ) {
                    //  In order to prevent from missing match day and num error,
                    // 	assign the same match info as the first one
                    // 	since there is only info in the first match
                    //
                    status = setMatch(
                        tktDtl.match[START_INDEX],
                        (tktDtl.date[START_INDEX].charCodeAt(0) & 0x3f) - 1,
                        i,
                        betObj
                    );
                } else {
                    status = setMatch(
                        tktDtl.match[START_INDEX + i],
                        mDay,
                        i,
                        betObj
                    );
                }

                if (status === ERROR_MSG.RID_NO_ERROR) {
                    if (pc === PCODE.PC_SPCM) {
                        status = setSpcmCxt(tktDtl, betObj);
                    } else {
                        status = setContext(tktDtl, i, betObj);
                    }
                }
            }
        }
        pc = m_gameList[i].pool.code;

        i++;
    } while (
        i < betObj.allUp.leg &&
        status === ERROR_MSG.RID_NO_ERROR &&
        !betObj.quickPick &&
        pc !== PCODE.PC_SPCM
    ); //  assume SPC does not support all up

    if (status === ERROR_MSG.RID_NO_ERROR && betObj.bHaFu68Tkt) {
        status = chkHaFu68Tkt(tktDtl);
    }
    return status;
};

const setTourGame = (
    nTourNo,
    nLeg,
    nGrpEvtNo,
    betObj: FootballBetObject
): string => {
    let status = ERROR_MSG.RID_NO_ERROR;

    const tg = betObj.tgameList[nLeg];
    const pc = tg.getPoolCode();
    if (pc === PCODE.PC_JKC) {
        nTourNo = NOV_NUM;
    }
    tg.nTourNo = nTourNo;

    switch (pc) {
        case PCODE.PC_CHP:
        case PCODE.PC_TOFP:
            tg.nGrpEvtNo = DEFAULT_EVT_NO;
            break;
        case PCODE.PC_GPF:
        case PCODE.PC_GPW:
            if (nGrpEvtNo <= 0) {
                status = ERROR_MSG.RID_EX_TKT_NO_GROUP;
            } else {
                tg.nGrpEvtNo = nGrpEvtNo;
            }
            break;
        case PCODE.PC_TPS:
            if (nGrpEvtNo <= 0) {
                //  no input from tkt, so default type
                nGrpEvtNo = DEFAULT_TPS_TYPE_NO;
            } else if (nGrpEvtNo === 1) {
                nGrpEvtNo = nGrpEvtNo + 1;
            }

            tg.nGrpEvtNo = nGrpEvtNo;
            tg.tpsType = nGrpEvtNo;
            break;
        case PCODE.PC_SPCT:
            //  1.  if from entry, it should be set always.
            //  2.  if from tkt, nGrp should be zero here but setSpctCxt() will set item num again to avoid setting zero here
            //
            //  TGame::validate() will check if it is zero
            //
            tg.nItemNum = nGrpEvtNo;
            break;

        case PCODE.PC_ADTP:
            if (nGrpEvtNo <= 0) {
                status = ERROR_MSG.RID_EX_TKT_NO_EVENT;
            } else {
                tg.nGrpEvtNo = nGrpEvtNo;
            }
            break;

        case PCODE.PC_JKC:
            tg.nItemNum = NOV_JKC_NUM;
            break;

        default:
            status = ERROR_MSG.RID_EX_BE_POOL_NOT_DEFINED;
            break;
    }

    return status;
};

////////////////////////////////////////////////////////////////////////////////
//
//  add context in a CTGame for CHP and TOFP
//
//  REMARK: the flag bChampion is only for TOFP
//          if it is true, it means that this selectionis to set in champion
//          if it is false, it means this selectionis to set in 1st runner up
//
////////////////////////////////////////////////////////////////////////////////
const tourAddScContext = (
    pc: PCODE,
    s: number,
    cnOdds: number,
    bChampion: boolean,
    g: TourGame
) => {
    let status: string = ERROR_MSG.RID_NO_ERROR;

    switch (pc) {
        case PCODE.PC_CHP:
        case PCODE.PC_GPW:
        case PCODE.PC_TPS:
        case PCODE.PC_SPCT:
        case PCODE.PC_JKC:
            {
                const c = new Context();
                setScContext(pc, s, c);
                c.odds = cnOdds;
                g.contextList.push(c);
                g.numOfContexts++;
            }
            break;
        case PCODE.PC_TOFP:
            {
                const c = new Context();
                setScContext(pc, s, c);
                if (pc === PCODE.PC_TOFP) {
                    const scContext = new SChamp1stRun();
                    scContext.nTeamNo = s;
                    scContext.bChampion = bChampion;
                    c.scContext = scContext;
                }
                c.odds = cnOdds;
                g.contextList.push(c);
                g.numOfContexts++;
            }
            break;
        default:
            status = ERROR_MSG.RID_EX_TKT_ILL_SELECTION;
            break;
    }

    return status;
};

const setNoveltyCxt = (
    tktDtl: TICKET_DETAIL,
    betObj: FootballBetObject
): string => {
    let status: string = ERROR_MSG.RID_NO_ERROR;
    // offset = JKC_TKT_MAX_SELN + 1, //  +1 for null terminator
    // nSeln = 0;

    let scSeln = tktDtl.selection.slice(1),
        tmpSeln = NOTMARK;
    const pool = new Pool(PCODE.PC_JKC, false, true);
    betObj.tgameList[0].pool = pool;
    betObj.tgameList[0].nTourNo = NOV_NUM;

    scSeln = tktDtl.selection.slice(START_INDEX);
    for (
        let j = 0;
        status === ERROR_MSG.RID_NO_ERROR && j < JKC_TKT_MAX_SELN + 1;
        j++
    ) {
        tmpSeln = scSeln[j];
        if (tmpSeln === MARK && status === ERROR_MSG.RID_NO_ERROR) {
            status = tourAddScContext(
                PCODE.PC_JKC,
                j + 1,
                0,
                false,
                betObj.tgameList[0]
            ); //  +1 due zero-indexing of j
        }
    }

    return status;
};

const setByTktForNovelty = (
    tktDtl: TICKET_DETAIL,
    betObj: FootballBetObject
) => {
    let status: string = ERROR_MSG.RID_NO_ERROR;
    let pc = PCODE.PC_XXX;
    betObj.quickPick = false;
    if (status === ERROR_MSG.RID_NO_ERROR) {
        let i = 0;
        do {
            const tg = new TourGame();
            betObj.tgameList.push(tg);

            status = setPool(tktDtl, i, betObj);

            if (status === ERROR_MSG.RID_NO_ERROR) {
                status = setTourGame(
                    tktDtl.date[START_INDEX].charCodeAt(0),
                    i,
                    tktDtl.match[START_INDEX + i],
                    betObj
                );

                if (status === ERROR_MSG.RID_NO_ERROR) {
                    status = setNoveltyCxt(tktDtl, betObj);
                }
            }
            pc = betObj.tgameList[i].getPoolCode();

            i++;
        } while (i < betObj.allUp.leg && status === ERROR_MSG.RID_NO_ERROR);
    }

    return status;
};

///////////////////////////////////////////////////////////////////////////////
//
//  NOTE:
//  1.  One item means one game.
//  2.  The 1st game has been init before triggering this routine
//  3.  SPC is a multiple games and non-allup pool except HFMP
//
////////////////////////////////////////////////////////////////////////////////
const setSpctCxt = (
    tktDtl: TICKET_DETAIL,
    betObj: FootballBetObject
): string => {
    let status: string = ERROR_MSG.RID_NO_ERROR,
        // nItemNo = tktDtl.match[START_INDEX + 1],
        gameNo = 0,
        nItemCnt = 0;
    const nSeln = 0;
    const itemMsk = 1;
    const offset = SPC_TKT_MAX_SELN + 1; //  +1 for null terminator
    let scSeln = tktDtl.selection.slice(1),
        tmpSeln = NOTMARK;
    let bEmpty = new Array(MAX_NUM_OF_ITEM - 5).fill(false);
    bEmpty = [true, true, true, true, true, ...bEmpty];

    //  check which item has selections
    for (let k = 0; k < MAX_NUM_OF_ITEM; k++) {
        if (tktDtl.game_type & (itemMsk << k)) {
            nItemCnt++;
            bEmpty[k] = false;

            //  since the 1st game has been added
            if (nItemCnt === 1) {
                betObj.tgameList[0].nItemNum = k + 1; //  +1 due zero-indexing of k
            } else {
                const tg = new TourGame();
                const pool = new Pool(PCODE.PC_SPCT, false, true);
                tg.pool = pool;
                tg.nTourNo = Number(tktDtl.date[START_INDEX].charCodeAt(0));
                tg.nItemNum = k + 1; //  +1 due zero-indexing of k
                betObj.tgameList.push(tg);
            }
        }
    }

    for (
        let i = 0;
        status === ERROR_MSG.RID_NO_ERROR && i < MAX_NUM_OF_ITEM;
        i++
    ) {
        if (!bEmpty[i]) {
            scSeln = tktDtl.selection.slice(START_INDEX + i * offset);
            for (
                let j = 0;
                status === ERROR_MSG.RID_NO_ERROR && j < SPC_TKT_MAX_SELN + 1;
                j++
            ) {
                tmpSeln = scSeln[j];
                if (tmpSeln === MARK && status === ERROR_MSG.RID_NO_ERROR) {
                    status = tourAddScContext(
                        PCODE.PC_SPCT,
                        j + 1,
                        0,
                        false,
                        betObj.tgameList[gameNo]
                    ); //  +1 due zero-indexing of j
                }
            }

            if (status === ERROR_MSG.RID_NO_ERROR) {
                gameNo++;
            }
        }
    }

    if (status === ERROR_MSG.RID_NO_ERROR) {
        //  set all up leg to indicate multiple games
        betObj.allUp.leg = nItemCnt;
    }

    return status;
};

//  for CHP, GPW, TPS
const setSimpleContext = (
    pc: PCODE,
    nSize: number,
    nLeg: number,
    bSeln,
    odds,
    betObj: FootballBetObject
) => {
    const tg = betObj.tgameList[nLeg];

    let status = ERROR_MSG.RID_NO_ERROR,
        bEmpty = true;

    for (let i = 0; i < nSize; i++) {
        if (bSeln[i]) {
            tourAddScContext(pc, i + 1, odds[i], false, tg);
            bEmpty = false;
        }
    }

    if (bEmpty) {
        status = ERROR_MSG.RID_MISSING_SELECTIONS;
    }

    return status;
};

const cvtCharSeln2BoolSeln = (sz: number, ch, bl) => {
    for (let i = 0; i < sz; i++) {
        if (ch[i] === MARK) {
            bl[i] = true;
        } else {
            bl[i] = false;
        }
    }
};

const setSimpleCxt = (
    pc: PCODE,
    nMaxSize: number,
    nTktSize: number,
    nLeg: number,
    chSeln: string[],
    betObj: FootballBetObject
) => {
    let status = ERROR_MSG.RID_NO_ERROR;

    //  declare the size for maximum boundary
    const bSeln = new Array(nMaxSize).fill(false);
    const odds = new Array(nMaxSize).fill(0);

    for (let i = 0; i < nMaxSize; i++) {
        bSeln[i] = false;
        odds[i] = 0;
    }

    //  only convert those from ticket
    //  hence, use different size
    //
    cvtCharSeln2BoolSeln(nTktSize, chSeln, bSeln);

    status = setSimpleContext(pc, nMaxSize, nLeg, bSeln, odds, betObj);

    return status;
};

const setTofpContext = (
    nSize: number,
    nLeg: number,
    bSeln,
    bChampion: boolean,
    odds,
    betObj: FootballBetObject
) => {
    const tg = betObj.tgameList[nLeg];
    let bEmpty = true;
    let status = ERROR_MSG.RID_NO_ERROR,
        nOffSet = 0;

    //  set field at the correct position
    //  prevent from confusing of champion and runner up
    if (!bChampion) {
        nOffSet = tg.numOfContexts;
    }

    //  check FIELD
    if (bSeln[nSize - 1]) {
        bEmpty = false;
        //  good enough to set only one context since there will be a FIELD indicator
        tourAddScContext(PCODE.PC_TOFP, 1, 0, bChampion, tg);

        setField(bChampion, tg.getPoolCode(), tg.contextList[nOffSet]);
    } else {
        for (let i = 0; i < nSize - 1; i++) {
            //  minus 1 for not counting FIELD
            if (bSeln[i]) {
                tourAddScContext(PCODE.PC_TOFP, i + 1, odds[i], bChampion, tg);
                bEmpty = false;
            }
        }
    }

    if (bEmpty) {
        status = ERROR_MSG.RID_MISSING_SELECTIONS;
    }

    return status;
};

const setTofpCxt2 = (
    nSize: number,
    nLeg: number,
    bSeln: boolean[],
    bChampion: boolean,
    odds: number[],
    betObj: FootballBetObject
): string => {
    const tg = betObj.tgameList[nLeg];
    let bEmpty = true;
    let status = ERROR_MSG.RID_NO_ERROR,
        nOffSet = 0;

    //  set field at the correct position
    //  prevent from confusing of champion and runner up
    if (!bChampion) {
        nOffSet = tg.numOfContexts;
    }

    //  check FIELD
    if (bSeln[nSize - 1]) {
        bEmpty = false;
        //  good enough to set only one context since there will be a FIELD indicator
        tourAddScContext(PCODE.PC_TOFP, 1, 0, bChampion, tg);
        setField(bChampion, tg.getPoolCode(), tg.contextList[nOffSet]);
    } else {
        for (let i = 0; i < nSize - 1; i++) {
            //  minus 1 for not counting FIELD
            if (bSeln[i]) {
                tourAddScContext(PCODE.PC_TOFP, i + 1, odds[i], bChampion, tg);
                bEmpty = false;
            }
        }
    }

    if (bEmpty) {
        status = ERROR_MSG.RID_MISSING_SELECTIONS;
    }

    return status;
};

const setTofpCxt = (nLeg, chSeln, betObj: FootballBetObject) => {
    let status: string = ERROR_MSG.RID_NO_ERROR;

    //  declare the size for maximum boundary
    const bSeln = new Array(TOFP_HALF_SELECTIONS_SIZE).fill(false);
    const odds = new Array(TOFP_HALF_SELECTIONS_SIZE).fill(0);

    for (let i = 0; i < TOFP_HALF_SELECTIONS_SIZE; i++) {
        bSeln[i] = false;
        odds[i] = 0;
    }

    //  only convert those from ticket
    //  hence, use different size
    //
    cvtCharSeln2BoolSeln(TOFP_TKT_MAX_SELN, chSeln, bSeln);
    status = setTofpContext(
        TOFP_TKT_MAX_SELN,
        nLeg,
        bSeln,
        TOFP_CHAMPION,
        odds,
        betObj
    );

    if (status === ERROR_MSG.RID_NO_ERROR) {
        //  reset before conversion again
        for (let i = 0; i < TOFP_HALF_SELECTIONS_SIZE; i++) {
            bSeln[i] = false;
        }

        //  for selections in 1st runner up
        //
        //  only convert those from ticket
        //  hence, use different size
        //
        cvtCharSeln2BoolSeln(
            TOFP_TKT_MAX_SELN,
            chSeln.slice(TOFP_TKT_MAX_SELN),
            bSeln
        );

        status = setTofpCxt2(
            TOFP_TKT_MAX_SELN,
            nLeg,
            bSeln,
            TOFP_1ST_RUNNERUP,
            odds,
            betObj
        );
    }
    return status;
};

///////////////////////////////////////////////////////////////////////////////
//
//  only for tkt
//
//  no need to use different size because there is no common routine for GPF
//
////////////////////////////////////////////////////////////////////////////////
const setGpfCxtForTkt = (
    nLeg: number,
    chSeln: string[],
    nSize: number,
    betObj: FootballBetObject
): string => {
    const tg = betObj.tgameList[nLeg];

    const nWinnerNo = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let nRunnerUpNo = 0,
        status: string = ERROR_MSG.RID_NO_ERROR;

    const bSeln = new Array(GPWF_SELECTIONS_PER_GRP).fill(false);
    const odds = new Array(GPWF_SELECTIONS_PER_GRP).fill(0);

    cvtCharSeln2BoolSeln(nSize, chSeln, bSeln);

    //  mark winner first
    for (let j = 0; j < nSize; j++) {
        if (bSeln[j]) {
            //  set the selection number for winner
            nWinnerNo[j] = j + 1;
        }
    }

    //  reset ALL bSeln before conversion again
    for (let k = 0; k < GPWF_SELECTIONS_PER_GRP; k++) {
        bSeln[k] = false;
    }

    //  convert runner up
    cvtCharSeln2BoolSeln(nSize, chSeln.slice(nSize), bSeln);

    for (let m = 0; m < nSize && status === ERROR_MSG.RID_NO_ERROR; m++) {
        if (nWinnerNo[m] > 0) {
            for (
                let n = 0;
                n < nSize && status === ERROR_MSG.RID_NO_ERROR;
                n++
            ) {
                if (bSeln[n]) {
                    //  set context if winner != runner up
                    //  REMARK: + 1 since it is zero-index
                    //
                    nRunnerUpNo = n + 1;
                    if (nWinnerNo[m] !== nRunnerUpNo) {
                        status = tourAddScContext2(
                            PCODE.PC_GPF,
                            nWinnerNo[m],
                            nRunnerUpNo,
                            0,
                            tg
                        );
                    }
                }
            }
        }
    }

    return status;
};

const tourAddScContext2 = (
    pc: PCODE,
    s1: number,
    s2: number,
    cnOdds: number,
    g: TourGame
): string => {
    let status = ERROR_MSG.RID_NO_ERROR;

    switch (pc) {
        case PCODE.PC_GPF:
        case PCODE.PC_ADTP:
            {
                const c = new Context();
                setScCxt(pc, s1, s2, false, c);
                c.odds = cnOdds;
                g.contextList.push(c);
                g.numOfContexts++;
            }
            break;
        default:
            status = ERROR_MSG.RID_EX_TKT_ILL_SELECTION;
            break;
    }

    return status;
};

const setAdtpCxt = (
    nSize: number,
    nLeg: number,
    nGrpNo: number,
    bSeln: boolean[],
    odds: number[],
    betObj: FootballBetObject
): string => {
    const tg = betObj.tgameList[nLeg];

    const status = ERROR_MSG.RID_NO_ERROR;
    let nSelnNo = 0;
    const nOffset = tg.numOfContexts; //  set field at the correct position
    //  prevent from confusing of another group

    //  check FIELD
    if (bSeln[nSize - 1]) {
        //  good enough to set only one context since there will be a FIELD indicator
        tourAddScContext2(PCODE.PC_ADTP, nGrpNo, 1, 0, tg);
        setField(true, tg.getPoolCode(), tg.contextList[nOffset]);
    } else {
        for (let i = 0; i < nSize - 1; i++) {
            //  minus 1 for not counting FIELD
            if (bSeln[i]) {
                //  + 1 since the seln number start from 1, not 0
                nSelnNo = i + 1;
                tourAddScContext2(PCODE.PC_ADTP, nGrpNo, nSelnNo, odds[i], tg);
            }
        }
    }

    return status;
};

////////////////////////////////////////////////////////////////////////////////
//
//  for tkt only
//
//  chSeln contains all seln of all group in a ticket
//
////////////////////////////////////////////////////////////////////////////////
const setAdtpCxtForTkt = (
    nLeg: number,
    chSeln: string[],
    betObj: FootballBetObject
): string => {
    let status: string = ERROR_MSG.RID_NO_ERROR,
        nGrpNo = 0;
    const bEmpty = true;

    //  declare the size for maximum boundary
    const bSeln = new Array(ADTP_SELECTIONS_SIZE).fill(false);
    const odds = new Array(ADTP_SELECTIONS_SIZE).fill(0);

    for (let i = 0; i < TKT_MAX_GRP && status === ERROR_MSG.RID_NO_ERROR; i++) {
        //  init before conversion
        bSeln.fill(false);
        odds.fill(0);

        //  only convert those from ticket
        //  hence, use different size
        //
        cvtCharSeln2BoolSeln(
            ADTP_TKT_MAX_SELN,
            chSeln.slice(ADTP_TKT_MAX_SELN * i),
            bSeln
        );

        //  + 1 since the group number start from 1, not 0
        nGrpNo = i + 1;
        status = setAdtpCxt(
            ADTP_TKT_MAX_SELN,
            nLeg,
            nGrpNo,
            bSeln,
            odds,
            betObj
        );
    }
    return status;
};

const setTourGameContext = (
    tktDtl: TICKET_DETAIL,
    nLeg: number,
    betObj: FootballBetObject
): string => {
    const tg = betObj.tgameList[nLeg];
    const pc = tg.getPoolCode();

    let status: string = ERROR_MSG.RID_NO_ERROR,
        nMaxSeln = 0;
    const nMax = tg.maxNumOfContexts;

    switch (pc) {
        case PCODE.PC_CHP:
            status = setSimpleCxt(
                pc,
                CHP_SELECTIONS_SIZE,
                CHP_TKT_MAX_SELN,
                nLeg,
                tktDtl.selection.slice(START_INDEX + nLeg * CHP_TKT_MAX_SELN),
                betObj
            );
            break;

        case PCODE.PC_TOFP:
            status = setTofpCxt(
                nLeg,
                tktDtl.selection.slice(START_INDEX + nLeg * TOFP_TKT_MAX_SELN),
                betObj
            );
            break;

        case PCODE.PC_GPF:
            if (
                tktDtl.ticket_id === TKT_SCBET_GPW_GPF_4X ||
                tktDtl.ticket_id === TKT_SCBET_GPW_GPF_8X
            ) {
                nMaxSeln = GPWF_NEW_TKT_MAX_SELN;
            } else {
                nMaxSeln = GPWF_TKT_MAX_SELN;
            }

            //  times 2 for winner and runner up
            status = setGpfCxtForTkt(
                nLeg,
                tktDtl.selection.slice(START_INDEX + nLeg * nMaxSeln * 2),
                nMaxSeln,
                betObj
            );
            break;

        case PCODE.PC_ADTP:
            status = setAdtpCxtForTkt(
                nLeg,
                tktDtl.selection.slice(
                    START_INDEX + nLeg * ADTP_TKT_MAX_SELN * TKT_MAX_GRP
                ),
                betObj
            );
            break;

        case PCODE.PC_GPW:
            if (
                tktDtl.ticket_id === TKT_SCBET_GPW_GPF_4X ||
                tktDtl.ticket_id === TKT_SCBET_GPW_GPF_8X
            ) {
                nMaxSeln = GPWF_NEW_TKT_MAX_SELN;
            } else {
                nMaxSeln = GPWF_TKT_MAX_SELN;
            }

            status = setSimpleCxt(
                pc,
                GPW_SELECTIONS_SIZE,
                nMaxSeln,
                nLeg,
                tktDtl.selection.slice(START_INDEX + nLeg * nMaxSeln),
                betObj
            );
            break;

        case PCODE.PC_TPS:
            status = setSimpleCxt(
                pc,
                TPS_SELECTIONS_SIZE,
                TPS_TKT_MAX_SELN,
                nLeg,
                tktDtl.selection.slice(START_INDEX + nLeg * TPS_TKT_MAX_SELN),
                betObj
            );
            break;

        /*  SPECIAL POOL
            case PC_SPC:
                it has been done out of in the routine initByTktForTournament by calling setSpctCxt
                break;
        */
        default:
            status = ERROR_MSG.RID_EX_BE_POOL_NOT_DEFINED;
            break;
    }

    return status;
};

const setByTktForTournament = (
    tktDtl: TICKET_DETAIL,
    betObj: FootballBetObject
) => {
    let status: string = ERROR_MSG.RID_NO_ERROR;
    let pc = PCODE.PC_XXX;

    //  no quick pick support 23/02/2004
    betObj.quickPick = false;
    if (status === ERROR_MSG.RID_NO_ERROR) {
        let i = 0;
        do {
            const tg = new TourGame();
            betObj.tgameList.push(tg);

            status = setPool(tktDtl, i, betObj);

            if (status === ERROR_MSG.RID_NO_ERROR) {
                status = setTourGame(
                    tktDtl.date[START_INDEX].charCodeAt(0),
                    i,
                    tktDtl.match[START_INDEX + i],
                    betObj
                );

                if (status === ERROR_MSG.RID_NO_ERROR) {
                    if (tktDtl.pool[1] === TPCODE.SC_SPCT) {
                        status = setSpctCxt(tktDtl, betObj);
                    } else {
                        status = setTourGameContext(tktDtl, i, betObj);
                    }
                }
            }
            pc = betObj.tgameList[i].getPoolCode();

            i++;
        } while (
            i < betObj.allUp.leg &&
            status === ERROR_MSG.RID_NO_ERROR &&
            pc !== PCODE.PC_SPCT
        ); //  assume SPC does not support all up
    }

    return status;
};

const setUnitBet = (
    tktDtl: TICKET_DETAIL,
    betObj: FootballBetObject
): string => {
    const status: string = ERROR_MSG.RID_NO_ERROR;

    let cnt = 1, // loop counter
        total = 0; // total value
    let value_table = [];

    //  different ticket id may has different value table in
    //  cal. the total unit bet value
    //
    if (
        tktDtl.ticket_id === TKT_SCBET_AHAD_7X ||
        tktDtl.ticket_id === TKT_SCBET_AHHAD_7X ||
        tktDtl.ticket_id === TKT_SCBET_ACRS_6X ||
        tktDtl.ticket_id === TKT_SCBET_GPF_4X ||
        tktDtl.ticket_id === TKT_SCBET_CHP_TPS ||
        tktDtl.ticket_id === TKT_SCBET_GPW_GPF_4X ||
        tktDtl.ticket_id === TKT_SCBET_AHDC_8X ||
        tktDtl.ticket_id === TKT_SCBET_GPW_GPF_8X ||
        tktDtl.ticket_id === TKT_SCBET_AMULTI_8X ||
        tktDtl.ticket_id === TKT_SCBET_AMULTI_ML_8X || //  By star feng 2015-06-02  Add Multiple Lines
        tktDtl.ticket_id === TKT_SCBET_NTS_TQL
    ) {
        //        value_table = &sc_value_multipool_tbl[0];
        value_table = sc_value_tbl;
    } else if (
        tktDtl.ticket_id === TKT_SCBET_AHAD ||
        tktDtl.ticket_id === TKT_SCBET_AHHAD ||
        tktDtl.ticket_id === TKT_SCBET_FGS_3X
    ) {
        //        value_table = &sc_value_3x7_tbl[0];
        value_table = sc_value_tbl;
    } else if (
        tktDtl.ticket_id === TKT_SCBET_THFP ||
        tktDtl.ticket_id === TKT_SCBET_HCSP ||
        tktDtl.ticket_id === TKT_SCBET_HFMP6 ||
        tktDtl.ticket_id === TKT_SCBET_HFMP68 ||
        tktDtl.ticket_id === TKT_SCBET_DHCP ||
        tktDtl.ticket_id === TKT_SCBET_ACRS
    ) {
        value_table = sc_value_little_amt_tbl;
    } else if (tktDtl.ticket_id === TKT_SCBET_ACRS_6X_P) {
        value_table = sc_value_little_amt_6x_ACRS_tbl;
    } else if (tktDtl.ticket_id === TKT_SCBET_STB) {
        value_table = sc_value_stb_tbl;
    } else {
        //  including:
        //  TKT_SCBET_ACRS100_6X
        //  TKT_SCBET_AHFT100_6X
        //  TKT_SCBET_ACRS100_3X
        //  TKT_NOVELTY_JKC_14
        //  assign diff value into value_table
        value_table = sc_value_tbl;
    }

    while (tktDtl.value[cnt]) {
        // loop for all marks, if any

        if (tktDtl.value[cnt] === MARK) {
            total += value_table[cnt];
        }
        cnt++;
    }

    // m_unitAmount store cents, so total * 100
    const longTotal = total * 100;
    betObj.unitBet = Number(longTotal);

    return status;
};

////////////////////////////////////////////////////////////////////////////////
//
//  checkValidGame( int nLeg, bool bTournament )
//
//  by Jason on 06/12/2004
//
//  to check if a CGame or CTGame is valid before calling game(int) or tgame(int)
//
////////////////////////////////////////////////////////////////////////////////
const checkValidGame = (nLeg, betObj: FootballBetObject): boolean => {
    let bValid = false;

    if (betObj.scBetType === SCBET_TYPE.TOUR_BET) {
        if (betObj.tgameList.length > 0 && nLeg <= betObj.tgameList.length) {
            bValid = true;
        }
    } else if (betObj.scBetType === SCBET_TYPE.MATCH_BET) {
        if (betObj.tgameList.length > 0 && nLeg <= betObj.tgameList.length) {
            bValid = true;
        }
    }

    return bValid;
};

const setBonusLevel = (betObj: FootballBetObject) => {
    //  by Jason on 06/12/2004
    //  only allow bonus for SCB
    if (
        betObj.scBetType === SCBET_TYPE.MATCH_BET &&
        checkValidGame(0, betObj)
    ) {
        if (
            betObj.gameList[0].getPoolCode() === PCODE.PC_STB ||
            betObj.allUpType === ALLUP_TYPE.XPOOL_ALLUP
        ) {
            betObj.bonusLevel = betObj.allUp.leg;
        }
    }
};

export const ticketDetailToBetObj = (req, res, next) => {
    let status: string = ERROR_MSG.RID_NO_ERROR;
    const tktDtl: TICKET_DETAIL = req.ticketDetail;
    const betObj: FootballBetObject = new FootballBetObject();
    betObj.allUpType = ALLUP_TYPE.NON_ALLUP;
    betObj.bVoidMatches = new Array(MAX_SCBET_LEG).fill(0);
    const pool = tktDtl.pool[1];
    let poolStr = '';
    const scStr = getObjectKeyFromValue(pool, TPCODE);
    if (scStr === '') {
        status = ERROR_MSG.RID_EX_TKT_POOL_NOT_DEFINE_JKC;
    } else {
        poolStr = scStr.replace('S', 'P');
    }
    if (isKeyInObject(poolStr, PCODE)) {
        betObj.scBetType =
            FootballCriteriaGlobal.FootballBetObjectCriteria[poolStr].scBetType;
        if (
            FootballCriteriaGlobal.FootballBetObjectCriteria[poolStr]
                .bPariMutuel
        ) {
            betObj.oddsIndicator = ODDS_INDICATION.PARI_MUTUEL;
        } else {
            betObj.oddsIndicator = ODDS_INDICATION.FIXED_ODDS_WITHOUT_ODDS;
        }
    } else {
        status = ERROR_MSG.RID_EX_TKT_POOL_NOT_DEFINE_JKC;
    }
    status = setBetAllUp(tktDtl, betObj);
    if (poolStr === 'PC_JKC') {
        status = setByTktForNovelty(tktDtl, betObj);
    } else if (betObj.scBetType === SCBET_TYPE.MATCH_BET) {
        status = setByTkt(tktDtl, betObj);
    } else {
        status = setByTktForTournament(tktDtl, betObj);
    }

    if (status === ERROR_MSG.RID_NO_ERROR) {
        if (betObj.quickPick) {
            betObj.unitBet = 1000;
        } else {
            status = setUnitBet(tktDtl, betObj);
        }
    }
    let a = JSON.stringify(betObj);
    console.log(a);
    if (status === ERROR_MSG.RID_NO_ERROR) {
        //  by Jason on 09/09/2004
        setBonusLevel(betObj);
    }
    if (status === ERROR_MSG.RID_NO_ERROR) {
        req.footballBetObject = betObj;
        next();
    } else {
        const resObj: ResponseObject = Object.assign({}, SUCCESS_RESPONSE);
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = status;
        res.status(200).send(resObj);
        return;
    }
};
