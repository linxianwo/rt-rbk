/****************************************************************
**********          @file Customer.cs              **************
**********          @brief Get Customer parameter     ***********
**********          @author Henry        ************************
**********          @version 1.0         ************************
**********          @date 2018-07-28     ************************
*****************************************************************/

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Utilities.Pattern;

/*===========================================================================*/
namespace TerminalConfig
{
    /*===========================================================================*/
    public class CustomertHistory
    {
        private int iCount = 0;
        private int[] indexArray = new int[MAX_CUST_HIST];
        private TransType[] typeArray = new TransType[MAX_CUST_HIST];
        private long[] lTotalArray = new long[MAX_CUST_HIST];
        private const int MAX_CUST_HIST = 20;
        private string[] strTransArray =
        {
           "ACA",
           "ACR",
           "APAY",
           "DEP",
           "WDR",
           "ENQ",
           "CAN",
           "PAY",
           "REF",
           "CVI",
           "CVC",
           "CVP",
           "DEP",
           "WDR",
           "HVP",
           "eBF",
           "eBB",
           "eCVI",
           "eTBD",
           "eTBW",
           "eTBB",
           "WIN",
           "PLA",
           "QIN",
           "QPL",
           "W-P",
           "DBL",
           "6UP",
           "6WN",
           "TCE",
           "DQ ",
           "TBL",
           "D-T",
           "AWN",
           "APL",
           "AWP",
           "AQN",
           "QTT",
           "QAD",
           "T-T",
           "AQP",
           "AUT",
           "FCT",
           "QQP",
           "TRI",
           "HAD",
           "HDC",
           "CRS",
           "CRSP",
           "TTG",
           "HFT",
           "HFTP",
           "ALUP HAD",
           "HILO",
           "OOE",
           "HCSP",
           "THFP",
           "FGS",
           "HHAD",
           "ALUP HHAD",
           "MK6",
           "ALUP CRS",
           "ALUP HIL",
           "ALUP OOE",
           "ALUP TTG",
           "ALUP HFT",
           "HFMP",
           "HFMP",
           "DHCP",
           "CHP",
           "TOFP",
           "ADTP",
           "GPW",
           "GPF",
           "ALUP GPW",
           "ALUP GPF",
           "SPC (M)",
           "SPC (T)",
           "TPS",
           "ALUP HDC",
           "ALUP",
           "STB",
           "FF ",
           "FHAD",
           "TQL",
           "JKC",
           "FTS",
           "NTS",
           "ETS",
           "FHLO",
           "FCRS",
           "CHLO",
           "ACW",
           "CWA",
           "CWB",
           "CWC",
           "IWN",
           "XXXX",
        };

        /*=====================================================*/
        public CustomertHistory()
        {
            Reset();
        }

        /*=====================================================*/
        public void Reset()
        {
            iCount = 0;
            for (int i = 0; i < MAX_CUST_HIST; i++)
            {
                indexArray[i] = 0;
                typeArray[i] = TransType.TRANS_ACA;
                lTotalArray[i] = 0;
            }
        }

        /*=====================================================*/
        public void Update(TransType type, long lTotal)
        {
            if (iCount == MAX_CUST_HIST)
            {
                for (int i = 0; i < MAX_CUST_HIST - 1; i++)
                {
                    indexArray[i] = indexArray[i + 1];
                    lTotalArray[i] = lTotalArray[i + 1];
                    typeArray[i] = typeArray[i + 1];
                }

                iCount = MAX_CUST_HIST - 1;      // already at end, adjust the counter
            }

            if (iCount > 0)
            {
                indexArray[iCount] = indexArray[iCount - 1] + 1;
            }
            else
            {
                indexArray[iCount] = 1;
            }

            lTotalArray[iCount] = lTotal;
            typeArray[iCount] = type;
            iCount++;
        }

        /*=====================================================*/
        public int Count(TransType type)
        {
            int iRet = 0;

            for (int i = 0; i < MAX_CUST_HIST - 1; i++)
            {

                if (typeArray[i] == type)
                {

                    iRet++;
                }
            }

            return iRet;
        }

