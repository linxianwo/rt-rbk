//********************************************************************
//*
//*   @COPYRIGHT. This software is the property of the Royal Hong Kong
//*   Jockey Club and is not to be disclosed, copied, or used in whole
//*   or part without proper authorization.
//*   1995
//*
//* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
//*
//*    SCBETDEFINE.H
//*
//*
//*    ScBet definition
//*
//*********************************************************************

#ifndef _SCBETDEFINE_H_
#define _SCBETDEFINE_H_

#if _MSC_VER > 1000
#pragma once
#endif // _MSC_VER > 1000

#define SEVEN_WEEKDAYS 7
#define ALL_DAYS 0x07

#define HOME_TEAM 0
#define AWAY_TEAM 1

#define CRS00 808464432
#define CRS01 808464688
#define CRS02 808464944
#define CRS03 808465200
#define CRS04 808465456
#define CRS10 825241648
#define CRS11 825241904
#define CRS12 825242160
#define CRS13 825242416
#define CRS14 825242672
#define CRS20 842018864
#define CRS21 842019120
#define CRS22 842019376
#define CRS23 842019632
#define CRS24 842019888
#define CRS30 858796080
#define CRS31 858796336
#define CRS32 858796592
#define CRS33 858796848
#define CRS34 858797104
#define CRS40 875573296
#define CRS41 875573552
#define CRS42 875573808
#define CRS43 875574064
#define CRS44 875574320
#define CRSHO 825051181
#define CRSDO 825050157
#define CRSAO 825049389
#define CRS50 892350512
#define CRS51 892350768
#define CRS52 892351024
#define CRS05 808465712
#define CRS15 825242928
#define CRS25 842020144

#define HAD_MASK 0x00000001
#define HDC_MASK 0x00000002
#define CRS_MASK 0x00000004
#define HFT_MASK 0x00000008
#define TTG_MASK 0x00000010
#define HIL_MASK 0x00000020
#define OOE_MASK 0x00000040
#define FGS_MASK 0x00000080
#define CHP_MASK 0x00000100
#define HHAD_MASK 0x00000400
#define TQL_MASK 0x00000800 //  Q407
#define NTS_MASK 0x00001000
#define ETS_MASK 0x00002000
#define FTS_MASK 0x00004000  //	Mar2011 M2
#define FHLO_MASK 0x00008000 //	MR2011 FHLO
#define CHLO_MASK 0x00010000 //	PSR2013 CHLO
#define FCRS_MASK 0x00020000 //  by Ken Lam, MSR2012 FCRS, First Half Correct Score
#define CRSP_MASK 0x00040000
#define HFTP_MASK 0x00080000
#define HCSP_MASK 0x01000000
#define THFP_MASK 0x02000000
#define HFMP6_MASK 0x04000000
#define HDCP_MASK 0x08000000
#define HFMP8_MASK 0x10000000
#define SPCM_MASK 0x20000000
#define FHAD_MASK 0x40000000

#define TPS_OTHERS 51

//  maximum number of selections can be sent to BE in comms buffer
#define MAX_CRS_SELECTIONS 52
#define MAX_FGS_SELECTIONS 61
#define MAX_GPF_SELECTIONS MAX_CRS_SELECTIONS
#define MAX_GPW_SELECTIONS 57
#define MAX_TPS_SELECTIONS MAX_FGS_SELECTIONS
#define MAX_CHP_SELECTIONS MAX_FGS_SELECTIONS
#define MAX_TOFP_SELECTIONS 122

#define NO_OF_LEGS_OF_DHCP 2
#define NO_OF_LEGS_OF_THFP 3
#define NO_OF_LEGS_OF_HAFU6 6
#define NO_OF_LEGS_OF_HAFU8 8

#define VOID_MATCH_SCORE 101 //SQ47141: homeScore == 101 || awayScore == 101 -> Void Match (petersee 20100319)
#define VOID_MATCH_STR_CHI "�y�ɵL��"
#define VOID_MATCH_STR_ENG "Void Match"

