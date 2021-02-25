import { ERROR_ID } from '../../share/models/errorMessage';
import { Slip } from '../../share/models/hw-serv/betslip-models';
import {
    ResponseObject,
    SUCCESS_RESPONSE,
    ResponseObjectCode,
    ERROR_MSG,
    getErrorKeyFromErrorCode,
} from '../../share/models/response-common';

const BASE2 = 2;
const BASE8 = 8;
const BASE16 = 16;
const BASE32 = 32;
const STR_PAY_REC = 'PayoutReceipt';
const STR_REV_PAY_REC = 'ReversedPayoutReceipt';
const STR_DATA_ERROR = 'DATA FIELD ERROR';
const OCR_LEN_WITH_BCN_19 = 24;

const BIT0 = 0x1;
const BIT1 = 0x2;
const BIT2 = 0x4;
const BIT3 = 0x8;
const BIT4 = 0x10;
const BIT5 = 0x20;
const BIT6 = 0x40;
const BIT7 = 0x80;
const BIT8 = 0x100;
const BIT9 = 0x200;
const BIT10 = 0x400;
const BIT11 = 0x800;
const BIT12 = 0x1000;
const BIT13 = 0x2000;
const BIT14 = 0x4000;
const BIT15 = 0x8000;

const MAX_BCN_LEN = 16;

const SHIFT_OCR_BCN = 2;
const SHIFT_OCR_BCN_19 = 3;

const OCR_LEN_WITH_BCN_16 = 22;

const isCharBase = (chBase: string, nBase: number): boolean => {
    let bRet = true;
    const aBase = chBase.toUpperCase();

    switch (nBase) {
        case BASE2:
            if (aBase < '0' || aBase > '1') {
                bRet = false;
            }
            break;

        case BASE8:
            if (aBase < '0' || aBase > '7') {
                bRet = false;
            }
            break;

        case BASE16:
            if (aBase < '0' || aBase > 'F' || (aBase > '9' && aBase < 'A')) {
                bRet = false;
            }
            break;

        case BASE32:
            if (aBase < '0' || aBase > 'V' || (aBase > '9' && aBase < 'A')) {
                bRet = false;
            }
            break;
        default:
            bRet = false;
            break;
    }
    return bRet;
};
const isCStrBase = (cstrBase: string, nBase: number): boolean => {
    let bRet = true;
    const nLength = cstrBase.length;

    for (let i = 0; i < nLength && bRet; i++) {
        if (!isCharBase(cstrBase.charAt(i), nBase)) {
            bRet = false;
        }
    }
    return bRet;
};

const convertChar2Numeric = (aSrc: string): number => {
    let aRet = 0x00;

    if (isCharBase(aSrc, BASE32)) {
        aRet = aSrc.toUpperCase().charCodeAt(0);

        if (aRet >= '0'.charCodeAt(0) && aRet <= '9'.charCodeAt(0)) {
            aRet -= '0'.charCodeAt(0); // convert to 0x00 to 0x09
        } else {
            aRet = aRet - '@'.charCodeAt(0) + 9; // convert to 0x0A to 0x1F
        }
    }
    return aRet;
};

const convertOtherBaseCStr2BinCStr = (cstrBase: string, nBase: number) => {
    let cstrBin = '';

    if (isCStrBase(cstrBase, nBase)) {
        if (nBase === BASE2) {
            // same base, no conversion needed

            cstrBin = cstrBase;
        } else {
            let nNoOfBitUsed = 0;
            let nOffsetBit = 0;
            const nLength = cstrBase.length;
            let aBase;
            const bitMask = [BIT4, BIT3, BIT2, BIT1, BIT0];
            let nBit;

            switch (nBase) {
                case BASE32:
                    nNoOfBitUsed = 5;
                    nOffsetBit = 0;
                    break;

                case BASE16:
                    nNoOfBitUsed = 4;
                    nOffsetBit = 1;
                    break;

                case BASE8:
                    nNoOfBitUsed = 3;
                    nOffsetBit = 2;
                    break;

                default:
                    break;
            }
            for (let i = 0; i < nLength; i++) {
                aBase = convertChar2Numeric(cstrBase.charAt(i)); // convert to 0x00 to 0x09 & 0x0A to 0x1F

                for (nBit = 0; nBit < nNoOfBitUsed; nBit++) {
                    if (aBase & bitMask[nBit + nOffsetBit]) {
                        cstrBin += '1';
                    } else {
                        cstrBin += '0';
                    }
                }
            }
        }
    }
    return cstrBin;
};