        /*=====================================================*/
        public void GetDetail(int iLines, out string strOutput)
        {
            int iRemain = 0;

            strOutput = "";
            if (iCount > iLines)
            {
                iRemain = iCount - iLines;
            }

            for (int i = iRemain; i < iCount; i++)
            {
                strOutput += string.Format("{0:D3}", indexArray[i]);

                strOutput += " ";
                strOutput += strTransArray[(int)typeArray[i]];
                strOutput += " ";

                if (typeArray[i] == TransType.TRANS_ACA || typeArray[i] == TransType.TRANS_ACR)
                {
                    strOutput += lTotalArray[i].ToString("{0:C}");
                }
                else
                {
                    string strTemp = lTotalArray[i].ToString("{0:C}");
                    strTemp.Replace("-", "");

                    strOutput += strOutput;
                }

                strOutput += "\n";
            }
        }
        /*=====================================================*/
    }

    public enum TransType
    {
        TRANS_ACA = 0,
        TRANS_ACR,
        TRANS_aPAY,  // account auto pay
        TRANS_aDEP,  // account deposit
        TRANS_aWDR,  // account withdrawal
        TRANS_ENQ,
        TRANS_CAN,
        TRANS_PAY,
        TRANS_REF,
        TRANS_CVI,
        TRANS_CVC,
        TRANS_CVP,
        TRANS_DEP,
        TRANS_WDR,
        TRANS_HVP,  // high value pay
        TRANS_eBF,  // eft bank debit
        TRANS_eBB,  // eft bank balance
        TRANS_eCVI,
        TRANS_eTBD,
        TRANS_eTBW,
        TRANS_eTBB,  // eft TB balance
        TRANS_WIN,
        TRANS_PLA,
        TRANS_QIN,
        TRANS_QPL,
        TRANS_WP,
        TRANS_DBL,
        TRANS_6UP,
        TRANS_6WN,
        TRANS_TCE,
        TRANS_DQ,
        TRANS_TBL,
        TRANS_DT,
        TRANS_AWN,
        TRANS_APL,
        TRANS_AWP,
        TRANS_AQIN,
        TRANS_QTT,
        TRANS_QAD,
        TRANS_TT,
        TRANS_AQP,
        TRANS_AUT,
        TRANS_FCT,
        TRANS_QQP,
        TRANS_TRI,
        TRANS_HAD,
        TRANS_HDC,
        TRANS_CRS,
        TRANS_CRSP,
        TRANS_TTG,
        TRANS_HFT,
        TRANS_HFTP,
        TRANS_AHAD,
        TRANS_HIL,
        TRANS_OOE,
        TRANS_HCSP,
        TRANS_THFP,
        TRANS_FGS,
        TRANS_HHAD,
        TRANS_AHHAD,
        TRANS_MK6,
        TRANS_ACRS,
        TRANS_AHIL,
        TRANS_AOOE,
        TRANS_ATTG,
        TRANS_AHFT,
        TRANS_HFMP6,
        TRANS_HFMP8,
        TRANS_DHCP,
        TRANS_CHP,
        TRANS_TOFP,
        TRANS_ADTP,
        TRANS_GPW,
        TRANS_GPF,
        TRANS_AGPW,
        TRANS_AGPF,
        TRANS_SPCM,
        TRANS_SPCT,
        TRANS_TPS,
        TRANS_AHDC,
        TRANS_AUP,
        TRANS_STB,
        TRANS_FF,
        TRANS_FHAD,
        TRANS_TQL,
        TRANS_JKC,
        TRANS_FTS,
        TRANS_NTS,
        TRANS_ETS,
        TRANS_FHLO,
        TRANS_FCRS,
        TRANS_CHLO,
        TRANS_ACW,
        TRANS_CWA,
        TRANS_CWB,
        TRANS_CWC,
        TRANS_IWN,
        TRANS_MAX,
        TRANS_FLT,
        TRANS_TNC
    };

