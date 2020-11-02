import BufferBuilder = require('./buffer-builder');
import { Constansts } from '../../share/models/comm-serv/CommonDefs';
import { ComSvrException } from './comSvrException';
import { logger } from '../../share/utils/logs';
import { isEmpty } from 'ng-zorro-antd';
import { ERROR_MSG } from '../../share/models/response-common';

export enum DateFormatType {
    /// <summary>
    /// eg. Datetime:1981-12-25 10:15:18  return 81
    /// </summary>
    YY,
    /// <summary>
    /// eg. Datetime:1981-12-25 10:15:18  return 25DEC81
    /// </summary>
    DDMMMYY,
    /// <summary>
    /// eg. Datetime:1981-12-25 10:15:18  return 25_DEC_81
    /// </summary>
    DD_MMM_YY,
    /// <summary>
    /// eg. Datetime:1981-12-25 10:15:18  return 25_DEC
    /// </summary>
    DD_MMM,
    /// <summary>
    /// eg. Datetime:1981-12-25 10:15:18  return 251281
    /// </summary>
    DDMMYY,
    /// <summary>
    /// eg. Datetime:1981-12-25 10:15:18  return 25_12_81
    /// </summary>
    DD_MM_YY,
    /// <summary>
    /// eg. Datetime:1981-12-25 10:15:18  return 1015
    /// </summary>
    HHMM,
}
export enum PadOption {
    Before,
    After,
}

/// <summary>
/// Provides similar functionality to a StringBuilder, but for bytes
/// And also provide extraction functions for reply message
/// </summary>
///
/// <remarks>
/// To fill the builder, construct a new, empty builder, and call the
/// appropriate Append method overloads.
/// To read data from the builder, either use Rewind on an existing
/// builder, or construct a new builder by passing it the byte array
/// from a previous builder - which you can get with the ToArray
/// method.
/// </remarks>
export class ByteArrayBuilder {
    /// <summary>
    /// Holds the actual bytes.
    /// </summary>
    private store = new BufferBuilder(0x1000);
    private store_Position = 0;
    // region Constants
    /// <summary>
    /// True in a byte form of the Line
    /// </summary>
    readonly streamTrue = 1;
    /// <summary>
    /// False in the byte form of a line
    /// </summary>
    readonly streamFalse = 0;

    readonly BIT6 = 0x40;
    // endregion

    public static StringToBytes(str: string) {
        const bytes = new Array();
        let len: number, c: number;
        len = str.length;
        for (let i = 0; i < len; i++) {
            c = str.charCodeAt(i);
            if (c >= 0x010000 && c <= 0x10ffff) {
                bytes.push(((c >> 18) & 0x07) | 0xf0);
                bytes.push(((c >> 12) & 0x3f) | 0x80);
                bytes.push(((c >> 6) & 0x3f) | 0x80);
                bytes.push((c & 0x3f) | 0x80);
            } else if (c >= 0x000800 && c <= 0x00ffff) {
                bytes.push(((c >> 12) & 0x0f) | 0xe0);
                bytes.push(((c >> 6) & 0x3f) | 0x80);
                bytes.push((c & 0x3f) | 0x80);
            } else if (c >= 0x000080 && c <= 0x0007ff) {
                bytes.push(((c >> 6) & 0x1f) | 0xc0);
                bytes.push((c & 0x3f) | 0x80);
            } else {
                bytes.push(c & 0xff);
            }
        }
        return bytes;
    }
    //
    public static BytesToString(arr) {
        if (typeof arr === 'string') {
            return arr;
        }
        let str = '';
        const _arr = arr;
        for (let i = 0; i < _arr.length; i++) {
            const one = _arr[i].toString(2),
                v = one.match(/^1+?(?=0)/);
            if (v && one.length === 8) {
                const bytesLength = v[0].length;
                let store = _arr[i].toString(2).slice(7 - bytesLength);
                for (let st = 1; st < bytesLength; st++) {
                    store += _arr[st + i].toString(2).slice(2);
                }
                str += String.fromCharCode(parseInt(store, 2));
                i += bytesLength - 1;
            } else {
                str += String.fromCharCode(_arr[i]);
            }
        }
        return str;
    }

    private store_AppendBuffer(buf: Buffer) {
        // 写函数不提供插入操作
        this.store.appendBuffer(buf);
        this.store_Position = this.store.length;
    }

    private store_AppendString(str: string) {
        // 写函数不提供插入操作
        this.store.appendString(str, 'utf8');
        this.store_Position = this.store.length;
    }
    private store_AppendByte(byte: number) {
        this.store.appendUInt8(byte);
        this.store_Position = this.store.length;
    }
    private store_ReadByte(): number {
        const buf = Buffer.alloc(1);
        this.store.copy(buf, 0, this.store_Position, this.store_Position + 1);
        this.store_Position += 1;
        return buf[0];
    }
    private store_ReadBytes(len: number): Buffer {
        const buf = Buffer.alloc(len);
        this.store.copy(buf, 0, this.store_Position, this.store_Position + len);
        this.store_Position += len;
        return buf;
    }
    private store_Seek(offset: number): number {
        this.store_Position = offset;
        return this.store_Position;
    }

    // region Constructors
    /// <summary>
    /// Create a new, empty builder ready to be filled.
    /// </summary>
    constructor() {}

    // endregion

    // region Properties
    /// <summary>
    /// Bytes in the store.
    /// </summary>
    public get Length() {
        return this.store.length;
    }
    //     /// <summary>
    //     /// The current position of store stream
    //     /// </summary>
    public get Position() {
        return this.store_Position;
    }

    //     /// <summary>
    //     /// End of stream
    //     /// </summary>
    //     /// <returns></returns>
    public get EOS() {
        return this.store.length === this.store_Position;
    }

