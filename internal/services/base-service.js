const fetchModule = require("../fetch");
const https = require("https");
const { FetchError } = require("node-fetch");
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
    // const { fetch: _fetch } = fetchModule;

    // const request = {
    //   method,
    //   headers: this.headers,
    // };

    // if (method !== 'GET') request['body'] = JSON.stringify(payload);
    // request['agent'] = this._agent;

    // console.log('base url:', this._baseURL);
    // console.log('route:', route);

    // var response = {};
    // try {
    //   response = await _fetch(`${this._baseURL}${route}`, request);
    // } catch (e){
    //   // retry on fetchError
    //   if (e instanceof FetchError){
    //     response = await _fetch(`${this._baseURL}${route}`, request);
    //   } else{
    //     throw e
    //   }
    // }
    
    // const status = response.status;
    // if (status === 401){
    //   throw new Error("Unauthorized");
    // }

    // const data = await response.json();
    // return { status, response: data };
    const options = {
      method,
      hostname: this._host,
      path: `${this._baseRoute}${route}`,
      headers: this.headers,
    };

    if (method !== 'GET') options['body'] = JSON.stringify(payload);
    options['agent'] = this._agent;
    const response = await this.doRequest(options);
    return response;

  }

  doRequest(options) {
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
  
      req.end();
  });
  }


}

module.exports = BaseService;