const insertLeadingZero = (cstrSource: string, nCStrLength: number) => {
    while (cstrSource.length < nCStrLength) {
        '0'.concat(cstrSource);
    }
    return cstrSource;
};

const convertNumeric2Char = (aSrc: number) => {
    let aRet = 0x00;

    if (aSrc < BASE32) {
        aRet = aSrc;

        if (aRet >= 0 && aRet <= 9) {
            aRet += '0'.charCodeAt(0); // convert to '0' to '9'
        } else {
            aRet = aRet + '@'.charCodeAt(0) - 9; // convert to 'A' to 'V'
        }
    }
    return String.fromCharCode(aRet);
};
const convertBinCStr2OtherBaseCStr = (cstrBin: string, nBase: number) => {
    let cstrBase = '';

    if (isCStrBase(cstrBin, BASE2)) {
        let nNoOfBitUsed = 0;
        switch (nBase) {
            case BASE32:
                nNoOfBitUsed = 5;
                break;

            case BASE16:
                nNoOfBitUsed = 4;
                break;

            case BASE8:
                nNoOfBitUsed = 3;
                break;

            case BASE2:
                cstrBase = cstrBin; // same base, no conversion needed
                break;

            default:
                break;
        }
        if (nNoOfBitUsed !== 0) {
            let cstrTemp = cstrBin;
            let nLength = cstrTemp.length;

            // insert leading zero if it's < nNoOfBitUsed for the last hex
            const nReminder = nLength % nNoOfBitUsed;

            if (nReminder > 0) {
                cstrTemp = insertLeadingZero(
                    cstrTemp,
                    nLength + nNoOfBitUsed - nReminder
                );
                nLength = cstrTemp.length; // update nLength
            }
            let aBase = 0x00,
                bitMask = BIT0;

            for (let i = nLength - 1; i >= 0; i--) {
                if (cstrTemp.charAt(i) === '1') {
                    aBase = aBase | bitMask;
                }
                bitMask <<= 1;

                if (i % nNoOfBitUsed === 0) {
                    cstrBase = convertNumeric2Char(aBase).concat(cstrBase);
                    aBase = 0x00;
                    bitMask = BIT0;
                }
            }
        }
    }
    return cstrBase;
};

const convertCStrBase = (
    cstrSrc: string,
    nBaseSrc: number,
    nBaseRet: number
) => {
    let cstrRet = '';

    if (
        isCStrBase(cstrSrc, nBaseSrc) &&
        (nBaseRet === BASE2 ||
            nBaseRet === BASE8 ||
            nBaseRet === BASE16 ||
            nBaseRet === BASE32)
    ) {
        if (nBaseSrc === nBaseRet) {
            // same base, no conversion needed

            cstrRet = cstrSrc;
        } else {
            if (nBaseSrc !== BASE2) {
                cstrRet = convertOtherBaseCStr2BinCStr(cstrSrc, nBaseSrc);
            } else {
                cstrRet = cstrSrc;
            }
            if (nBaseRet !== BASE2) {
                cstrRet = convertBinCStr2OtherBaseCStr(cstrRet, nBaseRet);
            }
        }
    }
    return cstrRet;
};

const shiftCStr2Right = (cstrSrc: string, nShift: number) => {
    let cstrRet = cstrSrc;

    if (nShift > 1 && cstrRet !== '') {
        const nLength = cstrSrc.length;

        for (let i = 0, j = nShift % nLength; i < nLength; i++, j++) {
            if (j >= nLength) {
                j = 0;
            }
            cstrRet =
                cstrRet.substring(0, j) +
                cstrSrc.charAt(i) +
                cstrRet.substr(j + 1);
        }
    }
    return cstrRet;
};

