import program from 'commander'

import manifest from '../package.json'
import * as commands from './commands'
import * as logger from './logger'
import { Args } from '~/types'

function getCollector(name: string) {
  return (val: string, memo: Args) => {
    const eqIdx = val.indexOf('=')
    if (eqIdx === -1) {
      logger.fatal(`Invalid value for ${name}'s expected format of key=val: ${val}`)
    }
    const key = val.slice(0, eqIdx)
    const value = val.slice(eqIdx + 1)
    memo.push([key, value])
    return memo
  }
}

export default async function main() {
  let actionPromise

  program
    .version(manifest.version)
    .description('For more details on the commands below, run `omg `(validate|build|run|subscribe|shutdown)` --help`')
    .option('-v --version', 'Show OMG CLI version')
    .option('-d --directory', 'Directory to use as root')

  program
    .command('validate')
    .option('-j --json', 'Formats output to JSON')
    .option('-s --silent', 'Only feedback is the status exit code')
    .description('Validate the structure of a `microservice.yml` in the working directory')
    .action(options => {
      actionPromise = commands.validate({
        options,
        parameters: [],
      })
    })

  program
    .command('build')
    .option('-t --tag, <t>', 'The tag name of the image')
    .option('-r --raw', 'Show raw Docker build logs')
    .description(
      'Builds the microservice defined by the `Dockerfile`. Image will be tagged with `omg/$gihub_user/$repo_name`, unless the tag flag is given. If no git config present a random string will be used',
    )
    .action(options => {
      logger.setSpinnerAllowed(!options.raw)
      actionPromise = commands.build({
        options,
        parameters: [],
      })
    })

  program
    .command('run <action>')
    .option(
      '-i --image <i>',
      'The name of the image to spin up the microservice, if not provided a fresh image will be build based of the `Dockerfile`',
    )
    .option(
      '-a --args <a>',
      'Arguments to be passed to the command, must be of the form `key="val"`',
      getCollector('args'),
      [],
    )
    .option(
      '-e --envs <e>',
      'Environment variables to be passed to run environment, must be of the form `key="val"`',
      getCollector('envs'),
      [],
    )
    .option('-r --raw', 'All logging is suppressed expect for the output of the action.')
    .description(
      'Run actions defined in your `microservice.yml`. Must be ran in a working directory with a `Dockerfile` and a `microservice.yml`',
    )
    .action(async (action, options) => {
      logger.setSpinnerAllowed(!options.raw)
      actionPromise = commands.run({
        options,
        parameters: [action],
      })
    })

  program
    .command('subscribe <action> <event>')
    .option(
      '-a --args <a>',
      'Arguments to be passed to the event, must be of the form `key="val"`',
      getCollector('args'),
      [],
    )
    .option(
      '-e --envs <e>',
      'Environment variables to be passed to run environment, must be of the form `key="val"`',
      getCollector('envs'),
      [],
    )
    .option('-r --raw', 'All logging is suppressed expect for the output of the action.')
    .description(
      'Subscribe to an event defined in your `microservice.yml`. Must be ran in a working directory with a `Dockerfile` and a `microservice.yml`',
    )
    .action(async (action, event, options) => {
      logger.setSpinnerAllowed(!options.raw)
      actionPromise = commands.subscribe({
        options,
        parameters: [action, event],
      })
    })

  program
    .command('ui')
    .option('-p --port, <p>', 'The port to bind')
    .option('--no-open', 'Do not open in browser')
    .option('--inherit-env', 'Binds host env variable asked in the microservice.yml to the container env')
    .description('Starts to omg-app which monitors your microservice.')
    .action(options => {
      actionPromise = commands.ui({
        options,
        parameters: [],
      })
    })

  program
    .command('list')
    .option('-j --json', 'Returns actions in json format')
    .option('-d --details', 'Returns detailed actions')
    .description('Lists all actions available in microservice.')
    .action(options => {
      actionPromise = commands.list({
        options,
        parameters: [],
      })
    })

  // The order is important, this has to be before the args length check.
  program.parse(process.argv)

  if (!actionPromise) {
    program.help()
    process.exit(1)
  }

  await actionPromise.catch(error => {
    logger.spinnerStop()
    throw error
  })
}