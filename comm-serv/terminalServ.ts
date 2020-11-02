import {
    RPC4Cplus,
    sTerminalConfig,
} from '../share/models/comm-serv/RPC4Cplus';
import { terminalConfig } from '../share/main-proc/terminal-config/terminal-config';

export class TerminalServ {
    public static readonly Instance: TerminalServ = new TerminalServ();

    // private bool training = false;
    // add below
    private rpcTermConfig = new sTerminalConfig();

    // TODO: TerminalServ distribute to Ricky
    constructor() {
        this.Init();
        console.log('CommServ ctor');
    }

    // / <summary>
    // / Init communicationServ for local/training mode
    // / </summary>
    public Init(): boolean {
        const config = terminalConfig;

        // training = true;
        // string str = "10.202.1.18";
        this.rpcTermConfig.strIp = config.configs.terminalFunction.ipAddress; // "10.202.1.18";
        this.rpcTermConfig.nWindow = parseInt(
            config.configs.terminalFunction.windowNumber,
            10
        ); // 18;
        // this.rpcTermConfig.nPhantomBoothNum = parseInt(config.configs.terminalFunction.phantomGroup); // 0;
        this.rpcTermConfig.nCentreNum = parseInt(
            config.configs.terminalFunction.branchNumber,
            10
        ); // 882;
        this.rpcTermConfig.nTermId = parseInt(
            config.configs.terminalFunction.hardwareId,
            10
        ); // 0x0E3E;
        this.rpcTermConfig.nTermMode = parseInt(
            config.configs.terminalFunction.terminalMode,
            10
        ); // 1;
        this.rpcTermConfig.nTermType = 0; // always SVT mode
        this.rpcTermConfig.nRetryCount = 0; // it's not useable. set to zero this case.

        // this.rpcTermConfig.fnIncMSN = new RPC4Cplus.fn_incMSN(IncMSN);
        // this.rpcTermConfig.fnMSN = new RPC4Cplus.fn_MSN(MSN);
        // this.rpcTermConfig.fnPostBroadcastMSG = new RPC4Cplus.fn_BroadcastMSG(PostBdMsg);
        // this.rpcTermConfig.fnIncRetryCount = new RPC4Cplus.fn_incRetryCount(IncRetryCount);

        // //int size = Marshal.SizeOf(rpcTermConfig);
        // //IntPtr intPtr = Marshal.AllocHGlobal(size);
        // //Marshal.StructureToPtr(rpcTermConfig, intPtr, true);
        // return Convert.ToBoolean(CommonRPC.InitRPC(ref rpcTermConfig));
        return true;
    }

    /// <summary>
    /// Init communicationServ for online mode
    /// </summary>
    /// <param name="window">window number</param>
    /// <param name="ip">ip address</param>
    // public bool Init(uint window, string ip) {
    //     return false;
    // }

    /// <summary>
    /// reset communicationServ
    /// </summary>
    public reset() {
        // call rpc reset interface
    }
}
