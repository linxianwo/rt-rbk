export enum MODULE_TYPE { // 模块类型
    MODULE_NONE,
    MODULE_MAIN,
    MODULE_RENDER,
    MODULE_HW,
    MODULE_COMMSERV,
    MODULE_INFO,
    MODULE_BETENG,
    MODULE_UBC,
    MODULE_BROADCAST,
}

export class CommonModule {
    static getProcessType(): MODULE_TYPE {
        let processType = MODULE_TYPE.MODULE_NONE;
        console.log('getPortByProc: ' + process.argv);

        for (const arg of process.argv) {
            if (arg.indexOf('ele-main') !== -1) {
                processType = MODULE_TYPE.MODULE_MAIN;
                break;
            } else if (arg.indexOf('hw-serv') !== -1) {
                processType = MODULE_TYPE.MODULE_HW;
                break;
            } else if (arg.indexOf('comm-serv') !== -1) {
                processType = MODULE_TYPE.MODULE_COMMSERV;
                break;
            } else if (arg.indexOf('info-serv') !== -1) {
                processType = MODULE_TYPE.MODULE_INFO;
                break;
            } else if (arg.indexOf('renderer') !== -1) {
                processType = MODULE_TYPE.MODULE_RENDER;
                break;
            } else if (arg.indexOf('beteng-serv') !== -1) {
                processType = MODULE_TYPE.MODULE_BETENG;
                break;
            } else if (arg.indexOf('ubc-serv') !== -1) {
                processType = MODULE_TYPE.MODULE_UBC;
                break;
            } else if (arg.indexOf('broadcast-serv') !== -1) {
                processType = MODULE_TYPE.MODULE_BROADCAST;
                break;
            } else {
                continue;
            }
        }

        console.log('the log process type: ' + processType);

        return processType;
    }
}
