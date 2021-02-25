import { ResponseObject, ResponseObjectCode } from '../models/response-common';
export class OperationError extends Error {
    code: number;
    constructor(code: number, msg: string = '') {
        super();
        this.code = code;
        this.message = msg;
    }
}