//	by Samuel Chan, 20130705
//	SQ#60688: should check bit 3 only
#define BET_REPLY_ODDS_CHANGED 0x01
#define BET_REPLY_UNITBET_CHANGED 0x02
#define BET_REPLY_ODDS_UP_TO_THREE_DECIMAL 0x04
#define BET_REPLY_PAYOUT_EXCEED_LIMIT 0x08
#define BET_REPLY_INPLAY_TICKET 0x10

const DWORD DISABLE_ALL_POOLS = 0x00000000L;

//  this structure is used by player league and team
struct S_SBInfoTable
{
    int number;         //  same as code or id
    USHORT combination; // 101 to 199 home players; 201 to 299 away players
    wchar_t chineseName;
    wchar_t englishName;
    wchar_t shortEngName;
};

typedef enum
{
    SUN = 0,
    MON,
    TUE,
    WED,
    THU,
    FRI,
    SAT,
    DAY_DIM
} DAY_CODE;

typedef enum
{
    MATCH_1 = 0,
    MATCH_2,
    MATCH_3,
    MATCH_4,
    MATCH_5,
    MATCH_6,
    MATCH_7,
    MATCH_8,
    MATCH_9,
    MATCH_10,
    MATCH_11,
    MATCH_12,
    MATCH_13,
    MATCH_14,
    MATCH_15,
    MATCH_16,
    MATCH_17,
    MATCH_18,
    MATCH_19,
    MATCH_20,
    MATCH_21,
    MATCH_22,
    MATCH_23,
    MATCH_24,
    MATCH_25,
    MATCH_26,
    MATCH_27,
    MATCH_28,
    MATCH_29,
    MATCH_30,
    MATCH_31,
    MATCH_32,
    MATCH_33,
    MATCH_34,
    MATCH_35,
    MATCH_36,
    MATCH_37,
    MATCH_38,
    MATCH_39,
    MATCH_40,
    MATCH_41,
    MATCH_42,
    MATCH_43,
    MATCH_44,
    MATCH_45,
    MATCH_46,
    MATCH_47,
    MATCH_48,
    MATCH_49,
    MATCH_50,
    MATCH_51,
    MATCH_52,
    MATCH_53,
    MATCH_54,
    MATCH_55,
    MATCH_56,
    MATCH_57,
    MATCH_58,
    MATCH_59,
    MATCH_60,
    MATCH_61,
    MATCH_62,
    MATCH_63,
    MATCH_64,
    MATCH_65,
    MATCH_66,
    MATCH_67,
    MATCH_68,
    MATCH_69,
    MATCH_70,
    MATCH_71,
    MATCH_72,
    MATCH_73,
    MATCH_74,
    MATCH_75,
    MATCH_76,
    MATCH_77,
    MATCH_78,
    MATCH_79,
    MATCH_80,
    MATCH_81,
    MATCH_82,
    MATCH_83,
    MATCH_84,
    MATCH_85,
    MATCH_86,
    MATCH_87,
    MATCH_88,
    MATCH_89,
    MATCH_90,
    MATCH_91,
    MATCH_92,
    MATCH_93,
    MATCH_94,
    MATCH_95,
    MATCH_96,
    MATCH_97,
    MATCH_98,
    MATCH_99,
    MATCH_100,
    MATCH_101,
    MATCH_102,
    MATCH_103,
    MATCH_104,
    MATCH_105,
    MATCH_106,
    MATCH_107,
    MATCH_108,
    MATCH_109,
    MATCH_110,
    MATCH_111,
    MATCH_112,
    MATCH_113,
    MATCH_114,
    MATCH_115,
    MATCH_116,
    MATCH_117,
    MATCH_118,
    MATCH_119,
    MATCH_120,
    MATCH_121,
    MATCH_122,
    MATCH_123,
    MATCH_124,
    MATCH_125,
    MATCH_126,
    MATCH_127,
    MATCH_128,
    MATCH_129,
    MATCH_130,
    MATCH_131,
    MATCH_132,
    MATCH_133,
    MATCH_134,
    MATCH_135,
    MATCH_136,
    MATCH_137,
    MATCH_138,
    MATCH_139,
    MATCH_140,
    MATCH_141,
    MATCH_142,
    MATCH_143,
    MATCH_144,
    MATCH_145,
    MATCH_146,
    MATCH_147,
    MATCH_148,
    MATCH_149,
    MATCH_150,
    MATCH_DIM
} MATCH_NUM;

