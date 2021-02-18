
const https = require("https");

const { resolve } = require("path");
const { rejects } = require("assert");

class BaseService {
  constructor(deta) {
    this._getDeta = () => deta;
    const options = { keepAlive: true };
    const agent = new https.Agent(options);
    this._getAgent = () => agent;
  }

  get _agent() {
    return this._getAgent();
  }

  get _deta() {
    return this._getDeta();
  }

  get _baseURL() {
    const { projectId, host } = this._deta.config;
    return `https://${host}/${projectId}`;
  }

  
  get _host() {
    const { host } = this._deta.config;
    return `${host}`;
  }

  get _baseRoute() {
    const { projectId } = this._deta.config;
    return `/v1/${projectId}`;
  }


  get headers() {
    const { projectKey, authToken, authType } = this._deta.config;

    if (authType === "api-key") {
      return {
        "X-API-Key": projectKey,
        "Content-Type": "application/json",
      };
    }
    return {
      Authorization: authToken,
      "Content-Type": "application/json",
    };
  }

  async request(route, payload, method = 'GET') {

    const options = {
      method,
      hostname: this._host,
      path: `${this._baseRoute}${route}`,
      headers: this.headers,
    };
    let data = {};
    if (method !== 'GET') data = JSON.stringify(payload);
    options['agent'] = this._agent;
    const response = await this.doRequest(options, data);
    return response;

  }

  doRequest(options, data) {
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        res.setEncoding('utf8');
        let responseBody = '';
        const status = res.statusCode;
        
        res.on('data', (chunk) => {
          responseBody += chunk;
        });
  
        res.on('end', () => {
          resolve({status, response: JSON.parse(responseBody)});
        });
      });
  
      req.on('error', (err) => {
        reject(err);
      });
      if (options['method'] !== 'GET') {
        req.write(data);
      }
      req.end();
  });
  }


}

module.exports = BaseService;
