import {
    CustomerType,
    ErtType,
    CustomerStatus,
    CallFlagType,
    ReleaseCodeType,
    NBAType,
    TransType,
} from './customer.enum';

interface History {
    type: TransType;
    total: number;
    txn: string;
}

interface CustomerHistoryManipulate {
    Reset(): void;
    getAccountAccessTXN(): string;
    setAccountAccessTXN(txn: string);
    Update(type: TransType, total: number, txn: string): void;
    Count(type: TransType): number;
    GetDetail(nLastRec: number): string;
}
class CustomerHistory {
    constructor() {
        this.Reset();
    }

    public iCount = 0;
    public MAX_CUST_HIST = 999;
    public transHistory: History[] = [];
    public _accountAccessTXN = '0000';

    // get accountAccessTXN() {
    //     if (this.accountAccessTXN.length > 0) {
    //         return this._accountAccessTXN;
    //     } else {
    //         return '0000';
    //     }
    // }

    // set accountAccessTXN(txn: string) {
    //     this._accountAccessTXN = txn;
    // }

    public Reset(): void {
        this.iCount = 0;
        this.transHistory = [];
    }

    // // Update(type: TransType, lTotal: number) {
    // public Update(type: TransType, total: number, txn: string): void {
    //     const count = this.transHistory.push({ type: type, total: total, txn: txn });
    //     if (count > this.MAX_CUST_HIST) {
    //         this.transHistory.shift();
    //         this.iCount = count - 1;
    //     } else {
    //         this.iCount = count;
    //     }
    // }

    // public Count(type: TransType): number {
    //     let iRet = 0;

    //     this.transHistory.forEach(oneHistory => {
    //         if (oneHistory.type === type) {
    //             ++iRet;
    //         }
    //     });

    //     return iRet;
    // }

    // public GetDetail(nLastRec: number): string {

    //     let iRemain = 0;

    //     let strOutput = '';
    //     if (this.iCount > nLastRec) {
    //         iRemain = this.iCount - nLastRec;
    //     }

    //     for (let i = iRemain; i < this.iCount; i++) {
    //         strOutput += ('000' + i).slice(-this.MAX_CUST_HIST.toString().length);
    //         strOutput += ' ';
    //         const thisTransHis = this.transHistory[i];
    //         strOutput += TransType[thisTransHis.type];
    //         strOutput += ' ';

    //         if (thisTransHis.type === TransType.TRANS_ACA ||
    //             thisTransHis.type === TransType.TRANS_ACR) {
    //             strOutput += '{' + thisTransHis.total + ':C}';
    //         } else {
    //             // is right
    //             const strTemp: string = '{' + thisTransHis.total + ':C}';
    //             strTemp.replace(/-/g, '');
    //             strOutput += strOutput;
    //         }
    //         strOutput += '\n';
    //     }

    //     return strOutput;
    // }
}

