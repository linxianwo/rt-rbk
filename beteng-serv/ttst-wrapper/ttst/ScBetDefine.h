//********************************************************************
//*
//*   @COPYRIGHT. This software is the property of the Royal Hong Kong
//*   Jockey Club and is not to be disclosed, copied, or used in whole
//*   or part without proper authorization.
//*   2005
//*
//* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
//*
//*    BETDEFINE.H
//*
//*
//*    Racing & Global Bet definition
//*
//*********************************************************************

#ifndef _BETDEFINE_H_
#define _BETDEFINE_H_

#if _MSC_VER > 1000
#pragma once
#endif // _MSC_VER > 1000

// global bet defines

/////////////////////////////////////////////////////////
// define symbol for different pool
#define AWIN 'A'  // all up Win
#define APLA 'B'  // all up Place
#define AQIN 'C'  // all up Quinella
#define AWP 'D'   // all up Win-Place
#define AQPL 'E'  // all up Quinella Place
#define FF 'F'    // first 4
#define SIXUP 'G' // 6 up
#define TCE 'H'   // Tierce
#define QTT 'I'   // quartet
#define TT 'J'    // Triple Trio
#define DT 'K'    // Double Trio
#define FCT 'L'   // forcast
#define TBL 'M'   // Treble
#define DBL 'N'   // Double
#define TRIO 'O'  // Trio
#define ATRIO 'P' // all up Trio
#define DQ 'Q'    // Double Quinella
#define QIN 'S'   // Quinella
#define QPL 'T'   // Quinel la Place
#define WIN 'U'   // Win
#define PLA 'V'   // Place
#define WP 'W'    // Win-Place
#define QQP 'X'   // Quinella & Quinella Place
#define QPTT 'Y'  // Quick Pick T-T
#define ALUP 'Z'  // all up across pool

#define BWA 0x5b //  Bracket-Win A
#define BWB 0x5c //  Bracket-Win B
#define BWC 0x5d //  Bracket-Win C
#define BWD 0x5e //  Bracket-Win D

#define AQQP 0xfd //'a'	  // all up Quinella & Quinella Place  //  by Ben Ou, on 2014/07/2. Pool code CWA is set to 0x60, AQQP is not a real pool code so set it to 0xfd

//  deprecated
#define SIXWIN 'f' // 6win
//#define QAD     'L'   //* quadrella
#define QAD 0xfc //* quadrella  // by Samuel Chan, 20200429, FCT use "L", so change unused pool "quadrella"

#define QPQTT 0x5f //  by Ben Ou, on 2013/07/10. MSR2013, QTT. Quick Pick QTT
//by ben 14/2/8, cw add cw pool code
#define CWA 0x60
#define CWB 0x61
#define CWC 0x62
#define ACW 0xfe
#define CW 0xff
//<----
#define IWN 0x63 // by Ben, 20160412, IWN Enhancement, IWN pool code

////////////////////////////////////////////////////////////////////////////////
#define CODE_STR_ALLUP _T("ALL UP")
#define CODE_STR_ALUP _T("ALUP")
#define CODE_STR_AWIN _T("AWN")
#define CODE_STR_APLA _T("APL")
#define CODE_STR_AWP _T("AWP")
#define CODE_STR_AQIN _T("AQN")
#define CODE_STR_AQPL _T("AQP")
#define CODE_STR_AQQP _T("AQQP")
#define CODE_STR_ATRIO _T("AUT")
#define CODE_STR_DBL _T("DBL")
#define CODE_STR_DT _T("D-T")
#define CODE_STR_TBL _T("TBL")
#define CODE_STR_TT _T("T-T")
#define CODE_STR_FF _T("F-F")
#define CODE_STR_SIXUP _T("6UP")
#define CODE_STR_WIN _T("WIN")
#define CODE_STR_PLA _T("PLA")
#define CODE_STR_WP _T("W-P")
#define CODE_STR_QIN _T("QIN")
#define CODE_STR_QPL _T("QPL")
#define CODE_STR_QQP _T("QQP")
#define CODE_STR_BWA _T("BWA (Horse No.)")
#define CODE_STR_BWB _T("BWB (B)")
#define CODE_STR_BWC _T("BWC (C)")
#define CODE_STR_BWD _T("BWD (D)")
#define CODE_STR_TCE _T("TCE")
#define CODE_STR_TRIO _T("TRI")
#define CODE_STR_QPTT _T("T-T QUICK PICK")
#define CODE_STR_FCT _T("FCT") // By Ethan, 2020/04/23, Forecast.