typedef enum
{
    ALUPF_2X1 = 0,
    ALUPF_2X3,
    ALUPF_3X1,
    ALUPF_3X3,
    ALUPF_3X4,
    ALUPF_3X6,
    ALUPF_3X7,
    ALUPF_4X1,
    ALUPF_4X4,
    ALUPF_4X5,
    ALUPF_4X6,
    ALUPF_4X10,
    ALUPF_4X11,
    ALUPF_4X14,
    ALUPF_4X15,
    ALUPF_5X1,
    ALUPF_5X5,
    ALUPF_5X6,
    ALUPF_5X10,
    ALUPF_5X15,
    ALUPF_5X16,
    ALUPF_5X20,
    ALUPF_5X25,
    ALUPF_5X26,
    ALUPF_5X30,
    ALUPF_5X31,
    ALUPF_6X1,
    ALUPF_6X6,
    ALUPF_6X7,
    ALUPF_6X15,
    ALUPF_6X20,
    ALUPF_6X21,
    ALUPF_6X22,
    ALUPF_6X35,
    ALUPF_6X41,
    ALUPF_6X42,
    ALUPF_6X50,
    ALUPF_6X56,
    ALUPF_6X57,
    ALUPF_6X62,
    ALUPF_6X63,
    ALUPF_7X1,
    ALUPF_7X7,
    ALUPF_7X8,
    ALUPF_7X21,
    ALUPF_7X28,
    ALUPF_7X29,
    ALUPF_7X35,
    ALUPF_7X56,
    ALUPF_7X63,
    ALUPF_7X64,
    ALUPF_7X70,
    ALUPF_7X91,
    ALUPF_7X98,
    ALUPF_7X99,
    ALUPF_7X112,
    ALUPF_7X119,
    ALUPF_7X120,
    ALUPF_7X126,
    ALUPF_7X127,
    ALUPF_8X1,
    ALUPF_8X8,
    ALUPF_8X9,
    ALUPF_8X28,
    ALUPF_8X56,
    ALUPF_8X70,
    ALUPF_8X247,
    ALUPF_8X255,
    ALUPF_DIM
} ALLUP_FORMULA;

typedef enum
{
    PC_HAD = 0,
    PC_HDC, //  handicap
    PC_CRS, //  correct scores
    PC_HFT, //  half/full time
    PC_TTG, //  total scores
    PC_HIL, //  high/low
    PC_OOE, //  odd even
    PC_FGS, //  first goal scorer
    PC_HCSP,
    PC_HHAD, //  handicap HAD
    PC_FHAD,
    PC_TQL,  //  Q407
    PC_FCRS, //  by Ken Lam, MSR2012 FCRS, First Half Correct Score

    //Name: Peter See
    //Date: 16/07/2008
    //Description: (Q408) Add NTS Pool
    //******************************************************************************
    PC_NTS,
    PC_ETS,
    //******************************************************************************

    PC_FTS, //	Mar2011 M2

    //	MR2011 FHLO
    //	by Samuel Chan, 20110830
    //	the no maybe change
    PC_FHLO, //	half time HiLo

    PC_CHLO, //	PSR2013 CHLO

    //  the following two PCODE have to be change to their original pool code and
    //  bit mask the indicator when sending bet
    //  e.g.    CRSP to CRS w/ an indicator PARI_MUTUEL
    //
    PC_CRSP,
    PC_HFTP,

    PC_THFP,
    PC_HFMP6, //  HaFu Multiple Pari-mutuel
    PC_DHCP,
    PC_HFMP8,
    PC_SPCM, //  special match

    //  by Jason Lau, on 17/11/2004
    //  interpret this pool like HFMP
    PC_STB, //  section HAD

    PC_CHP,
    PC_TOFP,
    PC_ADTP,
    PC_GPF,
    PC_GPW,
    PC_TPS,
    PC_SPCT, //  special tournament

    PC_JKC, //  NOVELTY Jockey Challenge
    PCODE_DIM,

    PC_TWF,
    PC_WRN,

    //  the following PCODE have to be change to their original pool code and
    //  bit mask the indicator when sending bet
    //  e.g.    AHAD to HAD
    //
    PC_AHAD,
    PC_AHHAD,
    PC_ACRS,
    PC_ALUP,

    PC_XXX = 99 //  default no code value

} PCODE;

