/* eslint-disable no-unused-vars */
/* eslint-disable import/no-extraneous-dependencies */
import httpHttpsAgent from 'http-https-agent';

const getAgent = httpHttpsAgent({
  keepAlive: true
});

const httpsAgent = getAgent('https://google.com');
const httpAgent = getAgent('http://google.com');
