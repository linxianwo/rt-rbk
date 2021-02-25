import {
    TransType,
    CustomerType,
    // ErtType,
    CustomerStatus,
    CallFlagType,
    ReleaseCodeType,
    // AccountType,
    // NBAType,
    TransArray,
    CustomerLength,
} from './customer.enum';
import { GlobalFile, readNSave, save, read } from '../../utils/global-file';
import { CustomerContent, CustomerHistoryManipulate } from './customer-model';
import { existsSync } from 'fs-extra';

class Customer extends GlobalFile<CustomerContent>
    implements CustomerHistoryManipulate {
    private name = 'customer.json';

    constructor() {
        super();
        this.initCust = this.initContent; // set a callback for custom init, assign some value to content.
        this.fileName = this.name; // set this file name
        this.init();
    }

    private initContent() {
        //  init the content in memory if nothing read or file not exist.
        if (existsSync(this.filePath) === false) {
            // || !this.content
            // copy customer config to the local location
            this.resetCustomer();
        } else {
            if (!this.content) {
                this.resetCustomer();
            }
        }
    }

    @save()
    public resetCustomer() {
        let ret = false;

        this.content = null;
        this.content = new CustomerContent();
        if (this.content) {
            ret = true;
        }

        return ret;
    }

    @readNSave()
    public get isQRCCustomer(): boolean {
        return this.custType === CustomerType.CUST_QRC;
    }

    @readNSave()
    public get custType(): CustomerType {
        return this.content.custType;
    }

    public set custType(value: CustomerType) {
        this.content.custType = value;
    }

    @readNSave()
    public get SellCount(): number {
        return this.content.uSellCount;
    }
    public set SellCount(value: number) {
        this.content.uSellCount = value;
    }

    @readNSave()
    public get SellTotal(): number {
        // get customer sell total
        return this.content.lSellTotal;
    }
    public set SellTotal(value: number) {
        this.content.lSellTotal = value;
    }

    @readNSave()
    public get TicketSellCount(): number {
        return this.content.uTicketSellCount;
    }
    public set TicketSellCount(value: number) {
        this.content.uTicketSellCount = value;
    }

    @readNSave()
    public get eWalletSellCount(): number {
        return this.content.ueWalletSellCount;
    }
    public set eWalletSellCount(value: number) {
        this.content.ueWalletSellCount = value;
    }

    @readNSave()
    public get eWalletSellTotal(): number {
        // get customer sell total
        return this.content.leWalletSellTotal;
    }
    public set eWalletSellTotal(value: number) {
        this.content.leWalletSellTotal = value;
    }

    @readNSave()
    public get eWalletPayCount(): number {
        return this.content.ueWalletPayCount;
    }
    public set eWalletPayCount(value: number) {
        this.content.ueWalletPayCount = value;
    }

    @readNSave()
    public get eWalletPayTotal(): number {
        // get customer Pay total
        return this.content.leWalletPayTotal;
    }
    public set eWalletPayTotal(value: number) {
        this.content.leWalletPayTotal = value;
    }

    // public get EscSellCount(): number {
    //     // the number of ESC sell transaction
    //     return this.content.uEscSellCount;
    // }
    // public set EscSellCount(value: number) {
    //     this.content.uEscSellCount = value;
    //     this.save();
    // }

    // public get EscSellTotal(): number {
    //     // get customer ESC sell total
    //     return this.content.lEscSellTotal;
    // }
    // public set EscSellTotal(value: number) {
    //     this.content.lEscSellTotal = value;
    //     this.save();
    // }

    // public get CashSellCount(): number {
    //     // the number of CASH sell transaction
    //     return this.content.uCashSellCount;
    // }
    // public set CashSellCount(value: number) {
    //     this.content.uCashSellCount = value;
    //     this.save();
    // }

    // public get CashSellTotal(): number {
    //     return this.content.lCashSellTotal;
    // }
    // public set CashSellTotal(value: number) {
    //     // get customer CASH sell total
    //     this.content.lCashSellTotal = value;
    //     this.save();
    // }
    @readNSave()
    public get PayCount(): number {
        // the number of pay transaction
        return this.content.uPayCount;
    }
    public set PayCount(value: number) {
        this.content.uPayCount = value;
    }

    @readNSave()
    public get PayTotal(): number {
        // get customer pay total
        return this.content.lPayTotal;
    }
    public set PayTotal(value: number) {
        this.content.lPayTotal = value;
    }

    // public get EscPayCount(): number {
    //     // the number of ESC pay transaction
    //     return this.content.uEscPayCount;
    // }
    // public set EscPayCount(value: number) {
    //     this.content.uEscPayCount = value;
    //     this.save();
    // }

    // public get EscPayTotal(): number {
    //     // get customer ESC pay total
    //     return this.content.lEscPayTotal;
    // }
    // public set EscPayTotal(value: number) {
    //     this.content.lEscPayTotal = value;
    //     this.save();
    // }

    // public get CashPayCount(): number {
    //     // the number of CASH pay transaction
    //     return this.content.uCashPayCount;
    // }
    // public set CashPayCount(value: number) {
    //     this.content.uCashPayCount = value;
    //     this.save();
    // }

    // public get CashPayTotal(): number {
    //     // get customer CASH pay total
    //     return this.content.lCashPayTotal;
    // }
    // public set CashPayTotal(value: number) {
    //     this.content.lCashPayTotal = value;
    //     this.save();
    // }

    // public get CashBalance() {
    //     return this.content.lCashBalance;
    // }
    // public set CashBalance(value: number) {
    //     this.content.lCashBalance = value;
    //     this.save();
    // }
    @readNSave()
    public get Balance(): number {
        return this.content.lBalance;
    }
    public set Balance(value: number) {
        this.content.lBalance = value;
    }

    @readNSave()
    public get OpeningBalance(): number {
        // the card initial balance
        return this.content.lOpeningBalance;
    }

    // public get EftCount() {
    //     // the number of EFT transaction
    //     return this.content.uEftCount;
    // }
    // public set EftCount(value: number) {
    //     this.content.uEftCount = value;
    //     this.save();
    // }

    // public get EftTotal(): number {
    //     // get customer eft total
    //     return this.content.lEftTotal;
    // }
    // public set EftTotal(value: number) {
    //     this.content.lEftTotal = value;
    //     this.save();
    // }
    @readNSave()
    public get TotalWithdrawal(): number {
        return this.content.lTotalWithdrawal;
    }
    public set TotalWithdrawal(value: number) {
        this.content.lTotalWithdrawal = value;
        this.save();
    }

    @readNSave()
    public get WithdrawalCount(): number {
        // the number of account withdrawal
        return this.content.uWithdrawalCount;
    }
    public set WithdrawalCount(value: number) {
        this.content.uWithdrawalCount = value;
        this.save();
    }
    // the pin requirement flag for customer to decide
    // whether they want their card has pin protection or not.
    // this value can only be set at the time of card issue this
    // routine update the status upon ac access in the middle of customer
    // public get PinRequireEnabled(): boolean {
    //     return this.content.bPinRequired;
    // }
    // public set PinRequireEnabled(value: boolean) {
    //     this.content.bPinRequired = value;
    //     this.save();
    // }
    @readNSave()
    public get Deposit(): number {
        return this.content.lTotalDeposit;
    }
    public set Deposit(value: number) {
        this.content.lTransTotal = value;
        this.content.lTotalDeposit += value;
        this.content.uDepositCount++;
        this.UpdateeWallet(value);
    }

    @readNSave()
    public get DepositCount(): number {
        // the number of account deposit
        return this.content.uDepositCount;
    }

    // update when customer select account, store the string into the account selected string
    // public get AccountSelected(): number {
    //     if (this.content.bOtherAccount) {
    //         return this.content.iOtherAccountNum;
    //     } else {
    //         return this.content.iSelectedAccount;
    //     }
    // }
    // public set AccountSelected(value: number) {
    //     if (AccountType.ACC_OTHER === value) {
    //         this.content.bOtherAccount = true;
    //         this.content.iSelectedAccount = value;
    //     } else {
    //         this.content.bOtherAccount = false;
    //         this.content.iSelectedAccount = value;
    //     }
    //     this.save();
    // }
    @readNSave()
    public get AccountNumber(): string {
        // the account number is composed of 8 character of digits
        return this.content.strAccountNumber;
    }
    public set AccountNumber(value: string) {
        this.content.strAccountNumber = value;
        this.content.customerStatus = CustomerStatus.ACCOUNT_INITED;
    }

    //  return the account string for display or print
    // public get SelectedAccountString(): string {
    //     return this.content.strSelectedAccount;
    // }

    // only allow to change this flag for ESC customer
    // public get Printed(): boolean {
    //     return this.content.bPrinted;
    // }

    // public set Printed(value: boolean) {
    //     if (this.content.custType === CustomerType.CUST_ESC) {
    //         this.content.bPrinted = value;
    //     }
    //     this.save();
    // }
    @readNSave()
    public get newCustomerFlag(): boolean {
        return this.content.bNewFlag;
    }

    public set newCustomerFlag(value: boolean) {
        this.content.bNewFlag = value;
    }

    @readNSave()
    public get Language(): number {
        return this.content.iLanguage;
    }
    public set Language(value: number) {
        this.content.iLanguage = value;
    }

    @readNSave()
    public get TransTotal(): number {
        // get customer last transaction's total
        return this.content.lTransTotal;
    }
    public set TransTotal(value: number) {
        // get customer last transaction's total
        this.content.lTransTotal = value;
    }

    // the condition whether the customer is end due to the card is removed, not ejected.
    @readNSave()
    public get ReleaseCode(): ReleaseCodeType {
        return this.content.releaseCode;
    }
    public set ReleaseCode(value: ReleaseCodeType) {
        this.content.releaseCode = value;
    }

    @readNSave()
    public get CallFlag(): CallFlagType {
        return this.content.callFlag;
    }
    public set CallFlag(value: CallFlagType) {
        this.content.callFlag = value;
    }

    // public get Ert(): ErtType {
    //     return this.content.ert;
    // }
    // public set Ert(value: ErtType) {
    //     this.content.ert = value;
    //     this.save();
    // }

    // public get NBAIndicator(): NBAType {
    //     return this.content.nbaIndicator;
    // }
    // public set NBAIndicator(value: NBAType) {
    //     this.content.nbaIndicator = value;
    //     this.save();
    // }

    // public get History(): CustomerHistory {
    //     return this.history;
    // }

    // perform tb account number integration checking, only used by tb account
    public get VerifyTbAccount(): boolean {
        const iLen = this.AccountNumber.length;

        if (iLen === 0 || iLen > CustomerLength.TB_ACCOUNT_LENGTH) {
            return false;
        }

        let i = 0;
        let sum = 0;
        const binary: Array<any> = new Array[
            CustomerLength.TB_ACCOUNT_LENGTH + 1
        ]();

        for (i = 0; i < CustomerLength.TB_ACCOUNT_LENGTH; i++) {
            binary[i] = this.AccountNumber[i];
        }

        for (i = CustomerLength.TB_ACCOUNT_LENGTH; i >= 1; i--) {
            sum =
                sum + (binary[CustomerLength.TB_ACCOUNT_LENGTH - i] & 0x0f) * i;
        }

        if (sum % 10 !== 0) {
            return false;
        } else {
            return true;
        }
    }

    public get VerifyeWalletAccount(): boolean {
        const iLen = this.AccountNumber.length;

        if (iLen === 0 || iLen > CustomerLength.TB_ACCOUNT_LENGTH) {
            return false;
        }

        return true;
    }

    @save()
    public UpdateSell(lSell: number, bTicketSell: boolean): void {
        if (bTicketSell) {
            this.content.uTicketSellCount++;
        }

        this.content.lTransTotal = lSell;

        if (lSell > 0) {
            this.content.uSellCount++;
            this.content.lSellTotal += lSell;
            if (this.content.custType === CustomerType.CUST_QRC) {
                this.content.ueWalletSellCount++;
                this.content.leWalletSellTotal += lSell;
            } else if (this.content.custType === CustomerType.CUST_ESC) {
                this.content.uEscSellCount++;
                this.content.lEscSellTotal += lSell;
            } else {
                this.content.uCashSellCount++;
                this.content.lCashSellTotal += lSell;
            }
        } else {
            if (lSell < 0) {
                this.content.uPayCount++;
                this.content.lPayTotal -= lSell;
                if (this.content.custType === CustomerType.CUST_QRC) {
                    this.content.ueWalletPayCount++;
                    this.content.leWalletPayTotal -= lSell;
                } else if (this.content.custType === CustomerType.CUST_ESC) {
                    this.content.uEscPayCount++;
                    this.content.lEscPayTotal -= lSell;
                } else {
                    this.content.uCashPayCount++;
                    this.content.lCashPayTotal -= lSell;
                }
            }
        }

        if (this.content.custType !== CustomerType.CUST_QRC) {
            this.content.lCashBalance -= lSell;
        }

        this.content.lBalance -= lSell;
    }

    // UpdateEft(lEftAmt: number): void {
    //     this.content.uEftCount++;
    //     this.content.lEftTotal += lEftAmt;
    //     this.save();
    // }

    UpdateeWallet(leWalletAmt: number): void {
        this.content.ueWalletCount++;
        this.content.leWalletTotal += leWalletAmt;
    }

    @save()
    UpdateBalance(lAmount: number, bAdd: boolean): void {
        if (bAdd) {
            this.content.lBalance += lAmount;
        } else {
            this.content.lBalance -= lAmount;
        }
    }

    // Withdrawal(lAmount: number): void {
    //     this.content.lTransTotal = lAmount;
    //     this.content.lTotalWithdrawal += lAmount;
    //     this.content.uWithdrawalCount++;
    //     this.UpdateEft(lAmount);
    //     this.save();
    // }

    // insert esc card after performing some sell/pay transaction then have to adjust the balance
    // EscInsert(lAmount: number, strCardNumber: string): void {
    //     this.content.custType = CustomerType.CUST_ESC;
    //     const strNumber: string = strCardNumber.substring(
    //         0,
    //         CustomerLength.ESC_ACCOUNT_LENGTH
    //     );
    //     this.AccountNumber = strNumber;
    //     this.content.lOpeningBalance = lAmount;
    //     this.content.lBalance = lAmount;
    //     this.save();
    // }

    // EftCV(lAmount: number): void {
    //     this.content.lTransTotal = lAmount;
    //     this.UpdateEft(lAmount);
    //     this.save();
    //     // should be CUST_TB here
    //     // this.history.Update(TransType.TRANS_eCVI, lAmount);
    // }
    @read()
    customerState() {
        return this.content.customerStatus;
    }

    @save()
    eWalletAccessed(lAmount: number, strCardNumber: string): void {
        this.content.custType = CustomerType.CUST_QRC;
        const strNumber: string = strCardNumber.substring(
            0,
            CustomerLength.EWALLET_ACCOUNT_LENGTH
        );
        this.AccountNumber = strNumber;
        this.content.lOpeningBalance = lAmount;
        this.content.lBalance = lAmount;
    }

    // update the customer transaction history and amount
    @save()
    UpdateTransaction(
        type: TransType,
        lSells: number,
        txn: string,
        bTicketSell: boolean,
        bCancelDeposit: boolean
    ): void {
        const lAmount: number = lSells;
        if (type === TransType.TRANS_ACA) {
            this.content.customerStatus = CustomerStatus.ACCOUNT_ACCESSED;
            this.setAccountAccessTXN(txn);
        } else if (type === TransType.TRANS_ACR) {
            this.content.customerStatus = CustomerStatus.ACCOUNT_RELEASED;
            // theCancellableTransRecord.RemoveAll();
            // by Chris Chan, 20130502, PSR2013 R0, BR A35a, Ticket Cancellation Control
        } else {
            // this customerStatus has been always incorrectly assigned to ACCOUNT_INITED
            // when the transaction is NOT account access or release
            // this customerStatus should only assign to ACCOUNT_INITED when it is ACCOUNT_NONE
            if (this.content.customerStatus === CustomerStatus.ACCOUNT_NONE) {
                this.content.customerStatus = CustomerStatus.ACCOUNT_INITED;
            }

            if (type === TransType.TRANS_aDEP) {
                this.Deposit = lAmount;
                this.content.lBalance -= lAmount;
                this.content.lCashBalance -= -lAmount;
            } else if (type === TransType.TRANS_aWDR) {
                // this.Withdrawal(lAmount);
                this.content.lBalance -= lAmount;
                this.content.lCashBalance -= -lAmount;
            } else if (type === TransType.TRANS_CAN && bCancelDeposit) {
                this.content.lTransTotal = lAmount;
                this.content.lEscPayTotal -= lAmount;
                this.content.uEscPayCount++;
                this.content.lBalance -= -lAmount;
                this.content.lCashBalance -= lAmount;
            } else {
                this.UpdateSell(lAmount, bTicketSell);
            }
        }
        this.Update(type, lAmount, txn);
    }

    // update when customer select other account, input number not more than 3 digits
    // public OtherAccount(iNumber: number): void {
    //     if (this.content.bOtherAccount) {
    //         this.content.strSelectedAccount =
    //             iNumber >= 100
    //                 ? iNumber.toString()
    //                 : ('000' + iNumber).slice(-3);
    //         this.content.iOtherAccountNum = iNumber;
    //         this.save();
    //     }
    // }
    get history() {
        return this.content.history;
    }

    @read()
    public getAccountAccessTXN() {
        if (this.history._accountAccessTXN.length > 0) {
            return this.history._accountAccessTXN;
        } else {
            return '0000';
        }
    }

    @save()
    public setAccountAccessTXN(txn: string) {
        this.history._accountAccessTXN = txn;
    }

    @save()
    public Reset(): void {
        this.history.iCount = 0;
        this.history.transHistory = [];
    }

    // Update(type: TransType, lTotal: number) {
    @save()
    public Update(type: TransType, total: number, txn: string): void {
        const count = this.history.transHistory.push({
            type: type,
            total: total,
            txn: txn,
        });
        if (count > this.history.MAX_CUST_HIST) {
            this.history.transHistory.shift();
            this.history.iCount = count - 1;
        } else {
            this.history.iCount = count;
        }
    }

    @read()
    public Count(type: TransType): number {
        let iRet = 0;

        this.history.transHistory.forEach((oneHistory) => {
            if (oneHistory.type === type) {
                ++iRet;
            }
        });

        return iRet;
    }

    @read()
    public GetDetail(nLastRec: number): string {
        let iRemain = 0;

        let strOutput = '';
        if (this.history.iCount > nLastRec) {
            iRemain = this.history.iCount - nLastRec;
        }

        for (let i = iRemain; i < this.history.iCount; i++) {
            strOutput += ('000' + i).slice(
                -this.history.MAX_CUST_HIST.toString().length
            );
            strOutput += ' ';
            const thisTransHis = this.history.transHistory[i];
            strOutput += TransType[thisTransHis.type];
            strOutput += ' ';

            if (
                thisTransHis.type === TransType.TRANS_ACA ||
                thisTransHis.type === TransType.TRANS_ACR
            ) {
                strOutput += '{' + thisTransHis.total + ':C}';
            } else {
                // is right
                const strTemp: string = '{' + thisTransHis.total + ':C}';
                strTemp.replace(/-/g, '');
                strOutput += strTemp;
            }
            strOutput += '\n';
        }

        return strOutput;
    }

    @readNSave()
    public get qrcValue(): string {
        return this.content.qrcValue;
    }
    public set qrcValue(value: string) {
        this.content.qrcValue = value;
    }

    @readNSave()
    public get betslipPrintReceipt(): number {
        return this.content.betslipPrintReceipt;
    }

    public set betslipPrintReceipt(value: number) {
        this.content.betslipPrintReceipt = value;
    }
}

const customer = new Customer();
customer.read();

export { customer };
