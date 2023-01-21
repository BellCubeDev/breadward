/** Serves a basic web server for the bot
 *  Nothing too complicated - just a basic webpage with some information about the bot and maybe a log?
*/

import { stdoutContents } from './index.js';

import http from 'http';

http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write('<h1>Breadward Log</h1> <pre>');
    res.write(stdoutContents.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
    res.write('</pre>');
    res.end();
}).listen(80, '0.0.0.0')

console.log('Server started');


function keepAlive() {
    const request = http.request('http://breadward.glitch.me', {}, () => {
        console.log('Ping sent');
        setTimeout(keepAlive, 60000);
    });
    request.end();
}
keepAlive();
