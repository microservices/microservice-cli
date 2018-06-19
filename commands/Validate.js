const validator = require('../schema/schema');
const Microservice = require('../src/Microservice');
const {dataTypes} = require('./utils');

/**
 * Used for validating a `microservice.yml`.
 */
class Validate {
  /**
   * Builds a {@link Validate}
   */
  constructor() {
    this._valid = JSON.parse(validator());
  }

  /**
   * Validates the structure of the `microservice.yml`. Also checks to make sure specific values ane valid based on the
   * other parts of the `yaml`. For example, if a command interfaces with http, there must be a run command for the http service.
   *
   * @return {String} Stringified results of the validation
   */
  structure() {
    if (!this._valid.valid) {
      return JSON.stringify(this._valid, null, 2);
    }
    new Microservice().commands.forEach((c) => {
      if (c.format !== null && c.run === null) {
        // this._validateExecCommandFormat(c);
      } else if (c.http !== null) {
        this._validateHttpCommandFormat(c);
      } else if (c.run !== null) {
        this._validStreamCommandFormat(c);
      }
    });
    return JSON.stringify(this._valid, null, 2);
  }

  /**
   * TODO
   * @private
   */
  _validateHttpCommandFormat() {

  }

  /**
   * TODO need to check format too
   * @private
   */
  _validStreamCommandFormat() {

  }

  /**
   * Verifies the types of given arguments based off of the given {@link Command}.
   *
   * @param {Command} command The given {@link Command}
   * @param {Object} args The given argument mapping
   */
  static verifyArgumentTypes(command, args) {
    command.arguments.forEach((a) => {
      if (Object.keys(args).includes(a.name)) {
        if (!dataTypes[a.type](args[a.name])) {
          throw 'TODO';
        }
      }
    });
  }

  // /**
  //  * TODO
  //  * @param command
  //  * @param args
  //  */
  // static verifyArgumentPatter(command, args) {
  //
  // }
  //
  // /**
  //  *
  //  * @param command
  //  * @param args
  //  */
  // static verifiyArgumentEnum(command, args) {
  //
  // }

  /**
   * Verifies the output type.
   *
   * @param {Command} command The given {@link Command}
   * @param {String} output The given output
   */
  static verifyOutputType(command, output) {
    if (!dataTypes[command.output.type](output)) {
      throw 'Not correct output type'; // TODO message
    }
  }
}

module.exports = Validate;