    /*=====================================================*/
    public enum CustomerType
    {
        CUST_TB = 0,
        CUST_ESC,
        CUST_PAYOUT,
        CUST_QRC
    };

    /*=====================================================*/
    public enum CustomerStatus
    {
        ACCOUNT_NONE = 0,
        ACCOUNT_INITED,
        ACCOUNT_ACCESSED,
        ACCOUNT_RELEASED,
        ACCOUNT_COMPLETED
    };

    /*=====================================================*/
    public enum CallFlagType
    {
        CALL_FLAG_NONE = 0xff,
        CALL_FLAG_TX_BOCC = 0x00,
        CALL_FLAG_TX_HOTLINE = 0x10,
        CALL_FLAG_TX_ESCADMIN = 0x30,
        CALL_FLAG_DIVI_FORFEIT = 0x40,
        CALL_FLAG_TX_SS = 0x50,
        CALL_FLAG_TX_8000 = 0x60,
        CALL_FLAG_UPGRADE = 0x70
    };

    /*=====================================================*/
    public enum ErtType
    {
        NONE = 0,
        IS,
        TB,
        ALL
    };

    /*=====================================================*/
    public enum ReleaseCodeType
    {
        RELEASE_NORMAL = 0,
        RELEASE_CARD_REMOVED = 1
    }

    /*=====================================================*/
    public enum AccountType
    {
        ACC_NONE = -1,
        ACC_NOMINATED,
        ACC_PAN,
        ACC_SAN1,
        ACC_SAN2,
        ACC_OTHER
    }

    /*=====================================================*/
    public enum NBAType
    {
        NBA_NONE = 0,
        NBA_PRI,
        NBA_SEC
    }

    /*===========================================================================*/
    public class Customer
    {
        public const int TB_ACCOUNT_LENGTH = 8;
        public const int ESC_ACCOUNT_LENGTH = 16;
        public const int TB_SEC_CODE_LENGTH = 6;
        public const int MAX_PIN_LENGTH = 12;
        public const int NBA_LENGTH = 13;
        public const int REGISTRATION_LENGTH = 8;

        /*=====================================================*/
        private uint uSellCount;
        private long lSellTotal;
        private uint uTicketSellCount;
        private uint uEscSellCount;
        private long lEscSellTotal;
        private uint uCashSellCount;
        private long lCashSellTotal;
        private uint uPayCount;
        private long lPayTotal;
        private uint uEscPayCount;
        private long lEscPayTotal;
        private uint uCashPayCount;
        private long lCashPayTotal;
        private long lCashBalance;  // cater cash mode operation
        private long lBalance;
        private long lOpeningBalance;
        private uint uEftCount;
        private long lEftTotal;
        private long lTotalWithdrawal;
        private uint uWithdrawalCount;
        private bool bPinRequired;
        private long lTotalDeposit;
        private uint uDepositCount;
        private int iSelectedAccount;
        private bool bOtherAccount;
        private int iOtherAccountNum;
        private string strAccountNumber;
        private string strSelectedAccount;
        private bool bPrinted;
        private bool bNewFlag;
        private int iLanguage;
        private long lTransTotal;
        private CustomerType custType;
        private CustomerStatus customerStatus;
        private ReleaseCodeType releaseCode;
        private CallFlagType callFlag;
        private ErtType ert;
        private NBAType nbaIndicator;
        private CustomertHistory history = new CustomertHistory();

        /*=====================================================*/
        private Customer()
        {
            Init();
        }

