// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
const yaml = require('js-yaml');
const fs = require('fs');

/**
 * Matches anything beggining with FLAG_ and followed by alphanumeric characters or '_'.
 * @param {string} name - The name of the flag.
 * @returns {boolean} -
 */
function isValidFlagName(name) {
  const flagMatcher = /^(FLAG_)[\w|_]+/;
  return flagMatcher.test(name);
}

/**
 * Determines whether a value is a boolean.
 * @param {*} value - The value to test.
 * @returns {boolean}
 */
function isBoolean(value) {
  return typeof value === typeof true || value === 'true' || value === 'false';
}

/**
 * Matches anything beggining with FLAG_ and followed by alphanumeric characters or '_'.
 * @param {string} name - The name of the flag.
 * @param {*} value - The value of the flag.
 * @returns {boolean}
 */
function isValidFlag(name, value) {
  return isValidFlagName(name) && isBoolean(value);
}

/**
 * Parses a webpack environment object for true/false feature flag pairs.
 * @param {*} env - The webpack environment object, containing --env.* parameters passed via the command line.
 * @returns { [key: string]: boolean} - Returns a key value dictionary.
 */
function getEnvironmentFlags(env) {
  if (env === undefined || env === null) {
    return {};
  }
  return Object.keys(env)
    .filter(key => isValidFlag(key, env[key])) // Check property matches pattern, and is boolean
    .reduce((currentValue, key) => {
      currentValue[key] = env[key] === 'true' ? 'true' : 'false';
      return currentValue;
    }, {});
}

/**
 * Parses a 'flags' yaml file for true/false feature flag pairs.
 * @param {string} filename - The file to parse.
 * @throws {Error} - Throws an exception if the file is invalidly formatted.
 * @returns { [key: string]: boolean} - Returns a key value dictionary.
 */
function getYamlFileFlags(filename) {
  try {
    const file = fs.readFileSync(filename, 'utf8');
    const doc = yaml.safeLoad(file);
    // Check property matches pattern, and is boolean
    Object.keys(doc).forEach(key => {
      if (!isValidFlagName(key)) {
        const text = `In file '${filename}', '${key}' does not match pattern FLAG_* and contain only alphanumeric characters or '_'.`;
        throw Error(text);
      }
      if (!isBoolean(doc[key])) {
        const text = `In file '${filename}', '${key}' does not have true or false value.`;
        throw Error(text);
      }
    });

    return Object.keys(doc)
      .filter(key => isValidFlag(key, doc[key]))
      .reduce((currentValue, key) => {
        currentValue[key] = JSON.stringify(doc[key]);
        return currentValue;
      }, {});
  } catch (e) {
    throw Error(`In file '${filename}', there was a yaml formatting error:\n${e.toString()}`);
  }
}

/**
 * Combines two sets of flags.
 * @param {[key: string]: boolean} baseFlags - The list of base flags and their values.
 * @param {[key: string]: boolean} overrideFlags - The list of override flags.
 * Each flag must be in the original base configuration
 * @throws {Error} - Throws an exception if an override flag isn't in the base flag list.
 * @returns {[key: string]: boolean} - A combined flag list.
 */
function combineFlags(baseFlags, overrideFlags) {
  Object.keys(overrideFlags).forEach(key => {
    if (baseFlags[key] === undefined) {
      throw Error(`Override flag ${key} doesn't exist in base configuration.`);
    }
  });
  return {
    ...baseFlags,
    ...overrideFlags
  };
}

/**
 * Parses flags from the environment matching the pattern 'FLAG_*'
 * @param {string} flagsFilename - The name of the flags.yml file.
 * @param {Object} env - The webpack environment
 * @returns {string: boolean} - A list of stringified
 */
function generateFlags(flagsFilename, env) {
  const fileFlags = getYamlFileFlags(flagsFilename);
  const environmentFlags = getEnvironmentFlags(env);
  return combineFlags(fileFlags, environmentFlags);
}

module.exports = generateFlags;
