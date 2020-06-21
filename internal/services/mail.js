const https = require('https');

const getEnv = function getEnv(name, msg = '') {
    if (!name) throw Error("Environment variable can't be empty.");
    if (!(name in process.env) || process.env[name] === '')
      throw Error(msg || `${name} is not set.`);
  
    return process.env[name];
  };
  

module.exports = async function email(to, subject, message, charset = 'UTF-8') {
  const pid = getEnv('AWS_LAMBDA_FUNCTION_NAME')
  const apiKey = getEnv('DETA_API_KEY') // DETA_PROJECT_KEY ?

  const toAddresses = [];
  if (typeof to === 'string') toAddresses.push(to);
  else if (to instanceof Array) toAddresses.push(...to);
  else throw Error("'to' argument is not a string or an array");

  const data = {
    'to' : toAddresses,
    'subject': subject,
    'message': message,
    'charset': charset
  };

  const headers = {
    'X-API-Key': apiKey  
  };

  return new Promise((resolve, reject)=> {
    const respData = [];

    const options = {
      hostname: getEnv('DETA_MAILER_URL').split("://")[1],
      port: 443,
      path : `/mail/${pid}`,
      method: 'POST',
      headers,
    }; 

    const req = https.request(options, (res) => {
      res.on('data', (chunk) => {
        respData.push(chunk);
      });

      res.on('end', () => {
        var resText = Buffer.concat(respData).toString();
        if (res.statusCode !== 200) {
          throw Error(resText)
        }
        resolve(resText);
      });

      res.on('error', function(err){
        throw Error(err);
      });
    });

    req.on('error', function(err){
      throw Error(err);
    });

    req.write(JSON.stringify(data));
    req.end();
  });  
};