        /*=====================================================*/
        public void Init(bool bRequired = true, CustomerType custType = CustomerType.CUST_ESC)
        {
            uSellCount = 0;
            lSellTotal = 0;
            uTicketSellCount = 0;
            uEscSellCount = 0;
            lEscSellTotal = 0;
            uCashSellCount = 0;
            lCashSellTotal = 0;
            uPayCount = 0;
            lPayTotal = 0;
            uEscPayCount = 0;
            lEscPayTotal = 0;
            uCashPayCount = 0;
            lCashPayTotal = 0;
            lCashBalance = 0;
            lBalance = 0;
            lOpeningBalance = 0;
            uEftCount = 0;
            lEftTotal = 0;
            lTotalWithdrawal = 0;
            uWithdrawalCount = 0;
            bPinRequired = false;
            lTotalDeposit = 0;
            uDepositCount = 0;
            iSelectedAccount = 0;
            bOtherAccount = false;
            iOtherAccountNum = 0;
            strAccountNumber = "";
            strSelectedAccount = "";
            bPrinted = true;
            bNewFlag = true;
            iLanguage = 0;
            lTransTotal = 0;
            custType = CustomerType.CUST_ESC;
            customerStatus = CustomerStatus.ACCOUNT_NONE;
            releaseCode = ReleaseCodeType.RELEASE_NORMAL;
            callFlag = CallFlagType.CALL_FLAG_NONE;
            ert = ErtType.NONE;
            nbaIndicator = NBAType.NBA_PRI;
            history.Reset();

            if (custType == CustomerType.CUST_ESC)
            {
                bPinRequired = bRequired;
            }
            else
            {
                bPinRequired = false;
            }
        }

        /*=====================================================*/
        public CustomerType CustType
        {
            set
            {
                custType = value;
            }
            get
            {
                return custType;
            }
        }

        /*=====================================================*/
        public string CardAccountNumber { get; set; } // the account number is composed of 12 character for esc card number 
        public string IntegratedAccountNumber { get; set; } // the account number is composed of 8 character of digits for integrated account 
        public string TbSecurityCode { get; set; } // the security code is composed of 6 character of digits
        public string NewTbSecurityCode { get; set; } // the security code is composed of 6 character of digits
        // the card bonus, which is stored at the CMS/ESC BE. This value will be sent upon A/C access
        public uint Bonus { get; set; } = 0;
        public string BankPIN { get; set; }
        public string TbEftPin { get; set; }  // get TB EFT pin
        public char IsEftPin { get; set; }  // get IS EFT pin
        public string NBANumber { get; set; }
        public string OldEFTPin { get; set; }  // get old EFT pin for change pin purpose
        public string NewEFTPin { get; set; }  // get new EFT pin for change pin purpose
        public string RegNumber { get; set; }  // get registration number
        public string PriErtNumber { get; set; }  // get Primary registration number
        public string SecRegNumber { get; set; }  // get Secondary registration number
        public string PriNBANumber { get; set; }  // get primary NBA
        public string SecNBANumber { get; set; }  // get secondary NBA       
        // Adding transaction contunued indicators [***] to alert operator ans supervisory staff	
        public bool IsTransContinued { get; set; } = false;
        public bool IsJustBet { get; set; } = false;  // to indicate if a bet has been just made by a customer
        public bool IsQRCCustomer
        {
            get
            {
                return CustType == CustomerType.CUST_QRC;
            }
        }

        /*=====================================================*/
        //  public readonly Instance = new CCustomer();
        public static Customer Instance
        {
            get
            {
                return SingletonT<Customer>.Instance;
            }
        }

        /*=====================================================*/
        public uint SellCount  // the number of sell transaction
        {
            get
            {
                return uSellCount;
            }
            set
            {
                uSellCount = value;
            }
        }

        /*=====================================================*/
        public long SellTotal  // get customer sell total 
        {
            get
            {
                return lSellTotal;
            }
            set
            {
                lSellTotal = value;
            }
        }

        /*=====================================================*/
        public uint TicketSellCount  // the number of ticket sell transaction
        {
            get
            {
                return uTicketSellCount;
            }
            set
            {
                uTicketSellCount = value;
            }
        }

        /*=====================================================*/
        public uint EscSellCount  // the number of ESC sell transaction
        {
            get
            {
                return uEscSellCount;
            }
            set
            {
                uEscSellCount = value;
            }
        }