    // // endregion

    // // region Public Methods

    // // region 1: Append

    //     /// <summary>
    //     /// Set new customer flag
    //     /// </summary>
    //     /// <param name="b"></param>
    public AppendNewCust(b: boolean) {
        this.Append(b);
    }

    //     /// <summary>
    //     /// Set message code
    //     /// </summary>
    //     /// <param name="msgCode">message code</param>
    public AppendMsgCode(msgCode: number) {
        this.Append(msgCode);
    }

    //     /// <summary>
    //     /// Add separator sign to byte array, default with character '/'
    //     /// </summary>
    //     ///
    //     /// Corresponding Medthod:
    //     /// 1:CScmpOutAsciiChar('/')
    //     ///
    //     /// <param name="c">sepatator char</param>
    public AppendSeparator(c = Constansts.CHAR_SLASH) {
        this.Append(c);
    }

    //     /// <summary>
    //     /// Formatting an fixed length string into byte array, pad right default
    //     /// </summary>
    //     ///
    //     /// Corresponding Medthod:
    //     /// 1:CScmpOutFixStr
    //     /// 2:CScmpOutVarStr
    //     /// 3:CScmpOutNF(Ascii)
    //     /// 4:CScmpOutN9(Ascii)
    //     ///
    //     /// <param name="s">To be appended string data</param>
    //     /// <param name="len">Fix length,when the length of s less len, should pad zero</param>
    //     /// <param name="option">After pad right, Before pad left</param>
    // public AppendFixStrlen(s: string, len: number, padChar = ' ', option = PadOption.After) {
    //     if (s.length < len) {
    //         if (option === PadOption.Before) {
    //             while (s.length < len) {
    //                 s = padChar + s;
    //             }
    //         } else {
    //             while (s.length < len) {
    //                 s = s + padChar;
    //             }
    //         }
    //     }
    //     this.Append(s);
    // }

    public AppendOutVarStr(s: string) {
        this.Append(s);
    }
    //     /// <summary>
    //     /// Formatting an fixed length string into byte array, pad right default
    //     /// </summary>
    //     ///
    //     /// Corresponding Medthod:
    //     /// 1:CScmpOutFixStr
    //     /// 2:CScmpOutVarStr
    //     /// 3:CScmpOutNF(Ascii)
    //     /// 4:CScmpOutN9(Ascii)
    //     ///
    //     /// <param name="s">To be appended string data</param>
    //     /// <param name="option">After pad right, Before pad left</param>
    AppendFixStr(
        s: string | Buffer,
        len: number,
        padChar?: string,
        option?: PadOption
    );
    AppendFixStr(s: string, padChar?: string, option?: PadOption);
    // AppendFixStr(s: , len: number, padChar?: string, option?: PadOption);
    public AppendFixStr(b?, b1?, b2?, b3?) {
        const btypestr = typeof b;
        const b1typestr = typeof b1;
        const b2typestr = typeof b2;
        if (btypestr === 'string' && b1typestr === 'number') {
            let s: string = b;
            const len: number = b1;
            const padChar: string = b2 || ' ';
            const option: PadOption =
                typeof b3 === 'undefined' || b3 === null ? PadOption.After : b3;

            if (s.length < len) {
                if (option === PadOption.Before) {
                    while (s.length < len) {
                        s = padChar + s;
                    }
                } else {
                    while (s.length < len) {
                        s = s + padChar;
                    }
                }
            } else {
                s = s.substr(0, len);
            }
            this.Append(s);
        } else if (btypestr === 'string' && b1typestr === 'string') {
            const s: string = b;
            const padChar: string = b1 || ' ';
            const option: PadOption =
                typeof b2 === 'undefined' || b2 === null ? PadOption.After : b2;
            const len = s.length;
            this.AppendFixStr(s, len, padChar, option);
        } else if (btypestr === 'object' && b1typestr === 'number') {
            const s: Buffer = b;
            const len: number = b1;
            const padChar: string = b2 || ' ';
            const option: PadOption =
                typeof b3 === 'undefined' || b3 === null ? PadOption.After : b3;

            const fixStr = ByteArrayBuilder.BytesToString(s);
            this.AppendFixStr(fixStr, len, padChar, option);
        } else if (btypestr === 'string') {
            const s: string = b;
            const padChar: string = b1 || ' ';
            const option: PadOption =
                typeof b2 === 'undefined' || b2 === null ? PadOption.After : b2;
            const len = s.length;
            this.AppendFixStr(s, len, padChar, option);
        }
    }
    // public AppendFixStr(s: string, padChar = ' ', option = PadOption.After) {
    //     const len = s.length;
    //     this.AppendFixStrlen(s, len, padChar, option);
    // }

    //     /// <summary>
    //     /// Formatting an fixed length into byte array, pad right default
    //     /// </summary>
    //     ///
    //     /// Corresponding Medthod:
    //     /// 1:CScmpOutFixStr
    //     ///
    //     /// <param name="s">To be appended byte array data</param>
    //     /// <param name="len">Fix length,when the length of s less len, should pad zero</param>
    //     /// <param name="option">After pad right, Before pad left</param>
    // public AppendFixStrBuffer(s: Buffer, len: number, padChar = ' ', option = PadOption.After) {
    //     const fixStr = this.BytesToString(s);
    //     this.AppendFixStrlen(fixStr, len, padChar, option);
    // }

    //     /// <summary>
    //     /// Formatting an ascii data into byte array
    //     /// </summary>
    //     ///
    //     /// Corresponding Medthod:
    //     /// 1:CScmpOutN9(Ascii)
    //     ///
    //     /// <param name="b">To be appended byte data</param>
    AppendAscii(b: number | string); // AppendAscii(byte b) AppendAscii(c: string)
    public AppendAscii(b_c?) {
        const btypestr = typeof b_c;

        if (btypestr === 'number') {
            this.Append(b_c);
        } else if (btypestr === 'string') {
            this.Append(b_c);
        }
    }

