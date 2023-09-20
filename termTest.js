// const { app } = require ('electron').remote;
// const atPath = app.getPath ('desktop');
// const { spawn } = require ('child_process');
// let openTerminalAtPath = spawn ('open', [ '-a', 'Terminal', atPath ]);
// openTerminalAtPath.on ('error', (err) => { console.log (err); });
const cp = require('child_process');
cp.exec('open -a Terminal ' + process.env.HOME);