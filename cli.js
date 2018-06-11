#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const program = require('commander');
const validate = require('./commands/validate');
const { build, listToObject } = require('./commands/utils');
const Microservice = require('./src/Microservice');
const Exec = require('./commands/Exec');

program
  .version('0.0.1');

program
  .command('validate <path>')
  .description('Use to validate a microservice.yml')
  .action((path) => process.stdout.write(validate(path)));

function appender(xs) {
  xs = xs || [];
  return function (x) {
    xs.push(x);
    return xs;
  }
}

program
  .command('exec <command> [args...]')
  .option('-e --environment <env>', '', appender(), [])
  .description('TODO') // TODO
  .action(async (command, args, env) => {
    if ((!fs.existsSync(path.join(process.cwd(), 'microservice.yml'))) || !fs.existsSync(path.join(process.cwd(), 'Dockerfile'))) {
      // TODO message
      process.exit(1)
    }
    envs = env.environment;
    if (command.includes(':')) { // what if no args?
      args.unshift(command);
      command = 'entrypoint';
    }
    try {
      const microservice = new Microservice(path.join(process.cwd(), 'microservice.yml'));
      const uuid = await build();
      const argsObj = listToObject(args, ':', 'Unable to parse args');
      const envObj = listToObject(envs, '=', 'Unable to parse envs');
      const e = new Exec(uuid, microservice, argsObj, envObj);
      await e.executeCommand(command);
    } catch (error) {
      if (error.spinner) {
        error.spinner.fail(error.message);
      } else {
        console.error(error.message);
      }
      process.exit(1);
    }
  });

program.parse(process.argv);

if (process.argv.length === 2) {
  program.help();
}