    public ConvertInt2BCD(errnum: number) {
        let res = Buffer.alloc(3);
        res[2] = this.SHORT_TO_BCD(errnum, 12);
        res[1] = this.SHORT_TO_BCD(errnum, 6);
        res[0] = this.SHORT_TO_BCD(errnum, 0);
        return res;
    }
    private SHORT_TO_BCD(s: number, n: number) {
        return ((s >> n) & 0x1f) | this.BIT6;
    }
    //     /// <summary>
    //     ///  Formatting a binary value into BIN6 byte array
    //     ///  BCD digit(0-63) with bit 6 on
    //     /// </summary>
    //     ///
    //     /// Corresponding Medthod:
    //     /// 1:CScmpOutBin
    //     ///
    //     /// Example:
    //     /// 0 will convert @
    //     ///
    //     /// <param name = "data" >To be appended byte data</ param >
    public AppendBIN6(data: number) {
        // AppendBIN6(byte data)
        // if (data >= 0 && data <= 63) {
        data = (data & 0x3f) | this.BIT6;
        this.Append(data);
        // } else {
        //     // console.log(string.Format("BIN6 data out of range, data:{0}", data));
        //     // throw new ComSvrException(ErrorMessage.BIN6DataOutOfRange);
        //     console.log(`BIN6 data out of range, data:${data}`);
        //     throw new ComSvrException(ErrorMessage.BIN6DataOutOfRange);
        // }
    }

    //     /// <summary>
    //     /// Format a datetime value into byte array
    //     /// eg.
    //     /// </summary>
    //     ///
    //     /// Corresponding Medthod:
    //     /// 1:CScmpOutDDMMMYY
    //     ///
    //     /// Example:
    //     /// Datetime:1981-12-25 10:15:18 will be converted to 25DEC81
    //     ///
    //     /// <param name="dt">To be appended datetime</param>
    public AppendDDMMMYY(dt: Date) {
        this.AppendDate(dt, DateFormatType.DDMMMYY);
    }

    //     /// <summary>
    //     /// Format a time value into byte array
    //     /// eg. Datetime:1981-12-25 10:15:18  return 1015
    //     /// </summary>
    //     /// <param name="dt">To be appended datetime</param>
    public AppendHHMM(dt: Date) {
        this.AppendDate(dt, DateFormatType.HHMM);
    }

    //     /// <summary>
    //     /// Formatting money data into  byte array
    //     /// </summary>
    //     ///
    //     /// Corresponding Medthod:
    //     /// CScmpOutMoney
    //     ///
    //     /// Example:
    //     /// 1234 convert $AB.CD, -1234 convert $AB.CD-
    //     ///
    //     /// <param name="money"></param>
    public AppendMoney(money: number) {
        this.Append(Constansts.DOLLAR_SIGN);
        const tmp = money > 0 ? money : money * -1;
        const dollar = Math.floor(tmp / 100);
        const cents = tmp % 100;
        this.Append(dollar + '', true);
        if (cents > 0) {
            this.Append(Constansts.CHAR_DECIMAL_POINT);
            this.Append(cents + '', true);
        }
        if (money < 0) {
            this.Append(Constansts.CHAR_MINUS);
        }
    }

    //     /// <summary>
    //     /// Formatting a long data into byte array
    //     /// BCD digit(0-9) with bit 6 on
    //     /// </summary>
    //     ///
    //     /// Corresponding Medthod:
    //     /// CScmpOutN9(N9)
    //     ///
    //     /// Example:
    //     /// 0 convert @, 1 convert A, 1234 convert ABCD
    //     /// if val is 882 and len is 4, it will pad left zero, so 882 will be converted to @HHB
    //     ///
    //     /// <param name="val">To be appended data</param>
    //     /// <param name="len">Fix length, when the length of parameter val less then len, should pad left zero</param>
    AppendN9(val: number, len?: number); // AppendN9(long val, int len) AppendN9(long val)
    AppendN9(b?, b1?) {
        const btypestr = typeof b;
        const b1typestr = typeof b1;
        // const b2typestr = typeof b2;

        if (btypestr === 'number' && b1typestr === 'number') {
            const val: number = b;
            const len: number = b1;
            this.Append(val + '', b1, true);
        } else if (btypestr === 'number') {
            const val: number = b;

            const str = val + '';
            const len: number = str.length;
            this.Append(str, len, true);
        }
    }

    public AppendN9Ascii(str: string, len: number) {
        if (len === 0) {
            this.AppendOutVarStr(str);
        } else {
            this.AppendFixStr(str, len, '0', PadOption.Before);
        }
    }
    //     /// <summary>
    //     /// Formatting an n(F) data(0-F) into byte array
    //     /// hex digit(0-F) with bit 6 on
    //     /// </summary>
    //     ///
    //     /// Corresponding Medthod:
    //     /// CScmpOutNF(Hex)
    //     ///
    //     /// Example:
    //     /// eg. 0 convert @, A convert J
    //     ///
    //     /// <param name="bs"></param>
    public AppendNF(str: string) {
        for (let i = 0; i < str.length; ++i) {
            const data = str[i];
            const datacode = str.charCodeAt(i);

            if ((data >= '0' && data <= '9') || (data >= 'A' && data <= 'F')) {
                let tmp = datacode & 0x0f;
                if (datacode > 0x40) {
                    tmp += 0x09;
                }
                tmp = tmp | this.BIT6;
                this.Append(tmp);
            } else {
                logger.error(`NF data out of range, data:${str}`);
                throw new ComSvrException(
                    ERROR_MSG.RID_COMSERV_ERR_NFDATAOUTOFRANGE
                );
            }
        }
    }