#define CODE_STR_SINGLE _T("TCE SINGLE")
#define CODE_STR_MULTIPLE _T("TCE MULTIPLE")
#define CODE_STR_BANKER _T("TCE BANKER")
#define CODE_STR_BANKER_MULT _T("TCE BANKER MULTIPLE")
#define CODE_STR_MULT_BANKER _T("TCE MULTI-BANKER")

//  by Ben Ou, on 2013/03/26. MSR2013, QTT. QTT pool string
#define CODE_STR_QTT _T("QTT")
#define CODE_STR_QTT_SINGLE _T("QTT SINGLE")
#define CODE_STR_QTT_MULTIPLE _T("QTT MULTIPLE")
#define CODE_STR_QTT_BANKER _T("QTT BANKER")
#define CODE_STR_QTT_BANKER_MULT _T("QTT BANKER MULTIPLE")
#define CODE_STR_QTT_MULT_BANKER _T("QTT MULTI-BANKER")
#define CODE_STR_QPQTT _T("QTT QUICK PICK") // <--

// 20140108 added CW code string by Joan
#define CODE_STR_CW _T("COMPOSITE WIN")
#define CODE_STR_CWA _T("CWA")
#define CODE_STR_CWB _T("CWB")
#define CODE_STR_CWC _T("CWC")
#define CODE_STR_ACW _T("ACW")
// by Ben, 20160428, IWIN Enhancement, for IWN type
#define CODE_STR_IWN _T("IWN")

////////////////////////////////////////////////////////////////////////////////
#define ENG_STR_ALLUP _T("ALL UP")
#define ENG_STR_ALUP _T("ALUP")

#define ENG_STR_AWIN _T("ALL UP WIN")
#define ENG_STR_APLA _T("ALL UP PLACE")
#define ENG_STR_AWP _T("ALL UP WIN PLACE")
#define ENG_STR_AQIN _T("ALL UP QUINELLA")
#define ENG_STR_AQPL _T("ALL UP QUINELLA PLACE")
#define ENG_STR_AQQP _T("ALL UP QUINELLA & QUINELLA PLACE")
#define ENG_STR_ATRIO _T("ALL UP TRIO")

#define ENG_STR_DBL _T("Double")
#define ENG_STR_DT _T("Double Trio")
#define ENG_STR_TBL _T("Treble")
#define ENG_STR_TT _T("Triple Trio")
#define ENG_STR_FF _T("First 4")
#define ENG_STR_SIXUP _T("Six Up")

#define ENG_STR_WIN _T("Win")
#define ENG_STR_PLA _T("Place")
#define ENG_STR_WP _T("Win & Place")
#define ENG_STR_QIN _T("Quinella")
#define ENG_STR_QPL _T("Quinella Place")
#define ENG_STR_QQP _T("Quinella & Quinella Place")
#define ENG_STR_BWA _T("BRACKET WIN A (Horse No.)")
#define ENG_STR_BWB _T("BRACKET WIN B")
#define ENG_STR_BWC _T("BRACKET WIN C")
#define ENG_STR_BWD _T("BRACKET WIN D")
#define ENG_STR_TCE _T("Tierce")
#define ENG_STR_TRIO _T("Trio")
#define ENG_STR_QPTT _T("Triple Trio Quick Pick")
#define ENG_STR_FCT _T("Forcast")