const shiftCStr2Left = (cstrSrc: string, nShift: number) => {
    let cstrRet = cstrSrc;

    if (nShift > 1 && cstrRet !== '') {
        const nLength = cstrSrc.length;

        for (let i = 0, j = nShift % nLength; i < nLength; i++, j++) {
            if (j >= nLength) {
                j = 0;
            }
            cstrRet =
                cstrRet.substring(0, i) +
                cstrSrc.charAt(j) +
                cstrRet.substr(i + 1);
        }
    }
    return cstrRet;
};
const convertBarTo16Bcn = (cstrBar: string, nBase: number) => {
    let cstrRet = '';

    if (cstrBar !== '') {
        // reverse: inserted into the position of "first symbol mod 12" after the first symbol
        let cstrTemp = cstrBar;
        const nIndex = 1 + (convertChar2Numeric(cstrTemp.charAt(0)) % 12);

        // reverse: index is then itself perform a binary shift of 2 to the right
        let cstrShift = convertCStrBase(
            cstrTemp.substr(nIndex, 1),
            BASE16,
            BASE2
        );
        cstrShift = shiftCStr2Right(cstrShift, 2);
        cstrShift = convertCStrBase(cstrShift, BASE2, BASE16);
        const aShift = convertChar2Numeric(cstrShift.charAt(0));

        cstrTemp = cstrTemp.substring(0, nIndex) + cstrTemp.substr(nIndex + 1);

        // reverse: Each 5 bit values then perform a binary shift of 'N' time to the left
        const cstrBin = convertCStrBase(cstrTemp, nBase, BASE2);
        const nLength = cstrBin.length;
        const nNoOfBit = 5;

        for (let i = 0; i < nLength; i += nNoOfBit) {
            cstrTemp = cstrBin.substr(i, nNoOfBit);
            cstrRet += shiftCStr2Right(cstrTemp, aShift);
        }
        cstrRet = convertCStrBase(cstrRet, BASE2, BASE16);

        // reverse:
        // The first BCN number is used as the scramble and shifting index 'N'
        // The rest 15 hexadecimal numbers are then shift 'N' times to the right
        cstrRet = cstrShift + shiftCStr2Left(cstrRet, aShift);
    }
    return cstrRet;
};
const convertOcrTo19Bcn = (cstrOcr) => {
    let cstrRet = '';
    let cstrBase8 = '';
    let cstrBase16 = '';

    // reverse: every 4 chars of cstrBase16, insert 1 char of 1st 4 chars of cstrBase8
    for (let i = 4; i < OCR_LEN_WITH_BCN_19; i += 5) {
        cstrBase16 += cstrOcr.substr(i, 4);
        cstrBase8 += cstrOcr.charAt(i + 4);
    }
    // reverse: insert 2nd 4 chars of cstrBase8 at the beginning
    cstrBase8 += cstrOcr.substr(0, 4);

    // reverse: do the same scrambling as convertBcn2Bar, not to return as base32, but as base16
    cstrBase16 = convertBarTo16Bcn(cstrBase16, BASE16);

    // reverse:
    // pack last 3 bcn digits at the beginning
    // temp trim to MAX_BCN_LEN
    cstrBase16 = cstrBase16.substr(
        cstrBase16.length - (MAX_BCN_LEN - SHIFT_OCR_BCN_19)
    );

    // reverse: convert last 6 bcn to base8
    if (isCStrBase(cstrBase8, BASE8)) {
        cstrBase8 = convertCStrBase(cstrBase8, BASE8, BASE16);
        cstrRet = cstrBase16 + cstrBase8;
    }
    return cstrRet;
};

const convertOcrTo16Bcn = (cstrOcr: string) => {
    // reverse: packing the first 2 OCR digit at the end
    let cstrRet = shiftCStr2Right(cstrOcr, SHIFT_OCR_BCN);

    // reverse:
    // The first BCN number is represented using the first 2 OCR digit, in binary format
    // The reset 15 hexadecimal character will be represented by the rest 20 OCR characters without shifting
    cstrRet = convertCStrBase(cstrRet, BASE8, BASE16);

    cstrRet.substr(1); // excess leading zero, coz 66-bit bin translate to 68-bit bin

    return cstrRet;
};

