import { PoolSymbol } from '../../../models/comm-serv/Racing/PoolType';
import { PoolTypeStr } from '../../../models/render/poolTypeStr';

export const poolTypeMapPoolStr = (poolType: string): string => {
    // by Ricky, maybe impact by fix 166433.
    switch (poolType.toUpperCase()) {
        case 'TRIO':
            return 'TRI';
        case 'ALUP':
            return 'Allup';
        case 'IWN':
            return 'IWIN';
        default:
            return poolType;
    }
};

export const infoServerPoolStrMapPoolStr = (
    infoServerPoolStr: string
): string => {
    let poolStr = '';
    Object.keys(PoolTypeStr).forEach((key) => {
        if (PoolTypeStr[key] === infoServerPoolStr) {
            poolStr = key;
        }
    });
    return poolStr;
};

export const poolStrMapPoolType = (poolStr: string): string => {
    switch (poolStr) {
        case 'TRI':
            return 'TRIO';
        case 'Allup':
            return 'ALUP';
        default:
            return poolStr;
    }
};

export const getPoolBySymbol = (poolS: string): string => {
    let pool = '';
    Object.keys(PoolSymbol).forEach((key) => {
        if (PoolSymbol[key] === poolS) {
            pool = key;
        }
    });
    return pool;
};