//************************************By Star Feng 04-03-2014 add CW
#define ENG_STR_CW _T("COMPOSITE WIN")
#define ENG_STR_CWA _T("COMPOSITE WIN CWA")
#define ENG_STR_CWB _T("COMPOSITE WIN CWB")
#define ENG_STR_CWC _T("COMPOSITE WIN CWC")
#define ENG_STR_ACW _T("ALL UP CW")
#define ENG_CW_TITLE _T("Composite")
//************************************
//  by Ben Ou, on 2013/03/26.
//	MSR2013, QTT.
//	Qtt english string
#define ENG_STR_QTT _T("Quartet")
#define ENG_STR_QPQTT _T("Quartet Quick Pick") // <--
#define ENG_STR_IWN _T("Insurance Win")        // by Ben, 20160428, IWIN Enhancement, for IWN type
//#define ENG_STR_SINGLE          "TCE SINGLE"
//#define ENG_STR_MULTIPLE        "TCE MULTIPLE"
//#define ENG_STR_BANKER          "TCE BANKER"
//#define ENG_STR_BANKER_MULT     "TCE BANKER MULTIPLE"
//#define ENG_STR_MULT_BANKER     "TCE MULTI-BANKER"

////////////////////////////////////////////////////////////////////////////////
#define CHI_STR_ALLUP _T("�L��")
#define CHI_STR_ALUP _T("�V�X�L��")
#define CHI_STR_AWIN _T("�WĹ�L��")
#define CHI_STR_APLA _T("��m�L��")
#define CHI_STR_AWP _T("�WĹ�Φ�m�L��")
#define CHI_STR_AQIN _T("�sĹ�L��")
#define CHI_STR_AQPL _T("��m�߹L��")
#define CHI_STR_AQQP _T("�sĹ�Φ�m�߹L��")
#define CHI_STR_ATRIO _T("���L��")

#define CHI_STR_DBL _T("���_")
#define CHI_STR_DT _T("�Ӣ�")
#define CHI_STR_TBL _T("�T�_")
#define CHI_STR_TT _T("�T��")
#define CHI_STR_FF _T("�|�s��")
#define CHI_STR_SIXUP _T("�����m")

#define CHI_STR_WIN _T("�WĹ")
#define CHI_STR_PLA _T("��m")
#define CHI_STR_WP _T("�WĹ�Φ�m")
#define CHI_STR_QIN _T("�sĹ")
#define CHI_STR_QPL _T("��m��")
#define CHI_STR_QQP _T("�sĹ�Φ�m��")
#define CHI_STR_BWA _T("�Ԣ����բϡ]���ǽs���^")
#define CHI_STR_BWB _T("�Ԣ����բ�")
#define CHI_STR_BWC _T("�Ԣ����բ�")
#define CHI_STR_BWD _T("�Ԣ����բ�")
#define CHI_STR_TCE _T("�T���m")
#define CHI_STR_TRIO _T("���")
#define CHI_STR_QPTT _T("�T��q����")
#define CHI_STR_FCT _T("�G���m")

#define CHI_STR_SINGLE _T("�T���m�榡")
#define CHI_STR_MULTIPLE _T("�T���m�Ʀ�")
#define CHI_STR_BANKER _T("�T���m�榡���x")
#define CHI_STR_BANKER_MULT _T("�T���m�Ʀ����x")
#define CHI_STR_MULT_BANKER _T("�T���m���w��m���x")

//************************************By Star Feng 04-03-2014 add CW
#define CHI_STR_CW _T("�զX�WĹ")
#define CHI_STR_CWA _T("�զX�WĹ CWA")
#define CHI_STR_CWB _T("�զX�WĹ CWB")
#define CHI_STR_CWC _T("�զX�WĹ CWC")
#define CHI_STR_ACW _T("�զX�WĹ�L��")
#define CHI_CW_TITLE _T("�զX")
//************************************
//  by Ben Ou, on 2013/03/26.
//	MSR2013, QTT.
//	Qtt chinese string
#define CHI_STR_QTT _T("�|���m")
#define CHI_STR_QTT_SINGLE _T("�|���m�榡")
#define CHI_STR_QTT_MULTIPLE _T("�|���m�Ʀ�")
#define CHI_STR_QTT_BANKER _T("�|���m�榡���x")
#define CHI_STR_QTT_BANKER_MULT _T("�|���m�Ʀ����x")
#define CHI_STR_QTT_MULT_BANKER _T("�|���m���w��m���x")
#define CHI_STR_QPQTT _T("�|���m�q����") // <--
// by Ben, 20160428, IWIN Enhancement, for IWN type
#define CHI_STR_IWN _T("�O�I�WĹ")
////////////////////////////////////////////////////////////////////////////////
#define DISPLAY_POOL_ALLUP _T("�L�� ALL UP")
#define DISPLAY_POOL_ALUP _T("�L�� ALUP")
#define DISPLAY_POOL_AWIN _T("�WĹ�L�� AWN")
#define DISPLAY_POOL_APLA _T("��m�L�� APL")
#define DISPLAY_POOL_AWP _T("�WĹ��m�L�� AWP")
#define DISPLAY_POOL_AQIN _T("�sĹ�L�� AQN")
#define DISPLAY_POOL_AQPL _T("��m�߹L�� AQP")
#define DISPLAY_POOL_AQQP _T("�sĹ��m�߹L�� AQQP")
#define DISPLAY_POOL_ATRIO _T("���L�� AUT")

