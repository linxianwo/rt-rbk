import { KioskServer } from '../share/utils/server';
import { error } from '../share/utils/middleware/err-handler';
import { responseTime } from '../share/utils/middleware/response-time';
import { racingApp } from './routes/racing';
import { markSixApp } from './routes/marksix';
import { randomApp } from './routes/random';
import { depositApp } from './routes/deposit';
import { BetEngineAPI } from '../share/protocols/kiosk-api-event';
import { footballApp } from './routes/football';

const server = new KioskServer();

server.use(responseTime.tick());

server.addAppApi('/', (req, res) => {
    console.log('/ map');
    res.setHeader('Content-type', 'text/html');
    res.send('<h1>Welcome Betting Engine Server</h1>');
});

server.appUse(BetEngineAPI.BET_ENGINE_RACING_APP_ENTRY, racingApp);
server.appUse(BetEngineAPI.BET_ENGINE_MARKSIX_APP_ENTRY, markSixApp);
server.appUse(BetEngineAPI.BET_ENGINE_RANDOM_APP_ENTRY, randomApp);
server.appUse(BetEngineAPI.BET_ENGINE_DEPOSIT_APP_ENTRY, depositApp);
server.appUse(BetEngineAPI.BET_ENGINE_FOOTBALL_APP_ENTRY, footballApp);

server.use(error.log());

export { server };