class CustomerContent {
    public uSellCount: number; // total sell count
    public lSellTotal: number; // total sell amount
    public uTicketSellCount: number; // the number of sold ticket
    public uEscSellCount: number; // not use any more
    public lEscSellTotal: number; // not use any more
    public ueWalletSellCount: number; // ewallet total sell count
    public leWalletSellTotal: number; // ewallet total sell amount
    public ueWalletPayCount: number; // ewallet total pay count
    public leWalletPayTotal: number; // ewallet total pay amount
    public ueWalletCount: number; // the number of ewallet transaction
    public leWalletTotal: number; // customer ewallet total
    public uCashSellCount: number; // not use any more
    public lCashSellTotal: number; //  not use any more
    public uPayCount: number; // the number of pay transaction
    public lPayTotal: number; // pay total amount
    public uEscPayCount: number; // not use any more
    public lEscPayTotal: number; // not use any more
    public uCashPayCount: number; // not use any more
    public lCashPayTotal: number; // not use any more
    public lCashBalance: number; // not use any more.cater cash mode operation
    public lBalance: number; // eWallet account balance
    public lOpeningBalance: number; // the eWallet init balance
    public uEftCount: number; // not use any more
    public lEftTotal: number; // not use any more
    public lTotalWithdrawal: number; // no withdrawal on Kiosk, but need to send out
    public uWithdrawalCount: number; // not use any more
    public bPinRequired: boolean; // not use any more
    public lTotalDeposit: number; // eWallet deposit amount
    public uDepositCount: number; // eWallet deposit transaction count
    public iSelectedAccount: number; // not use any more
    public bOtherAccount: boolean; // not use any more
    public iOtherAccountNum: number; // not use any more
    public strAccountNumber: string; // eWallet account number
    public strSelectedAccount: string; // not use any more
    public bPrinted: boolean; // not use any more
    public bNewFlag: boolean; // new customer flag, set the flag true after account release, set flag false after count access
    public iLanguage: number; // eWallet language
    public lTransTotal: number; // transaction total number
    public custType: CustomerType; // default type is CUST_QRC
    public customerStatus: CustomerStatus; // customer account status
    public releaseCode: ReleaseCodeType; // not use any more
    public callFlag: CallFlagType; // not use any more
    public ert: ErtType; // not use any more
    public nbaIndicator: NBAType; // not use any more
    // public history: CustomerHistory = new CustomerHistory();
    public CardAccountNumber = ''; // not use any more // the account number is composed of 12 character for esc card number
    public IntegratedAccountNumber = ''; // not use any more
    // the account number is composed of 8 character of digits for integrated account
    public TbSecurityCode = ''; // not use any more // the security code is composed of 6 character of digits
    public NewTbSecurityCode = ''; // not use any more // the security code is composed of 6 character of digits
    // the card bonus, which is stored at the CMS/ESC BE. This value will be sent upon A/C access
    public Bonus = 0; // not use any more
    public BankPIN = ''; // not use any more
    public TbEftPin = ''; // not use any more // get TB EFT pin
    public IsEftPin = ''; // not use any more // get IS EFT pin
    public NBANumber = ''; // not use any more
    public OldEFTPin = ''; // not use any more // get old EFT pin for change pin purpose
    public NewEFTPin = ''; // not use any more // get new EFT pin for change pin purpose
    public RegNumber = ''; // not use any more // get registration number
    public PriErtNumber = ''; // not use any more // get Primary registration number
    public SecRegNumber = ''; // not use any more // get Secondary registration number
    public PriNBANumber = ''; // not use any more // get primary NBA
    public SecNBANumber = ''; // not use any more // get secondary NBA
    // Adding transaction contunued indicators [***] to alert operator ans supervisory staff
    public IsTransContinued = false;
    public IsJustBet = false; // to indicate if a bet has been just made by a customer
    public history: CustomerHistory = new CustomerHistory();
    public qrcValue = ''; // to store qr code value from customer
    public betslipPrintReceipt = 0; // to mark customer need to print receipt or not in the session

    constructor() {
        this.init();
    }

    public init(
        bRequired: boolean = true,
        custType: CustomerType = CustomerType.CUST_QRC
    ): void {
        this.uSellCount = 0;
        this.lSellTotal = 0;
        this.uTicketSellCount = 0;
        this.uEscSellCount = 0;
        this.lEscSellTotal = 0;
        this.uCashSellCount = 0;
        this.lCashSellTotal = 0;
        this.uPayCount = 0;
        this.lPayTotal = 0;
        this.uEscPayCount = 0;
        this.lEscPayTotal = 0;
        this.uCashPayCount = 0;
        this.lCashPayTotal = 0;
        this.lCashBalance = 0;
        this.lBalance = 0;
        this.lOpeningBalance = 0;
        this.uEftCount = 0;
        this.lEftTotal = 0;
        this.lTotalWithdrawal = 0;
        this.uWithdrawalCount = 0;
        this.bPinRequired = false;
        this.lTotalDeposit = 0;
        this.uDepositCount = 0;
        this.iSelectedAccount = 0;
        this.bOtherAccount = false;
        this.iOtherAccountNum = 0;
        this.strAccountNumber = '';
        this.strSelectedAccount = '';
        this.bPrinted = true;
        this.bNewFlag = true;
        this.iLanguage = 0;
        this.lTransTotal = 0;
        this.custType = CustomerType.CUST_QRC;
        this.customerStatus = CustomerStatus.ACCOUNT_NONE;
        this.releaseCode = ReleaseCodeType.RELEASE_NORMAL;
        this.callFlag = CallFlagType.CALL_FLAG_NONE;
        this.ert = ErtType.NONE;
        this.nbaIndicator = NBAType.NBA_PRI;
        this.leWalletPayTotal = 0;
        this.leWalletSellTotal = 0;
        this.ueWalletPayCount = 0;
        this.ueWalletSellCount = 0;
        this.history.Reset();
        this.qrcValue = '';
        this.betslipPrintReceipt = 0;

        if (custType === CustomerType.CUST_ESC) {
            this.bPinRequired = bRequired;
        } else {
            this.bPinRequired = false;
        }
    }
}

export { History, CustomerHistory, CustomerContent, CustomerHistoryManipulate };