        /*=====================================================*/
        public long EscSellTotal  // get customer ESC sell total 
        {
            get
            {
                return lEscSellTotal;
            }
            set
            {
                lEscSellTotal = value;
            }
        }

        /*=====================================================*/
        public uint CashSellCount  // the number of CASH sell transaction
        {
            get
            {
                return uCashSellCount;
            }
            set
            {
                uCashSellCount = value;
            }
        }

        /*=====================================================*/
        public long CashSellTotal  // get customer CASH sell total 
        {
            get
            {
                return lCashSellTotal;
            }
            set
            {
                lCashSellTotal = value;
            }
        }

        /*=====================================================*/
        public uint PayCount  // the number of pay transaction
        {
            get
            {
                return uPayCount;
            }
            set
            {
                uPayCount = value;
            }
        }

        /*=====================================================*/
        public long PayTotal  // get customer pay total 
        {
            get
            {
                return lPayTotal;
            }
            set
            {
                lPayTotal = value;
            }
        }

        /*=====================================================*/
        public uint EscPayCount  // the number of ESC pay transaction
        {
            get
            {
                return uEscPayCount;
            }
            set
            {
                uEscPayCount = value;
            }
        }

        /*=====================================================*/
        public long EscPayTotal  // get customer ESC pay total
        {
            get
            {
                return lEscPayTotal;
            }
            set
            {
                lEscPayTotal = value;
            }
        }

        /*=====================================================*/
        public uint CashPayCount  // the number of CASH pay transaction
        {
            get
            {
                return uCashPayCount;
            }
            set
            {
                uCashPayCount = value;
            }
        }

        /*=====================================================*/
        public long CashPayTotal  // get customer CASH pay total 
        {
            get
            {
                return lCashPayTotal;
            }
            set
            {
                lCashPayTotal = value;
            }
        }

        /*=====================================================*/
        public long CashBalance
        {
            get
            {
                return lCashBalance;
            }
            set
            {
                lCashBalance = value;
            }
        }

        /*=====================================================*/
        public long Balance
        {
            get
            {
                return lBalance;
            }
            set
            {
                lBalance = value;
                lOpeningBalance = value;
            }
        }

        /*=====================================================*/
        public long OpeningBalance // the card initial balance
        {
            get
            {
                return lOpeningBalance;
            }
        }

        /*=====================================================*/
        public uint EftCount  // the number of EFT transaction  
        {
            get
            {
                return uEftCount;
            }
            set
            {
                uEftCount = value;
            }
        }

        /*=====================================================*/
        public long EftTotal  // get customer eft total
        {
            get
            {
                return lEftTotal;
            }
            set
            {
                lEftTotal = value;
            }
        }

        /*=====================================================*/
        public long TotalWithdrawal
        {
            get
            {
                return lTotalWithdrawal;
            }
            set
            {
                lTotalWithdrawal = value;
            }
        }

        /*=====================================================*/
        public uint WithdrawalCount  // the number of account withdrawal
        {
            get
            {
                return uWithdrawalCount;
            }
            set
            {
                uWithdrawalCount = value;
            }
        }

        /*=====================================================*/
        // the pin requirement flag for customer to decide 
        // whether they want their card has pin protection or not. 
        // this value can only be set at the time of card issue this 
        // routine update the status upon ac access in the middle of customer
        public bool PinRequireEnabled
        {
            get
            {
                return bPinRequired;
            }
            set
            {
                bPinRequired = value;
            }
        }

        /*=====================================================*/
        public long Desipot
        {
            get
            {
                return lTotalDeposit;
            }
            set
            {
                lTransTotal = value;
                lTotalDeposit += value;
                uDepositCount++;
                UpdateEft(value);
            }
        }

        /*=====================================================*/
        public uint DepositCount  // the number of account deposit
        {
            get
            {
                return uDepositCount;
            }
        }