//  message code for SB message
typedef enum
{
    MSC_HAD,
    MSC_HDC,
    MSC_CRS,
    MSC_HAFU,
    MSC_TTG,
    MSC_HILO,
    MSC_OOE,
    MSC_FGS,
    MSC_HCS,
    MSC_HHAD,
    MSC_FHAD,      //  first half HAD
    MSC_TQL,       //  Q407
    MSC_FTS = 12,  //	Mar2011 M2
    MSC_FHLO = 13, //	MR2011 FHLO
    MSC_FCRS = 14, //  by Ken Lam, MSR2012 FCRS, First Half Correct Score
    MSC_CHLO,      //	PSR2013 CHLO
    MSC_NTS = 16,  //  Q408
    MSC_ETS = 17,  //	Q408
    MSC_SPCM = 18, //  special match
    MSC_SPCT,      //  special tournament
    MSC_HFM = 21,
    MSC_DHC,
    MSC_CHP = 40,
    MSC_TOF,
    MSC_ADT,
    MSC_GPF,
    MSC_GPW,
    MSC_TPS
} MSG_PCODE;

#define MAX_NUM_OF_POOLS_FOR_XPOOL 8 //  HAD, HHAD, HDC, HFT, CRS, HILO, OOE, TTG

//  this constant must be defined after defining enum PCODE
#define NUMBER_OF_MATCH_POOLS PC_CHP
#define NUMBER_OF_TOURNAMENT_POOLS PCODE_DIM - PC_CHP
#define TOTAL_NUMBER_OF_POOLS PCODE_DIM

#define MAX_NTS_ARRAY 20

#define NUM_OF_CORNER_RESULT 1 //	PSR2013 CHLO, only 1 corner num used now, max num could be changed in future
#define MAX_MULTI_LINE_NUM 5   //  //By Ben, 2015/7/17, Multiple Line for hilo, fhilo, chilo
#define MAIN_LINE -1           // By star feng 2015-07-02  Add Multiple Lines
typedef enum
{
    SC_LEG1 = 0,
    SC_LEG2,
    SC_LEG3,
    SC_LEG4,
    SC_LEG5,
    SC_LEG6,
    SC_LEG7,
    SC_LEG8,
    MAX_SCBET_LEG
} SC_LEG_INDEX;

typedef enum
{
    SC_GROUP1 = 0,
    SC_GROUP2,
    SC_GROUP3,
    SC_GROUP4,
    SC_GROUP5,
    SC_GROUP6,
    MAX_SCBET_GROUP
} SC_GROUP_INDEX;

typedef enum
{
    HAD_HOME_WIN = 0,
    HAD_AWAY_WIN,
    HAD_DRAW,
    HAD_DIM
} HAD_ODDS;

typedef enum
{
    HDC_HOME_ODDS = 0,
    HDC_AWAY_ODDS,
    HDC_CONDITION1, // e.g. +0.5 ASCII
    HDC_CONDITION2  // e.g. -0.5 ASCII
} HDC_ODDS;

typedef enum
{
    HILO_HIGH = 0,
    HILO_LOW,
    HILO_SCORE1, // e.g. +1/-1 ascii
    HILO_SCORE2, // e.g. +1/-1 ascii
    HILO_DIM     // MR2011 FHLO: add this to count HiLo items
} HILO_ODDS;

