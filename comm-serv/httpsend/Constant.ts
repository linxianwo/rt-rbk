export class Constanst {
    public static readonly BIT0 = 0x1;
    public static readonly BIT7 = 0x80;
    public static readonly BIT2 = 0x4;
    public static readonly BIT6 = 0x40;
    public static readonly PACKAGE_TYPE_SVT = 0x18;
    public static readonly LOOPBACK_MODE = 3;
    public static readonly SUCCESS = 0;
    public static readonly TIMEOUT = Constanst.SUCCESS + 1;
    public static readonly DESECURE_ERROR = Constanst.TIMEOUT + 1;
    public static readonly SECURE_ERROR = Constanst.DESECURE_ERROR + 1;
    public static readonly BE_COMMS_ERROR = Constanst.SECURE_ERROR + 1;
    public static readonly INTERNAL_MSG_ERROR = Constanst.BE_COMMS_ERROR + 1;
    public static readonly INVALID_BE_ID = Constanst.INTERNAL_MSG_ERROR + 1;
    public static readonly REGISTER_ERROR = Constanst.INVALID_BE_ID + 1;
    public static readonly UNKNOWN_CLIENT = Constanst.REGISTER_ERROR + 1;
    public static readonly DUPLICATE_MSG = Constanst.UNKNOWN_CLIENT + 1;
    public static readonly INVALID_LINE_NUMBER = Constanst.DUPLICATE_MSG + 1;
    public static readonly ESC_QUOTA_EXCEEDED =
        Constanst.INVALID_LINE_NUMBER + 1;
    public static readonly NO_MASH = Constanst.ESC_QUOTA_EXCEEDED + 1;
    public static readonly error_status_ok = 0;
    public static readonly SOH = 0x01;
    public static readonly STX = 0x02;
    public static readonly ETX = 0x03;
    public static readonly MSGCODE_ERROR_REPLY = 0x70;
    public static readonly EOA = 4;
    public static readonly FAILOVER = 2;
    public static readonly DONE = 0;
    public static readonly RETRY = 1;
    public static readonly RPC_S_CALL_FAILED_DNE = 1727;
    public static readonly RESET_RETRY = 3;
    public static readonly NOBC_ERROR = 0;
    public static readonly MSGCODE_TEST_TKT = 0x59;
    public static readonly MSGCODE_ESC_TEST = 0xe0;
    public static readonly MSN_MAX = 4096;
    //    public static readonly TRAINING_MODE = '1';
    public static readonly QPTT = 'Y';
    public static readonly BUFF_OFFSET = 3 + 6 + 2 + 1; //  include 3 bytes in Message Header
    //          6 bytes in Message Body before text (bet details)
    //          2 bytes in Message Body after text (bet details)
    //          1 byte in Message Trailer
    //  reference to document 630 FUNCITONAL STANDARDS - section 5.3 MESSAGE STRUCTURE
    public static readonly MAX_MSG_BUF_SZ = 450 - Constanst.BUFF_OFFSET;
    public static readonly BCAST_DROP_ADD = 0x3f;
    public static readonly MAX_BT_MESSAGE_SIZE = 5000;
}
export enum TerminalMode {
    NORMAL_MODE = 0, // This assignment/order must not be changed, add to end.
    TRAINING_MODE,
    BETGEN_MODE,
    LOOPBACK_MODE,
}
export enum SCMPMsgCode {
    MSGCODE_SIGN_ON = 0x41,
    MSGCODE_SIGN_OFF = 0x42,
    MSGCODE_BET = 0x44,
    MSGCODE_MK6_M = 0x45,
    MSGCODE_CASH_IN = 0x47,
    MSGCODE_CASH_OUT = 0x49,
    MSGCODE_CANCEL = 0x4b,
    MSGCODE_MK6_S = 0x4c,
    MSGCODE_MK6_R = 0x4d,
    MSGCODE_DLL = 0x4f,
    MSGCODE_RDT = 0x50,
    MSGCODE_PAY = 0x51,
    MSGCODE_TB_DEPOSIT = 0x52,
    MSGCODE_CV_ISSUE = 0x53,
    MSGCODE_CV_CASH = 0x54,
    MSGCODE_WARNING = 0x55,
    MSGCODE_AUTO_SON = 0x56,
    MSGCODE_AUTO_SOFF = 0x57,
    MSGCODE_SEVERE_ERR = 0x58,
    MSGCODE_TEST_TKT = 0x59,
    MSGCODE_EFT = 0x5b, // eft system messge

    MSGCODE_ERROR_REPLY = 0x70, // Error reply to normal Central Sys request

    MSGCODE_BROADCAST = 0x71, // Central Sys to terminals, usolicited.
    MSGCODE_BET_GEN = 0x72, // Begin / End Bet generation.

    MSGCODE_ESC = 0x7f,
}