        /*=====================================================*/
        // update when customer select account, store the string into the account selected string        
        public int AccountSelected
        {
            get
            {
                if (bOtherAccount)
                {
                    return iOtherAccountNum;
                }
                else
                {
                    return iSelectedAccount;
                }
            }
            set
            {
                if ((int)AccountType.ACC_OTHER == value)
                {
                    bOtherAccount = true;
                    iSelectedAccount = value;
                }
                else
                {
                    bOtherAccount = false;
                    iSelectedAccount = value;
                }
            }
        }

        /*=====================================================*/
        public string AccountNumber  // the account number is composed of 8 character of digits 
        {
            get
            {
                return strAccountNumber;
            }
            set
            {
                strAccountNumber = value;
                customerStatus = CustomerStatus.ACCOUNT_INITED;
            }
        }

        /*=====================================================*/
        //  return the account string for display or print
        public string SelectedAccountString
        {
            get
            {
                return strSelectedAccount;
            }
        }

        /*=====================================================*/
        // only allow to change this flag for ESC customer       
        public bool Printed
        {
            get
            {
                return bPrinted;
            }
            set
            {
                if (custType == CustomerType.CUST_ESC)
                {
                    bPrinted = value;
                }
            }
        }

        /*=====================================================*/
        public bool newCustomerFlag
        {
            get
            {
                return bNewFlag;
            }
            set
            {
                bNewFlag = value;
            }
        }

        /*=====================================================*/
        public int Language
        {
            get
            {
                return iLanguage;
            }
            set
            {
                iLanguage = value;
            }
        }

        /*=====================================================*/
        public long TransTotal  // get customer last transaction's total
        {
            get
            {
                return lTransTotal;
            }
            set
            {
                lTransTotal = value;
            }
        }

        /*=====================================================*/
        //the condition whether the customer is end due to the card is removed, not ejected.
        public ReleaseCodeType ReleaseCode
        {
            get
            {
                return releaseCode;
            }
            set
            {
                releaseCode = value;
            }
        }

        /*=====================================================*/
        public CallFlagType CallFlag
        {
            get
            {
                return callFlag;
            }
            set
            {
                callFlag = value;
            }
        }

        /*=====================================================*/
        public ErtType Ert
        {
            get
            {
                return ert;
            }
            set
            {
                ert = value;
            }
        }

        /*=====================================================*/
        public NBAType NBAIndicator
        {
            get
            {
                return nbaIndicator;
            }
            set
            {
                nbaIndicator = value;
            }
        }

        /*=====================================================*/
        public CustomertHistory History
        {
            get
            {
                return history;
            }
        }

        /*=====================================================*/
        // perform tb account number integration checking, only used by tb account
        public bool VerifyTbAccount
        {
            get
            {
                int iLen = AccountNumber.Length;

                if (iLen == 0 || iLen > TB_ACCOUNT_LENGTH)
                {
                    return false;
                }

                int i = 0;
                int sum = 0;
                int[] binary = new int[TB_ACCOUNT_LENGTH + 1];

                for (i = 0; i < TB_ACCOUNT_LENGTH; i++)
                {
                    binary[i] = AccountNumber[i];
                }

                for (i = TB_ACCOUNT_LENGTH; i >= 1; i--)
                {
                    sum = sum + (int)((binary[TB_ACCOUNT_LENGTH - i] & 0x0f) * i);
                }

                if ((sum % 10) != 0)
                {
                    return false;
                }
                else
                {
                    return true;
                }
            }
        }