typedef enum
{
    CRS_0_0 = 0,
    CRS_0_1,
    CRS_0_2,
    CRS_0_3,
    CRS_0_4,
    CRS_0_5,
    CRS_1_0,
    CRS_1_1,
    CRS_1_2,
    CRS_1_3,
    CRS_1_4,
    CRS_1_5,
    CRS_2_0,
    CRS_2_1,
    CRS_2_2,
    CRS_2_3,
    CRS_2_4,
    CRS_2_5,
    CRS_3_0,
    CRS_3_1,
    CRS_3_2,
    CRS_3_3,
    CRS_4_0,
    CRS_4_1,
    CRS_4_2,
    CRS_5_0,
    CRS_5_1,
    CRS_5_2,
    CRS_H_O,
    CRS_D_O,
    CRS_A_O,
    CRS_DIM
} CRS_ODDS;

#define CRS_O_VALUE 63
#define CRS_H_O_VALUE 0
#define CRS_A_O_VALUE 1
#define CRS_D_O_VALUE 2

struct CRS_SCORE
{
    int homeScore;
    int awayScore;
};

static CRS_SCORE CRS_COMBINATION[] = {
    0, 0, 0, 1, 0, 2, 0, 3, 0, 4, 0, 5,
    1, 0, 1, 1, 1, 2, 1, 3, 1, 4, 1, 5,
    2, 0, 2, 1, 2, 2, 2, 3, 2, 4, 2, 5,
    3, 0, 3, 1, 3, 2, 3, 3,
    4, 0, 4, 1, 4, 2,
    5, 0, 5, 1, 5, 2,
    CRS_O_VALUE, CRS_H_O_VALUE, CRS_O_VALUE, CRS_A_O_VALUE, CRS_O_VALUE, CRS_D_O_VALUE};

static int CRS_HOME_SCORE[CRS_DIM] = {
    0, 0, 0, 0, 0, 0,
    1, 1, 1, 1, 1, 1,
    2, 2, 2, 2, 2, 2,
    3, 3, 3, 3,
    4, 4, 4,
    5, 5, 5,
    CRS_O_VALUE, CRS_O_VALUE, CRS_O_VALUE};

static int CRS_AWAY_SCORE[CRS_DIM] = {
    0, 1, 2, 3, 4, 5,
    0, 1, 2, 3, 4, 5,
    0, 1, 2, 3, 4, 5,
    0, 1, 2, 3,
    0, 1, 2,
    0, 1, 2,
    CRS_H_O_VALUE, CRS_A_O_VALUE, CRS_D_O_VALUE};

//DEL//  This sequence is the same as the one of TICKET
//DELtypedef enum {
//DEL    CRS_1_0 = 0, CRS_2_0, CRS_2_1, CRS_3_0, CRS_3_1, CRS_3_2,
//DEL    CRS_4_0, CRS_4_1, CRS_4_2, CRS_4_3, CRS_H_O,
//DEL    CRS_0_0, CRS_1_1, CRS_2_2, CRS_3_3, CRS_4_4, CRS_D_O,
//DEL    CRS_0_1, CRS_0_2, CRS_1_2, CRS_0_3, CRS_1_3, CRS_2_3,
//DEL    CRS_0_4, CRS_1_4, CRS_2_4, CRS_3_4, CRS_A_O,
//DEL    CRS_DIM
//DEL} CRS_ODDS;

typedef enum
{
    TTG_0 = 0,
    TTG_1,
    TTG_2,
    TTG_3,
    TTG_4,
    TTG_5,
    TTG_6,
    TTG_7,
    TTG_DIM
} TTG_ODDS;
typedef enum
{
    HFT1_1 = 0,
    HFT1_X,
    HFT1_2,
    HFTX_1,
    HFTX_X,
    HFTX_2,
    HFT2_1,
    HFT2_X,
    HFT2_2,
    HFT_DIM
} HFT_ODDS;

typedef enum
{
    /*OOE_ZERO = 0,*/ OOE_ODD = 0,
    OOE_EVEN,
    OOE_DIM
} OOE_ODDS;

typedef enum
{
    TQL_HOME_ODDS = 0,
    TQL_AWAY_ODDS,
    TQL_DIM
} TQL_ODDS;

typedef enum
{
    NTS_HOME_ODDS = 0,
    NTS_AWAY_ODDS,
    NTS_NO_GOAL_ODDS,
    NTS_DIM
} NTS_ODDS;