    //     /// <summary>
    //     /// Formatting odds value into byte array
    //     /// </summary>
    //     ///
    //     /// Corresponding Medthod:
    //     /// CScmpOutOdds
    //     ///
    //     /// Example:
    //     ///  1234 will convert to >AB.CD
    //     ///
    //     /// <param name="odds"></param>
    public AppendOdds(odds: number) {
        const beforeDecimal = Math.floor(odds / 1000);
        const afterDecimal = odds % 1000;
        this.AppendAscii(Constansts.BANKER_INDICATOR);
        this.AppendN9(beforeDecimal, 0);
        if (afterDecimal > 0) {
            this.Append(Constansts.CHAR_DECIMAL_POINT);
            this.AppendN9(afterDecimal, Constansts.THREE_DECIMAL_PLACES_LENGTH);
        }
    }

    //     /// <summary>
    //     /// Adds a DateTime into byte array
    //     /// </summary>
    //     /// <param name="dt">Value to append to existing builder data</param>
    public AppendDate(date: Date, dtFormat = DateFormatType.DDMMMYY) {
        const m = new Array(
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec'
        );
        let dt_value = '';
        const year = date.getFullYear() + '';
        const month = ('00' + (date.getMonth() + 1)).slice(-2);
        const monthE = m[date.getMonth()];
        const day = ('00' + date.getDate()).slice(-2);
        const hour = ('00' + date.getHours()).slice(-2);
        const minute = ('00' + date.getMinutes()).slice(-2);

        // Initializes a new en-us culture info
        switch (dtFormat) {
            case DateFormatType.YY:
                dt_value = year.substr(2, 2);
                break;
            case DateFormatType.DDMMMYY:
                dt_value = (day + monthE + year.substr(2, 2)).toUpperCase();
                break;
            case DateFormatType.DD_MMM_YY:
                dt_value = (
                    day +
                    '_' +
                    monthE +
                    '_' +
                    year.substr(2, 2)
                ).toUpperCase();
                break;
            case DateFormatType.DD_MMM:
                dt_value = (day + '_' + monthE).toUpperCase();
                break;
            case DateFormatType.DDMMYY:
                dt_value = day + month + year.substr(2, 2);
                break;
            case DateFormatType.DD_MM_YY:
                dt_value = day + '_' + month + '_' + year.substr(2, 2);
                break;
            case DateFormatType.HHMM:
                dt_value = hour + minute;
                break;
            default:
                dt_value = day + monthE + year.substr(2, 2);
                break;
        }
        this.Append(dt_value);
    }

    // // endregion

    // // region 2: Extraction
    //     /// <summary>
    //     /// Get message code from reply message
    //     /// </summary>
    //     /// <returns>byte</returns>
    public GetMsgCode(): number {
        return this.GetByte(0);
    }
    //     /// <summary>
    //     /// Get error message while reply message code is MC_ERR_REPLY
    //     /// </summary>
    //     /// <returns></returns>
    public GetErrorText() {
        if (this.store.length > 1) {
            const buf = this.GetBytes(1, this.store.length - 1);
            const result = ByteArrayBuilder.BytesToString(buf);

            return result;
            // return Encoding.ASCII.GetString(store.ToArray(), 1, this.Length - 1);
        } else {
            return '';
        }
    }

    //     /// <summary>
    //     /// To read a character from reply message
    //     /// </summary>
    //     /// <param name="offset">The stream position which to begin read form current stream with default one byte</param>
    //     /// <returns>char</returns>
    public GetChar(offset: number): string {
        const buf = this.GetBytes(offset, 1);
        const result = ByteArrayBuilder.BytesToString(buf);
        return result;

        // byte[] buffer = new byte[1];
        // buffer = GetBytes(offset, 1);
        // return Encoding.GetEncoding(Constansts.ENCODING_UTF8).GetChars(buffer)[0];
    }
    //     /// <summary>
    //     /// To read a byte from reply message
    //     /// </summary>
    //     /// <param name="offset">The stream position which to begin read form current stream</param>
    //     /// <param name="len">The number of bytes to read</param>
    //     /// <returns>byte</returns>
    GetByte();
    GetByte(offset: number): number;
    public GetByte(b?, b1?) {
        const btypestr = typeof b;
        if (btypestr === 'number') {
            return this.GetBytes(b, 1)[0];
        } else {
            this.CheckSteam();
            return this.store_ReadByte();
        }
    }

    //     /// <summary>
    //     /// To read byte array from reply message
    //     /// </summary>
    //     /// <param name="offset">The stream position which to begin read form current stream</param>
    //     /// <param name="len">The number of bytes to read</param>
    //     /// <returns>byte[]</returns>

    public GetBytes(offset: number, len: number): Buffer {
        this.store_Seek(offset);
        this.CheckSteam(offset);
        const buffer = this.store_ReadBytes(len);
        return buffer;

        // byte[] buffer = new byte[len];
        // store.Seek(offset, SeekOrigin.Begin);
        // CheckSteam(offset);
        // store.Read(buffer, 0, len);
        // return buffer;
    }

    //     /// <summary>
    //     /// To read fix string from reply message
    //     /// </summary>
    //     ///
    //     /// Corresponding Medthod:
    //     /// CScmpInFixStr
    //     ///
    //     /// <param name="offset">The stream position which to begin read form current stream</param>
    //     /// <param name="len">The number of bytes to read</param>
    //     ///
    //     /// <returns>string</returns>
    public ExtractFixStr(offset: number, len: number) {
        const buf = this.GetBytes(offset, len);
        const result = ByteArrayBuilder.BytesToString(buf);
        return result;
        // byte[] buffer = new byte[len];
        // buffer = GetBytes(offset, len);
        // return Encoding.GetEncoding(Constansts.ENCODING_UTF8).GetString(buffer);
    }