#define DISPLAY_POOL_DBL _T("���_ DBL")
#define DISPLAY_POOL_DT _T("�Ӣ� D-T")
#define DISPLAY_POOL_TBL _T("�T�_ TBL")
#define DISPLAY_POOL_TT _T("�T�� T-T")
#define DISPLAY_POOL_FF _T("�|�s�� F-F")
#define DISPLAY_POOL_SIXUP _T("�����m 6UP")

#define DISPLAY_POOL_WIN _T("�WĹ WIN")
#define DISPLAY_POOL_PLA _T("��m PLA")
#define DISPLAY_POOL_WP _T("�WĹ��m W-P")
#define DISPLAY_POOL_QIN _T("�sĹ QIN")
#define DISPLAY_POOL_QPL _T("��m�� QPL")
#define DISPLAY_POOL_QQP _T("�sĹ��m�� QQP")
#define DISPLAY_POOL_BWA _T("�Ԣ����բϡ]���ǽs���^BWA (Horse No.)")
#define DISPLAY_POOL_BWB _T("�Ԣ����բ� BWB")
#define DISPLAY_POOL_BWC _T("�Ԣ����բ� BWC")
#define DISPLAY_POOL_BWD _T("�Ԣ����բ� BWD")
#define DISPLAY_POOL_TCE _T("�T���m TCE")
#define DISPLAY_POOL_FCT _T("�G���m FCT")
#define DISPLAY_POOL_TRIO _T("��� TRI")
#define DISPLAY_POOL_QPTT _T("�T��q���� T-T QUICK PICK")

//  by Ben Ou, on 2013/03/26.
//	MSR2013, QTT.
//	Qtt string
#define DISPLAY_POOL_QTT _T("�|���m QTT")
#define DISPLAY_POOL_QP_QTT _T("�|���m�q���� QTT QUICK PICK") // <--

#define DISPLAY_POOL_BW _T("�Ԣ����� BW")
#define DISPLAY_TCE_SINGLE _T("�T���m�榡 TCE SINGLE")
#define DISPLAY_TCE_MULTIPLE _T("�T���m�Ʀ� TCE MULTIPLE")
#define DISPLAY_TCE_BANKER _T("�T���m�榡���x TCE BANKER")
#define DISPLAY_TCE_BANKER_MULT _T("�T���m�Ʀ����x TCE BANKER MULTIPLE")
#define DISPLAY_TCE_MULT_BANKER _T("�T���m���w��m���x TCE MULTI-BANKER")

//BY frank wang 2020/04/23
#define DISPLAY_FCT_SINGLE _T("�G���m�榡 FCT SINGLE")
#define DISPLAY_FCT_MULTIPLE _T("�G���m�Ʀ� FCT MULTIPLE")
#define DISPLAY_FCT_BANKER _T("�G���m�榡���x FCT BANKER")
#define DISPLAY_FCT_BANKER_MULT _T("�G���m�Ʀ����x FCT BANKER MULTIPLE")
#define DISPLAY_FCT_MULT_BANKER _T("�G���m���w��m���x FCT MULTI-BANKER")

