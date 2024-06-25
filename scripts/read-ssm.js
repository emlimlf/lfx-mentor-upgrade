const AWS = require('aws-sdk');

// @ts-check

/**
 * @param {string[]} variables
 * @param {string | undefined} stage
 * @param {string} region
 * @returns {Promise<{ [key:string]: string}>}
 */
function retrieveSSMValues(variables, stage, region) {
  return requestSSMParameters(variables, stage, region)
    .then(result => {
      const parameters = result.Parameters;
      const error = result.$response.error;
      if (error !== null) {
        throw new Error(`Couldn't retrieve SSM parameters from AWS with error ${error}`);
      }
      const params = createParameterMap(parameters, stage);
      variables.forEach(variable => {
        if (params[variable] === undefined) {
          const name = stage === undefined ? variable : `${variable}-${stage}`;
          throw new Error(name);
        }
      });
      console.log(`Retrieved SSM parameters: ${JSON.stringify(params)}`);
      return params;
    });
}

/**
 * @param {string[]} variables
 * @param {string | undefined} stage
 * @param {string} region
 * @returns {Promise<AWS.SSM.GetParametersResult>}
 */
  function requestSSMParameters(variables, stage, region) {
  const ssm = new AWS.SSM({ region: region });

  const names = stage == undefined ? variables : variables.map(variable => `${variable}-${stage}`);
  const ps = {
    Names: names,
    WithDecryption: true
  };

  return ssm.getParameters(ps).promise();
}

/**
 * @param {AWS.SSM.Parameter[]} parameters
 * @param {string | undefined} stage
 * @returns {{[key:string]: string}}
 */
function createParameterMap(parameters, stage) {
  const params = parameters
    .filter(param => stage === undefined || param.Name.endsWith(`-${stage}`))
    .map(param => {
      const name = nameWithoutStage(param.Name, stage);
      const output = {};
      output[name] = param.Value;
      return output;
    })
    .reduce((prev, current) => {
      return { ...prev, ...current };
    }, {});
  return params;
}

/**
 * @param {string} name
 * @param {string | undefined} stage
 */
function nameWithoutStage(name, stage) {
  if (stage === undefined) {
    return name;
  }
  return name.slice(0, name.length - (stage.length + 1));
}

module.exports = retrieveSSMValues;