export const convertOcr2Bcn = (cstrOcr: string) => {
    let cstrRet = '';
    const nLength = cstrOcr.length;

    // as Ocr in a mixture of BASE8 & BASE16, so check if it's in BASE16 here 1st,
    // and check the BASE8 part after the filtering
    if (nLength === OCR_LEN_WITH_BCN_19 && isCStrBase(cstrOcr, BASE16)) {
        cstrRet = convertOcrTo19Bcn(cstrOcr);
    } else {
        if (nLength === OCR_LEN_WITH_BCN_16 && isCStrBase(cstrOcr, BASE8)) {
            cstrRet = convertOcrTo16Bcn(cstrOcr);
        }
    }
    return cstrRet;
};

const convertBarTo19Bcn = (cstrBar: string, cstrOcr: string) => {
    let cstrRet = '';
    let cstrBase8 = '';

    // reverse: insert 2nd 4 chars of cstrBase8 at the beginning
    cstrBase8 = cstrOcr.substr(0, 4);

    // reverse: convert last 6 bcn to base8
    if (isCStrBase(cstrBase8, BASE8)) {
        cstrBase8 = convertCStrBase(cstrBase8, BASE8, BASE16);

        // reverse: trim the 1st 16 hex to create bar code
        cstrRet = convertBarTo16Bcn(cstrBar, BASE32) + cstrBase8;
    }
    return cstrRet;
};

const convertBar2Bcn = (cstrBar: string, cstrOcr: string) => {
    let cstrRet = '';

    if (isCStrBase(cstrBar, BASE32)) {
        const nLength = cstrOcr.length;

        if (nLength === OCR_LEN_WITH_BCN_19) {
            cstrRet = convertBarTo19Bcn(cstrBar, cstrOcr);
        } else {
            if (nLength === OCR_LEN_WITH_BCN_16) {
                cstrRet = convertBarTo16Bcn(cstrBar, BASE32);
            }
        }
    }
    return cstrRet;
};
export const validatePayRec = (req, res, next) => {
    const slip: Slip = req.betSlip;
    let nError = ERROR_ID.RID_NO_ERROR;

    if (slip.slipName !== STR_PAY_REC && slip.slipName !== STR_REV_PAY_REC) {
        nError = ERROR_ID.RID_EX_TKT_INV_TKT;
    } else if (slip.slipDataBar === '' || slip.slipDataBar === STR_DATA_ERROR) {
        nError = ERROR_ID.RID_EX_RP_BARCODE_FAIL;
    } else if (slip.slipDataOcr === '' || slip.slipDataOcr === STR_DATA_ERROR) {
        nError = ERROR_ID.RID_EX_RP_OCR_FAIL;
    } else {
        const cstrBcnOcr = convertOcr2Bcn(slip.slipDataOcr);
        const cstrBcnBar = convertBar2Bcn(slip.slipDataBar, slip.slipDataOcr);

        if (cstrBcnOcr === '') {
            nError = ERROR_ID.RID_EX_RP_OCR_FAIL;
        } else if (cstrBcnBar === '') {
            nError = ERROR_ID.RID_EX_RP_BARCODE_FAIL;
        } else {
            if (cstrBcnOcr !== cstrBcnBar) {
                nError = ERROR_ID.RID_EX_RP_BARCODE_OCR_MISMATCH;
            }
        }
    }
    if (nError === ERROR_ID.RID_NO_ERROR) {
        next();
    } else {
        const resObj: ResponseObject = Object.assign({}, SUCCESS_RESPONSE);
        resObj.code = ResponseObjectCode.ERROR_CODE_NORMAL;
        resObj.message = ERROR_MSG[getErrorKeyFromErrorCode(nError)];
        res.status(200).send(resObj);
        return;
    }
    return nError;
};
