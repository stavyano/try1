import {Agent as HttpAgent} from 'http';
import {Agent as HttpsAgent} from 'https';

import startsWith from 'lodash.startswith';

module.exports = opts => {
  const httpAgent = new HttpAgent(opts);
  const httpsAgent = new HttpsAgent(opts);

  return url => startsWith(url, 'https') ? httpsAgent : httpAgent;
};