        /*=====================================================*/
        public void UpdateSell(long lSell, bool bTicketSell)
        {
            if (bTicketSell)
            {
                uTicketSellCount++;
            }

            lTransTotal = lSell;

            if (lSell > 0L)
            {

                uSellCount++;
                lSellTotal += lSell;
                if (custType == CustomerType.CUST_ESC)
                {
                    uEscSellCount++;
                    lEscSellTotal += lSell;
                }
                else
                {
                    uCashSellCount++;
                    lCashSellTotal += lSell;
                }
            }
            else  // pays
            {
                if (lSell < 0L)
                {

                    uPayCount++;
                    lPayTotal -= lSell;
                    if (custType == CustomerType.CUST_ESC)
                    {
                        uEscPayCount++;
                        lEscPayTotal -= lSell;
                    }
                    else
                    {
                        uCashPayCount++;
                        lCashPayTotal -= lSell;
                    }
                }
            }

            if (custType != CustomerType.CUST_ESC)
            {
                lCashBalance -= lSell;
            }

            lBalance -= lSell;
        }

        /*=====================================================*/
        void UpdateEft(long lEftAmt)
        {
            uEftCount++;
            lEftTotal += lEftAmt;
        }

        /*=====================================================*/
        void UpdateBalance(long lAmount, bool bAdd)
        {
            if (bAdd)
            {

                lBalance += lAmount;
            }
            else
            {
                lBalance -= lAmount;
            }
        }

        /*=====================================================*/
        void Withdrawal(long lAmount)
        {
            lTransTotal = lAmount;
            lTotalWithdrawal += lAmount;
            uWithdrawalCount++;
            UpdateEft(lAmount);
        }

        /*=====================================================*/
        // insert esc card after performing some sell/pay transaction then have to adjust the balance
        void EscInsert(long lAmount, string strCardNumber)
        {
            custType = CustomerType.CUST_ESC;

            string strNumber = strCardNumber.Substring(0, ESC_ACCOUNT_LENGTH);
            AccountNumber = strNumber;
            lOpeningBalance = lAmount;
            lBalance = lAmount;
        }

        /*=====================================================*/
        void EftCV(long lAmount)
        {
            lTransTotal = lAmount;
            UpdateEft(lAmount);

            // should be CUST_TB here
            history.Update(TransType.TRANS_eCVI, lAmount);
        }

        /*=====================================================*/
        // update the customer transaction history and amount
        void UpdateTransaction(TransType type, long lSells, bool bTicketSell, bool bCancelDeposit)
        {
            long lAmount = lSells;
            if (type == TransType.TRANS_ACA)
            {
                customerStatus = CustomerStatus.ACCOUNT_ACCESSED;
            }
            else if (type == TransType.TRANS_ACR)
            {
                customerStatus = CustomerStatus.ACCOUNT_RELEASED;
                //theCancellableTransRecord.RemoveAll();  // by Chris Chan, 20130502, PSR2013 R0, BR A35a, Ticket Cancellation Control
            }
            else
            {
                // this customerStatus has been always incorrectly assigned to ACCOUNT_INITED when the transaction is NOT account access or release
                // this customerStatus should only assign to ACCOUNT_INITED when it is ACCOUNT_NONE
                if (customerStatus == CustomerStatus.ACCOUNT_NONE)
                {
                    customerStatus = CustomerStatus.ACCOUNT_INITED;
                }

                if (type == TransType.TRANS_aDEP)
                {
                    Desipot = lAmount;
                    lBalance -= lAmount;
                    lCashBalance -= -lAmount;
                }
                else if (type == TransType.TRANS_aWDR)
                {
                    Withdrawal(lAmount);
                    lBalance -= lAmount;
                    lCashBalance -= -lAmount;
                }
                else if (type == TransType.TRANS_CAN && bCancelDeposit)
                {
                    lTransTotal = lAmount;
                    lEscPayTotal -= lAmount;
                    uEscPayCount++;
                    lBalance -= -lAmount;
                    lCashBalance -= lAmount;
                }
                else
                {
                    UpdateSell(lAmount, bTicketSell);
                }
            }

            history.Update(type, lAmount);
        }

        /*=====================================================*/
        // update when customer select other account, input number not more than 3 digits       
        public void OtherAccount(int iNumber)
        {
            if (bOtherAccount)
            {
                strSelectedAccount = string.Format("{0:D3}", iNumber);
                iOtherAccountNum = iNumber;
            }
        }

        /*=====================================================*/
    }
}
