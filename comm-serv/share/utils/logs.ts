import * as log4js from 'log4js';
import * as fs from 'fs';
import * as _ from 'lodash';
import * as path from 'path';
import {
    main_config,
    hw_config,
    comm_config,
    info_config,
    renderer_config,
    beteng_config,
    ubc_config,
    broadcast_config,
} from './log-config';
import {
    MODULE_TYPE,
    CommonModule,
} from '../../share/main-proc/processes/module-type';
/**
 * 第一种：
 * configure方法为配置log4js对象，内部有levels、appenders、categories三个属性
 * levels:
 *         配置日志的输出级别,共ALL<TRACE<DEBUG<INFO<WARN<ERROR<FATAL<MARK<OFF八个级别,default level is OFF
 *         只有大于等于日志配置级别的信息才能输出出来，可以通过category来有效的控制日志输出级别
 * appenders:
 *         配置文件的输出源，一般日志输出type共有console、file、dateFile三种
 *         console:普通的控制台输出
 *         file:输出到文件内，以文件名-文件大小-备份文件个数的形式rolling生成文件
 *         dateFile:输出到文件内，以pattern属性的时间格式，以时间的生成文件
 * replaceConsole:
 *         是否替换控制台输出，当代码出现console.log，表示以日志type=console的形式输出
 *
 */
export class Logger {
    public processType = MODULE_TYPE.MODULE_NONE;

    constructor() {
        this.getProcessType();
        // need to clean the log files, the config setting is for service.
        if (this.processType === MODULE_TYPE.MODULE_MAIN) {
            this.cleanup();
        }
    }

    public configure(defaultConfig = main_config) {
        log4js.configure(defaultConfig);
    }

    public getConfigByProcType() {
        let config = main_config;

        switch (this.processType) {
            case MODULE_TYPE.MODULE_MAIN:
                config = main_config;
                break;
            case MODULE_TYPE.MODULE_HW:
                config = hw_config;
                break;
            case MODULE_TYPE.MODULE_COMMSERV:
                config = comm_config;
                break;
            case MODULE_TYPE.MODULE_INFO:
                config = info_config;
                break;
            case MODULE_TYPE.MODULE_RENDER:
                config = renderer_config;
                break;
            case MODULE_TYPE.MODULE_BETENG:
                config = beteng_config;
                break;
            case MODULE_TYPE.MODULE_UBC:
                config = ubc_config;
                break;
            case MODULE_TYPE.MODULE_BROADCAST:
                config = broadcast_config;
                break;
            default:
                break;
        }

        return config;
    }

    public getProcessType() {
        this.processType = CommonModule.getProcessType();
    }

    public setConfigForModule() {
        this.configure(this.getConfigByProcType());
    }

    getLogger(loggerName: string = 'default') {
        this.setConfigForModule();
        return log4js.getLogger(loggerName);
    }

    public getExistingFiles(config) {
        try {
            const fileObject = path.parse(config.appenders.dateFile.filename);

            const files = fs.readdirSync(fileObject.dir);

            const existingFileDetails = _.compact(
                _.map(files, (file: string) => {
                    const filePath = path.join(fileObject.dir, file);
                    const stat = fs.statSync(filePath);
                    console.log(file + stat);
                    return { file: filePath, timeStamp: stat.birthtimeMs };
                })
            );

            return _.sortBy(existingFileDetails, (n) => -n.timeStamp);
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    cleanup() {
        const configs = [
            main_config,
            hw_config,
            comm_config,
            info_config,
            beteng_config,
            renderer_config,
            ubc_config,
            broadcast_config,
        ];
        try {
            configs.forEach((config) => {
                const keep = config.appenders.dateFile.daysToKeep;
                let fileObj = this.getExistingFiles(config);
                fileObj = fileObj.sort((a, b) => a.timeStamp - b.timeStamp);

                fileObj = _.take(fileObj, fileObj.length - keep);

                fileObj.forEach((val) => {
                    fs.unlinkSync(val.file);
                });
            });
        } catch (error) {
            console.log(error);
        }
    }
}

const loggerInstance = new Logger().getLogger();

const loggerFatal = loggerInstance.fatal;
loggerInstance.fatal = function (msg) {
    if (process && process.send) {
        process.send(msg);
    }
    loggerFatal.call(loggerInstance, msg);
};

export const logger = loggerInstance;