//  by Ben Ou, on 2013/03/26.
//	MSR2013, QTT.
//	Qtt string
#define DISPLAY_QTT_SINGLE _T("�|���m�榡 QTT SINGLE")
#define DISPLAY_QTT_MULTIPLE _T("�|���m�Ʀ� QTT MULTIPLE")
#define DISPLAY_QTT_BANKER _T("�|���m�榡���x QTT BANKER")
#define DISPLAY_QTT_BANKER_MULT _T("�|���m�Ʀ����x QTT BANKER MULTIPLE")
#define DISPLAY_QTT_MULT_BANKER _T("�|���m���w��m���x QTT MULTI-BANKER") // <--

//by ben 14/2/13, cw pool strings
//#define DISPLAY_POOL_CW             _T("�զX�WĹ CW")
#define DISPLAY_POOL_CWA _T("�զX�WĹ CWA")
#define DISPLAY_POOL_CWB _T("�զX�WĹ CWB")
#define DISPLAY_POOL_CWC _T("�զX�WĹ CWC")
#define DISPLAY_POOL_CWA_CNAME _T("3�z1")
#define DISPLAY_POOL_CWB_CNAME _T("�ӥX�m���v")
#define DISPLAY_POOL_CWC_CNAME _T("�ӥX�a��")
#define DISPLAY_POOL_CWA_ENAME _T("3 PICK 1")        // _T("3 Pick 1") by Ben, fix RCQ63807, to capitalize all characters
#define DISPLAY_POOL_CWB_ENAME _T("WINNING TRAINER") // _T("Winning Trainer")
#define DISPLAY_POOL_CWC_ENAME _T("WINNING REGION")  // _T("Winning Region")
#define DISPLAY_POOL_COMPOSITE _T("�զX Composite")
#define CWA_TITLE _T("")    //(CWA) �զX�WĹ :
#define CWB_TITLE _T("")    //(CWB) �զX�WĹ :
#define CWC_TITLE _T("")    //(CWC) �զX�WĹ :
#define CW_ENG_TITLE _T("") //Composite Win :
#define CW_TITLE _T("�զX Composite")
#define CW_TITLE_STARTERS _T("�]�A����     Starters Include")
#define CW_TITLE_ODDS _T("�߲v Odds")
//<----
#define DISPLAY_POOL_IWN _T("�O�I�WĹ IWN") // by Ben, 20160414, IWN Enhancement, for IWN pool string

#define HASH_MARK '#'
#define BET_FIELD 0 // field selection
#define BET_BANKER '>'

#define NOT_MARKED 0
#define MARKED 1

#define MAX_TKT_HORSE_SELN 14
#define MAX_TKT_HORSE_SELN_24 24 //Q309: 24 Starters
#define MAX_TKT_HORSE_SELN_34 34 // 34 Starters
#define TKT_BNK_24 11            // special for TKT_AUP_FLX_6X_24
#define TKT_BNK_34 12            // by Samuel Chan, 20200606, special for TKT_AUP_FLX_6X_34_OS

#define MAX_LEG 6
#define MAX_RACE 15
#define MAX_BANKER 3

#define MAX_QTT_BANKER 4 //  by Ben Ou, on 2013/03/26. MSR2013, QTT. Qtt banker

#define MAX_FCT_BANKER 2 //  by Ethan, 2020/04/23. Forecast. FCT banker

//#define MAX_SELECTION	            (1 + MAX_TKT_HORSE_SELN)    //  include FIELD
#define MAX_SELECTION (1 + MAX_TKT_HORSE_SELN_34) //  include FIELD //Q309: 24 Starters
#define MAX_ERROR_TEXT 256
//#define MAX_QPTT_SELECTION          17
#define MAX_QPTT_SELECTION 29 //  Q307a
#define MIN_SELN_FOR_TCE_MULTIPLE 3
#define MIN_SELN_FOR_TCE_BNK_MULTI 4 //  include bankers
#define MAX_BRACKET 7

//  by Ben Ou, on 2013/03/26.
//	MSR2013, QTT.
//	Qtt define
#define MIN_SELN_FOR_QTT_MULTIPLE 4
#define MIN_SELN_FOR_QTT_BNK_MULTI 5 //<----

//  by Ethan, 2020/04/23. Forecast. FCT banker
#define MIN_SELN_FOR_FCT_MULTIPLE 2
#define MIN_SELN_FOR_FCT_BNK_MULTI 3

