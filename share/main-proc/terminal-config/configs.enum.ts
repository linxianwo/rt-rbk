export enum Configs {
    Enabled = 'ENABLED',
    Disabled = 'DISABLED',
    Mode_OL = 'ONLINE',
    Mode_TR = 'TRAINING',
    TermType = 'NEW KIOSK',
    InfoSrc_WS_CMC = 'WS CMC',
    InfoSrc_WS_FO = 'WS FO',
    InfoSrc_INFO_CMC = 'INFO CMC',
    InfoSrc_INFO_FO = 'INFO FO',
    UBC_MODE_LOC = 'UBC LOCAL',
    UBC_MODE_REM = 'UBC REMOTE',
    NETWORK_WIFI = 'NETWORK WIFI',
    NETWORK_LINE = 'NETWORK LINE',
    NETWORK_4G = 'NETWORK 4G',
    ENV_PROD = 'PROD',
    ENV_UAT = 'UAT',
}

export enum RouteSwitcher {
    WebServer = 0,
    InfoServer,
}