    //     /// <summary>
    //     /// Convert a N9 data to an integer from reply message
    //     /// </summary>
    //     ///
    //     /// Corresponding Medthod:
    //     /// CScmpInN9, default form is N9
    //     ///
    //     /// Example:
    //     /// '@' will be converted 0, A will be converted 1
    //     ///
    //     /// <param name="offset">The stream position which to begin read form current stream</param>
    //     /// <param name="len">The number of bytes to read</param>
    //     ///
    //     /// <returns>integer</returns>
    public ExtractN9(offset: number, len: number) {
        let result = 0;
        // byte[] buffer = new byte[len];
        for (let i = 0; i < len; i++) {
            this.store_Seek(offset + i);
            const b = this.GetByte();
            const r = b & ~this.BIT6;
            if (r > 9) {
                logger.error(
                    `N9 data out of range, data:${this.ToString()}, position:${
                        this.Position
                    }.`
                );
                throw new ComSvrException(
                    ERROR_MSG.RID_COMSERV_ERR_N9DATAOUTOFRANGE
                );
            }

            result = result * 10;
            result += r;
        }
        return result;
    }

    //     /// <summary>
    //     /// Convert a odds value  to an integer from reply message
    //     /// </summary>
    //     ///
    //     /// Stream Position Process
    //     /// No     Ending                 Action(position)                       Remark
    //     /// 1:     non 0-9(+,/,etc)       position-1                             no decimal dight
    //     /// 2:     eos           N/A                                             no decimal dight

    //     /// 3:     '.'                   contine reading
    //     ///                             a) one decimal  digit  (No.1,2)          with decimal dight
    //     ///                             b) two decimal  digit  (No.1,2)          with decimal dight
    //     ///                             c) three decimal digit ( N/A  )          with decimal dight
    //     ///
    //     /// Corresponding Medthod:
    //     /// CScmpInOdds
    //     ///
    //     /// Example:
    //     /// ">AB.CD" will convert to 1234
    //     ///
    //     /// <param name="offset">The stream position which to begin read form current stream</param>
    //     /// <param name="len">The number of bytes to read</param>
    //     ///
    //     /// <returns>integer</returns>
    public ExtractOdds(offset: number) {
        let result = 0;
        let hasDot = false;
        let readOneMoreDigit = false;
        const startWith = this.GetByte(offset);
        if (startWith !== '>'.charCodeAt(0)) {
            logger.error(
                `Odds must started with '>', data:${this.ToString()}, position:${
                    this.Position
                }.`
            );
            throw new ComSvrException(
                ERROR_MSG.RID_COMSERV_ERR_ODDSSTARTFORMATERROR
            );
        }
        while (!this.EOS) {
            const currByte = this.GetByte();
            if (currByte === '.'.charCodeAt(0)) {
                hasDot = true;
                break;
            } else {
                const tmp = currByte & ~this.BIT6;
                if (tmp > 9) {
                    readOneMoreDigit = true;
                    break;
                }
                result = result * 10;
                result += tmp * 1000;
            }
        }
        if (hasDot) {
            let mply = 100;
            while (!this.EOS) {
                const b = this.GetByte();
                if (b === '+'.charCodeAt(0) || b === '/'.charCodeAt(0)) {
                    readOneMoreDigit = true;
                    break;
                } else {
                    const tmp = b & ~this.BIT6;
                    if (tmp > 9) {
                        readOneMoreDigit = true;
                        break;
                    }
                    result += tmp * mply;
                    mply /= 10;
                }
            }
        }
        // Because the length of odds is unsured and should read one byte to end,so we need set position-1
        if (readOneMoreDigit) {
            this.store_Seek(this.store_Position - 1);
            // store.Seek(store.Position - 1, SeekOrigin.Begin);
        }
        return result;
    }

    //     /// <summary>
    //     /// Extract DDMMMYY format to a DateTime value from reply message
    //     /// </summary>
    //     ///
    //     /// Corresponding Medthod:
    //     /// CScmpInDDMMMYY
    //     ///
    //     /// Example:
    //     /// "25DEC81" will convert to Datetime:1981-12-25
    //     ///
    //     /// <param name="offset">The stream position which to begin read form current stream</param>
    //     /// <param name="len">The number of bytes to read</param>
    //     ///
    //     /// <returns>DateTime</returns>
    public ExtractDateFormDDMMMYY(offset: number, len: number): Date {
        // string date_str = ExtractFixStr(offset, len);
        // return ConvertToDateTime(date_str, DateFormatType.DDMMMYY);
        const date_str = this.ExtractFixStr(offset, len);
        return this.ConvertToDateTime(date_str, DateFormatType.DDMMMYY);
    }

    //     /// <summary>
    //     /// To read a set of bits from memorystream(low->high)
    //     /// </summary>
    //     ///
    //     /// Corresponding Medthod:
    //     /// CScmpInBitmap
    //     ///
    //     /// Example:
    //     /// 'A' will return byte array:10000100
    //     ///
    //     /// <param name="offset">The stream position which to begin read form current stream</param>
    //     /// <param name="len">The number of bytes to read</param>
    //     ///
    //     /// <returns>List<byte></returns>
    public ExtractBitmap(offset: number, len: number): Buffer {
        // List < byte > result = new List<byte>();
        const result = [];
        const bytes = this.GetBytes(offset, len);
        for (let j = 0; j < bytes.length; ++j) {
            const b = bytes.readUInt8(j);
            for (let i = 1; i <= 8; i++) {
                const newbyte = (b & (1 << (i - 1))) > 0 ? 1 : 0;
                result.push(newbyte);
            }
        }
        // foreach(var b in bytes)
        // {
        //     for (int i = 1; i <= 8; i++)
        //     {
        //         var newbyte = (b & (1 << i - 1)) > 0 ? 1 : 0;
        //         result.Add((byte)newbyte);
        //     }
        // }
        return Buffer.from(result);
    }