#define MAX_SELN_FOR_CW 4  //by ben 14/2/21, cw max selection
#define MAX_SELN_FOR_CWA 4 //CR011, by Ben 15/5/8, CW UI enhancement, CWA maximum selection number
#define CWA_INDEX 0        //by ben 14/7/21,cw pool index
#define CWB_INDEX 1
#define CWC_INDEX 2

#define MAX_TT_LEGS 3

//  by Ben Ou, on 2013/03/26.
//	MSR2013, QTT.
//	Qtt define
#define MAX_QPQTT_SELECTION 6

//  the leg consist of legs x selection + race number + pool
//
#define SIZE_OF_LEG (MAX_SELECTION * MAX_BRACKET + 1 + 1)

#define FIRST_BANKER 0
#define SECOND_BANKER 1
#define FCT_OTHER_SELN 1
#define OTHER_SELN 2
#define NORMAL_SELN 2
#define THIRD_BANKER 2   //  by Ben Ou, on 2013/05/03. MSR2013, QTT. QTT third banker
#define QTT_OTHER_SELN 3 //  by Ben Ou, on 2013/05/03. MSR2013, QTT. QTT selection

struct S_FORMULA
{
    int nLeg;  // number of legs
    int nComb; // number of combinations
};

// racing bet specific defines
typedef enum
{
    BET_LEG1 = 0,
    BET_LEG2,
    BET_LEG3,
    BET_LEG4,
    BET_LEG5,
    BET_LEG6,
    MAX_BET_LEG
} BET_LEG_INDEX;

enum TCE_TYPE
{
    NOT_TCE = 0, // not tce
    TCE_SINGLE,
    TCE_BANKER,
    TCE_MULTIPLE,
    TCE_BANKER_MULT,
    TCE_MULT_BANKER,
    TCE_TRIO, // trio is very similiar to TCE, it's a TCE without position winning
    //  by Ben Ou, on 2013/03/26. MSR2013, QTT. Qtt type
    QTT_SINGLE,
    QTT_BANKER,
    QTT_MULTIPLE,
    QTT_BANKER_MULT,
    QTT_MULT_BANKER,
    QTT_QP, // <----
    // By Ethan, 2020/04/07, Forecast
    FCT_SINGLE,
    FCT_BANKER,
    FCT_MULTIPLE,
    FCT_BANKER_MULT,
    FCT_MULT_BANKER
};

typedef enum
{
    BET_BW1 = 0,
    BET_BW2,
    BET_BW3,
    BET_BW4,
    BET_BW5,
    BET_BW6,
    BET_BW7,
    MAX_BET_BW
} BET_BW_INDEX;

#define ST 'A' /* ST */
#define HV 'B' /* HV */
#define X1 'C' /* X1 */
#define X2 'D' /* X2 */
#define S1 'E' /* S1 */
#define S2 'F' /* S2 */

enum RaceDayCode
{
    NO_DAY_MARK = 0x40,
    SUNDAY,
    MONDAY,
    TUESDAY,
    WEDNESDAY,
    THURSDAY,
    FRIDAY,
    SATURDAY
};

#define STR_RACE_DAY_SUN _T("SUN")
#define STR_RACE_DAY_MON _T("MON")
#define STR_RACE_DAY_TUE _T("TUE")
#define STR_RACE_DAY_WED _T("WED")
#define STR_RACE_DAY_THU _T("THU")
#define STR_RACE_DAY_FRI _T("FRI")
#define STR_RACE_DAY_SAT _T("SAT")

#define MAX_BET_SELN_PER_SET MAX_SELECTION

#define BET_SELN_SET_NORMAL 0
#define BET_SELN_SET_BANKER 1

// for tce, ie 1st > 2nd > 3rd
#define BET_SELN_SET_1ST_BANKER 0
#define BET_SELN_SET_2ND_BANKER 1
#define BET_SELN_SET_3RD_BANKER 2

//  by Ben Ou, on 2013/03/26. MSR2013, QTT. Forth banker
#define BET_SELN_SET_4TH_BANKER 3

#endif