typedef enum
{
    HOME101,
    HOME102,
    HOME103,
    HOME104,
    HOME105,
    HOME106,
    HOME107,
    HOME108,
    HOME109,
    HOME110,
    HOME111,
    HOME112,
    HOME113,
    HOME114,
    HOME115,
    HOME116,
    HOME117,
    HOME118,
    HOME119,
    HOME120, // home others
    AWAY201,
    AWAY202,
    AWAY203,
    AWAY204,
    AWAY205,
    AWAY206,
    AWAY207,
    AWAY208,
    AWAY209,
    AWAY210,
    AWAY211,
    AWAY212,
    AWAY213,
    AWAY214,
    AWAY215,
    AWAY216,
    AWAY217,
    AWAY218,
    AWAY219,
    AWAY220, // away others
    NOSCORER,
    FGS_DIM
} FGS_ODDS;

typedef enum
{
    HHAD_HOME_ODDS = 0,
    HHAD_AWAY_ODDS,
    HHAD_DRAW_ODDS,
    HHAD_CONDITION // e.g. +1 ASCII
} HHAD_ODDS;

typedef enum
{
    M5D_STATUS = -1, //  this status will be eliminated when the oddsServer also upgrade to Delta3
    INITIAL = 0,
    DEFINED,
    SELLING,
    STOP_SELL,
    CLOSED,
    RESULT_IN,
    DIVIDEND_AVAILABLE,
    RESULT_REVOKED,
    START_PAY,
    STOP_PAY,
    ABANDONED,
    PAYOUT_FINAL,
    //  those above status are defined from system
    //  and below are APPLICATION defined to handle MatchResult with message code 641
    //
    FIRST_HALF_COMPLETED,
    SECOND_HALF_STARTED,
    FULL_TIME_COMPLETED,
    //  Q407
    EXTRA_TIME_STARTED,
    EXTRA_TIME_COMPLETED,
    PENALTY_SHOOTOUT_STARTED,  //euro spc by Belle
    PENALTY_SHOOTOUT_COMPLETED //euro spc by Belle
} MATCH_STATUS;

enum POOL_STATUS
{
    PS_UNDEFINED,
    PS_DEFINED,
    PS_STOP_SELL,
    PS_SELLING, //  occur when match before kick-off
    PS_REFUND,
    PS_CLOSED,
    //  the above are from SBC
    //
    //  the following pool status are self-added, not from SBC
    //
    PS_SELLING_1ST_HALF, //  occur when match in progrees in 1St HALF
    PS_SELLING_MID_HALF, //  occur when match during 1ST_HALF_COMPLETED
    PS_SELLING_2ND_HALF, //  occur when match in progrees in 2ND HALF
    PS_SUSPENDED,
    PS_FINAL_STOP_SELL, //  occur when the pool is stopped sell finally, and normally does not expected to resume
    PS_FINAL_STOP_SELL_CANCEL,
    PS_SELLING_AFTER_90, //  occur when 90 minutes match has been finished
    PS_SELLING_EXTRA_TIME,
    PS_PENALTY_SHOOTOUT //euro spc by Belle
};
//********by Star, 2015/09/10, Multiple Lines, line status********************
enum LINE_STATUS
{
    PS_OTHER_POOL,
    PS_OFFER_AND_SEELING,
    PS_OFFER_AND_STOP_SELL,
    PS_NOT_OFFER
};
//*****************************************************

typedef enum
{
    SC_STB_SET1 = 0,
    SC_STB_SET2,
    SC_STB_SET3,
    SC_STB_SET4,
    SC_STB_SET5,
    MAX_SCBET_STB_SET
} SC_STB_SET_INDEX;

typedef enum
{
    SC_STB_SECTION1 = 0,
    SC_STB_SECTION2,
    SC_STB_SECTION3,
    SC_STB_SECTION4,
    MAX_SCBET_STB_SECTION
} SC_STB_SECTION_INDEX;

enum ALLUP_TYPE
{
    NON_ALLUP = 0,
    NORMAL_ALLUP,
    XPOOL_ALLUP,
    BUNDLE
};

#endif