    //     /// <summary>
    //     /// Eextract money data with a start index from reply message
    //     /// </summary>
    //     ///
    //     /// Stream Position Process                                Remark
    //     /// No     Ending   Action(position)
    //     /// 1:    '-'       N/A                                    No decimal
    //     /// 2:    $         position-1                             No decimal ('$','/',etc)
    //     /// 3:    '/'       position-1                             No decimal ('$','/',etc)
    //     /// 4:    eos       N/A                                    No decimal
    //     /// 5:    '.'       contine reading
    //     ///                 a) one decimal digit  (No.1,2,3,4)     One decimal
    //     ///                 b) two decimal digit  (No.1,2,3,4)     One decimal
    //     ///
    //     /// Corresponding Medthod:
    //     /// CScmpInMoney
    //     ///
    //     /// Example:
    //     /// "$12.34" will be converted to 1234
    //     /// "$23.45-" will be converted to -2345
    //     ///
    //     /// <param name="offset">start index</param>
    //     ///
    //     /// <returns>integer</returns>
    public ExtractMoney(offset: number, len = -1) {
        let result = 0;
        let currByte = 0;
        const dp = 2; // 2 decimal point
        const startWith = this.GetByte(offset);
        if (startWith !== Constansts.DOLLAR_SIGN.charCodeAt(0)) {
            logger.error(
                `Money value must started with '$ , data:${this.ToString()}, position:${
                    this.Position
                }.`
            );
            throw new ComSvrException(
                ERROR_MSG.RID_COMSERV_ERR_MONEYSTARTFORMAT
            );
        }
        offset++;

        // reads in digits until decimal point or non-decimal digit is found
        while (!this.EOS) {
            currByte = this.GetByte(offset);
            if (currByte === '.'.charCodeAt(0)) {
                break;
            }
            const tmp = currByte & ~this.BIT6;
            if (tmp > 9) {
                break;
            }
            result *= 10;
            result += tmp * 100;
            offset++;
        }

        // read in 0-2 digits after decimal point
        //  extra 2 digits for FlexiBet will be handled in the next if loop

        if (currByte === '.'.charCodeAt(0)) {
            // skip '.'
            offset++;
            let mply = 10;
            for (let i2 = 0; i2 < dp; i2++) {
                if (this.EOS) {
                    break;
                }
                currByte = this.GetByte(offset);
                const tmp = currByte & ~this.BIT6;
                if (tmp > 9) {
                    // one digit after decimal dot
                    break;
                }
                result += tmp * mply;
                mply /= 10;
                offset++;
            }
        }

        this.store_Seek(offset);
        if (!this.EOS) {
            // check sign
            currByte = this.GetByte(offset);
            if (currByte === '-'.charCodeAt(0)) {
                result = 0 - result;
                offset++;
            } else {
                if (len - dp > 0) {
                    offset++; // 3rd decimal point
                    if (len - dp - 1 > 0) {
                        offset++; // 4rd decimal point
                    }
                }
                // check sign
                currByte = this.GetByte(offset);
                if (currByte === '-'.charCodeAt(0)) {
                    result = 0 - result;
                    offset++;
                }
            }
        }
        this.store_Seek(offset);
        // store.Seek(offset, SeekOrigin.Begin);
        return result;
    }

    //     /// <summary>
    //     /// To extract money data with current position of memorystream from reply message
    //     /// </summary>
    //     ///
    //     /// Corresponding Medthod:
    //     /// CScmpInMoney
    //     ///
    //     /// Example:
    //     /// "$12.34" will be converted to 1234
    //     /// "$23.45-" will be converted to -2345
    //     ///
    //     /// <returns>integer</returns>
    public ExtractMoney_(): number {
        return this.ExtractMoney(this.store_Position);
    }

    //     /// <summary>
    //     //To extract a sequence of hex value from reply message
    //     /// </summary>
    //     ///
    //     /// Corresponding Medthod:
    //     /// 1:CScmpInNF(Bcd6)
    //     ///
    //     /// Example
    //     /// 0x480x470x42(HHB) will be converted to "872"
    //     ///
    //     /// <param name="offset">start index</param>
    //     /// <param name="len">get the byte count</param>
    //     /// <returns>string</returns>
    public ExtractNF(offset: number, len: number): string {
        let result = '';

        for (let i = 0; i < len; i++) {
            let tmp = 0;
            const b = this.GetByte(offset + i); // 0x48
            if (b >= '@'.charCodeAt(0) && b <= 'I'.charCodeAt(0)) {
                // 0-9
                tmp = b & ~this.BIT6; // 0x08
                const s = tmp.toString(16).toUpperCase(); // "8"
                result += s;
            } else if (b >= 'J'.charCodeAt(0) && b <= 'O'.charCodeAt(0)) {
                // A-F
                tmp = b & ~this.BIT6;
                const s = tmp.toString(16).toUpperCase();
                result += s;
            } else {
                logger.error(
                    `NF data out of range, data:${this.ToString()}, position:${
                        this.Position
                    }.`
                );
                throw new ComSvrException(
                    ERROR_MSG.RID_COMSERV_ERR_NFDATAOUTOFRANGE
                );
            }
        }
        return result;
    }

    //     /// <summary>
    //     //To extract a sequence of hex value from reply message
    //     /// </summary>
    //     ///
    //     /// Corresponding Medthod:
    //     /// 1:CScmpInNF(Ascii)
    //     ///
    //     /// Example:
    //     ///             "A"-->0xa0;
    //     //              "AB"->0xAB;
    //     //              "ABCD"--> 0xAB,0xCD;
    //     //              "ABC"-->0xAB,0xC0, and so on.
    //     ///
    //     /// <param name="offset">start index</param>
    //     /// <param name="len">get the byte count</param>
    //     /// <returns>byte[]</returns>
    public ExtractNF_Ascii(offset: number, len: number): Buffer {
        const arr = Buffer.alloc(len);
        let odd = true;
        let index = 0;
        for (let i = 0; i < len; i++) {
            let tmp = 0;

            const b = this.GetByte(offset + i);

            if (b >= '0'.charCodeAt(0) && b <= '9'.charCodeAt(0)) {
                tmp = b - '0'.charCodeAt(0); // convert ascii('3') to number(3), the same as function atoi in C++.
            } else if (b >= 'A'.charCodeAt(0) && b <= 'F'.charCodeAt(0)) {
                tmp = b - 'A'.charCodeAt(0) + 10; // convert ascii('B') to number(0x0B)
            } else {
                logger.error(
                    `NF data out of range, data:${this.ToString()}, position:${
                        this.Position
                    }.`
                );
                throw new ComSvrException(
                    ERROR_MSG.RID_COMSERV_ERR_NFDATAOUTOFRANGE
                );
            }
            //
            if (odd) {
                arr[index] = tmp << 4;
                odd = false;
            } else {
                arr[index] |= tmp;
                index++;
                odd = true;
            }
        }
        return arr;
    }
    //     /// <summary>
    //     //To extract a BIN6 value from reply message
    //     /// </summary>
    //     ///
    //     /// Corresponding Medthod:
    //     /// 1:CScmpInNF(Bin6)
    //     ///
    //     /// Example:
    //     ///             0x40('@')-->0x30('0');
    //     //              0x7f(127)->0x3f(63);
    //     ///
    //     /// <param name="offset">start index</param>
    //     /// <param name="len">must set 1</param>
    //     /// <returns>byte</returns>
    public ExtractNF_BIN6(offset: number): number {
        let result = 0;
        this.store_Seek(offset);
        const b = this.GetByte();
        const r = b & ~this.BIT6;
        if (r > 63) {
            logger.error(
                `NF data out of range, data:${this.ToString()}, position:${
                    this.Position
                }.`
            );
            throw new ComSvrException(
                ERROR_MSG.RID_COMSERV_ERR_NFDATAOUTOFRANGE
            );
        }
        result = r;
        return result;
    }

    //     /// <summary>
    //     /// To extract bonus from reply message, need start index parameter only.
    //     /// </summary>
    //     ///
    //     /// Stream Position Process
    //     /// No     Ending        Action(position)                       Remark
    //     /// 1:     non 0-9       position-1                             no decimal dight
    //     /// 2:     eos           N/A                                    no decimal dight

    //     /// 3:    '.'           contine reading
    //     ///                     a) one decimal digit  (No.1,2)          with decimal dight
    //     ///                     b) two decimal digit  (  N/A )          with decimal dight
    //     ///
    //     /// Corresponding Medthod:
    //     /// 1:CScmpInBonus
    //     ///
    //     /// Example
    //     /// AB.CD -> 12.34
    //     ///
    //     /// <param name="offset">start index</param>
    //     /// <returns>long</returns>
    public ExtractBonus(offset: number): number {
        let result = 0;
        let readOneMoreDigit = false;
        // reads in digits until decimal point or non-decimal digit is found
        let i = 0;
        while (!this.EOS) {
            const currByte = this.GetByte(offset + i);
            if (currByte === '.'.charCodeAt(0)) {
                break;
            }
            const tmp = currByte & ~this.BIT6;
            if (tmp > 9) {
                readOneMoreDigit = true;
                break;
            }
            result *= 10;
            result += tmp * 100;
            i++;
        }
        // read in 0-2 digits after decimal point
        //  extra 2 digits for FlexiBet will be handled in the next if loop
        const btDot = this.GetByte(offset + i);
        if (btDot === '.'.charCodeAt(0)) {
            let mply = 10;
            i++;
            const dp = 2; //  2 decimal point
            for (let i2 = 0; i2 < dp; i2++) {
                if (this.EOS) {
                    break;
                }
                const b2 = this.GetByte(offset + i);
                const tmp = b2 & ~this.BIT6;
                if (tmp > 9) {
                    // one decimal
                    readOneMoreDigit = true;
                    break;
                }
                result += tmp * mply;
                mply /= 10;
                i++;
            }
        }
        // Because the length of bonus is unsured and should read one byte to end,so we need set position-1
        if (readOneMoreDigit) {
            this.store_Seek(this.store_Position - 1);
        }
        return result;
    }

    //     /// <summary>
    //     /// Extract an int value from reply message, such as pay count
    //     /// </summary>
    //     ///
    //     /// Set BIT6 off for every byte
    //     ///
    //     /// <returns>int</returns>
    public ExtractBcdInt(): number {
        let result = 0;
        while (true) {
            let b = this.GetByte();
            b = b & ~this.BIT6;
            if (b > 9 || b < 0) {
                break;
            }

            result *= 10;
            result += b;
        }

        this.store_Seek(this.store_Position - 1);
        return result;
    }

    /// <summary>
    /// Look for a character behind the offset position
    /// </summary>
    ///
    /// <param name="offset">start index</param>
    ///
    /// <returns>int, the position the byte at start from offset, if return -1 means found nothing</returns>
    public ExtractFindByte(offset: number, find: number): number {
        let result = -1;
        const storePos = this.Position;

        while (!this.EOS) {
            const b = this.GetByte();
            if (b === find) {
                result = this.Position - offset - 1;
                break;
            }
        }

        this.store_Seek(storePos);
        return result;
    }
    // endregion

    // region 3: Interaction
    /// <summary>
    /// Clear all content from the builder
    /// </summary>
    public Clear() {
        // store.Close();
        // store.Dispose();
        this.store = new BufferBuilder(0x1000);
    }
    /// <summary>
    /// Rewind the builder ready to read data
    /// </summary>
    public Rewind() {
        this.store_Seek(0);
    }

    /// <summary>
    /// Returns the builder as an array of bytes
    /// </summary>
    /// <returns></returns>
    public ToArray(): Buffer {
        return this.store.get();
    }
    // endregion

    ConvertToN9(str: string): string {
        let result = '';
        const lst: number[] = [];

        for (let i = 0; i < str.length; ++i) {
            const data = str[i];
            if (data >= '0' && data <= '9') {
                const b = (parseInt(data, 10) - parseInt('0', 10)) | this.BIT6;
                lst.push(b);
            } else {
                logger.error(`N9 data out of range, data:${str}`);
                throw new ComSvrException(
                    ERROR_MSG.RID_COMSERV_ERR_N9DATAOUTOFRANGE
                );
            }
        }
        result = ByteArrayBuilder.BytesToString(lst);
        return result;
    }

    // // endregion

    // region Overrides
    /// <summary>
    /// Returns a text based (Base64) string version of the current content
    /// </summary>
    /// <returns></returns>
    public ToString(): string {
        return this.store.get().toString();
    }
    // endregion

    // // region Private Methods 可能需要修正！！！**********************************************
    private ConvertToDateTime(
        dtstr: string,
        dtFormat = DateFormatType.DDMMMYY
    ): Date {
        let result: Date;
        // Initializes a new en-us culture info
        // CultureInfo culture = new CultureInfo("en-US");
        switch (dtFormat) {
            // case DateFormatType.YY:
            //    dt_value = dt.ToString("yy");
            //    break;
            case DateFormatType.DDMMMYY:
                result = new Date(dtstr);
                // result = DateTime.ParseExact(dtstr, "ddMMMyy", culture);
                break;
            // case DateFormatType.DD_MMM_YY:
            //    dt_value = dt.ToString("dd_MMM_yy").ToUpper();
            //    break;
            // case DateFormatType.DD_MMM:
            //    dt_value = dt.ToString("dd_MMM").ToUpper();
            //    break;
            // case DateFormatType.DDMMYY:
            //    dt_value = dt.ToString("ddMMyy");
            //    break;
            // case DateFormatType.DD_MM_YY:
            //    dt_value = dt.ToString("dd_MM_yy");
            //    break;
            // case DateFormatType.HHMM:
            //    dt_value = dt.ToString("hhmm");
            //    break;

            default:
                result = new Date(dtstr);
                // result = DateTime.ParseExact(dtstr, "ddMMMyy", culture);
                break;
        }
        return result;
    }

    Append(b: number | Buffer | string | boolean); // Append(byte b),Append(byte[] b)
    Append(str: string, n9: boolean); // Append(string str, bool n9)
    Append(str: string, len: number, n9: boolean);
    public Append(b?, b1?, b2?): void {
        const btypestr = typeof b;
        const b1typestr = typeof b1;
        const b2typestr = typeof b2;

        if (
            btypestr === 'string' &&
            b1typestr === 'number' &&
            b2typestr === 'boolean'
        ) {
            let str = b;
            const len = b1;
            const n9 = b2;
            while (str.length < len) {
                str = '0' + str;
            }
            if (n9) {
                str = this.ConvertToN9(str);
            }
            this.Append(str);
        } else if (btypestr === 'string' && b1typestr === 'boolean') {
            this.Append(b, b.length, b1);
        } else if (btypestr === 'number') {
            this.store_AppendByte(b);
        } else if (btypestr === 'object') {
            this.AddBytes(b);
        } else if (btypestr === 'string') {
            this.store_AppendString(b);
        } else if (btypestr === 'boolean') {
            this.store_AppendByte(b ? this.streamTrue : this.streamFalse);
        }
    }

    //     /// <summary>
    //     /// Add a string of raw bytes to the store
    //     /// </summary>
    //     /// <param name="b"></param>
    private AddBytes(b: Buffer) {
        this.store_AppendBuffer(b);
    }

    CheckSteam(): void;
    CheckSteam(offset: number);
    public CheckSteam(b?) {
        const btypestr = typeof b;
        if (btypestr === 'number') {
            if (this.store_Position > this.store.length) {
                logger.error(
                    `Argument offset is over stream length, data:${this.ToString()}, position:${
                        this.Position
                    }.`
                );
                throw new ComSvrException(ERROR_MSG.RID_SYS_ERR_EXCEPTION);
            }
            if (this.store_Position !== b) {
                logger.error(
                    `Argument offset is not equal MemoryStream position, data:${this.ToString()}, position:${
                        this.Position
                    }.`
                );
                throw new ComSvrException(ERROR_MSG.RID_SYS_ERR_EXCEPTION);
            }
        } else {
            if (this.store_Position > this.store.length) {
                logger.error(
                    `Argument offset is over stream length, data:${this.ToString()}, position:${
                        this.Position
                    }.`
                );
                throw new ComSvrException(ERROR_MSG.RID_SYS_ERR_EXCEPTION);
            }
        }
    }
    // // endregion

    // // region IDisposable Implememntation
    //     /// <summary>
    //     /// Dispose of this builder and it's resources
    //     /// </summary>
    //     public void Dispose()
    // {
    //     if (store != null) {
    //         store.Close();
    //         store.Dispose();
    //     }
    // }
    // endregion
}
