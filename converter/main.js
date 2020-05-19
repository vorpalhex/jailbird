#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const yargs = require('yargs');

const converter = require(`${__dirname}/converter`);

/*
 * Main Entry
 *
 * Bootstrap a yargs parser for proper CLI behavior
 * should be crossplatform
 * we have a single default command
 */
yargs
  .scriptName('jailbird')
  .usage('$0 input.xml')
  .command(
    ['$0 [story]'],
    'convert a jailbird xml file to json, meant to be used alongside Tweego',
    (yargs) => {
      //we have a single unnamed default command, see >https://github.com/yargs/yargs/blob/master/docs/advanced.md#default-commands
      yargs.positional('story', {
        type: 'string',
        demand: false,
        default: '',
        describe:
          'path to the exported jailbird story, must be xml, defaults to STDIN if not specified',
      });
      yargs.option('output', {
        alias: 'o',
        type: 'string',
        default: '',
        describe:
          'where to output our converted object, otherwise we default to STDOUT',
      });
    },
    defaultCmdHandler
  )
  .showHelpOnFail(false)
  .help().argv;

//defaultCmdHandler is what gets called for any kind of invocation except help
async function defaultCmdHandler(argv) {
  let sourceXml = null;
  //Try the positional argument then fallback to trying stdin
  if (argv.story) {
    const ext = path.extname(argv.story);
    if (!ext || ext != '.xml') {
      throw new Error('Format not supported!');
    }
    sourceXml = fs.readFileSync(path.normalize(argv.story), {
      encoding: 'utf8',
    });
  } else {
    const stdin = await getStdin();
    if (!stdin || !stdin.length) {
      //If we got this far, they probably just invoked us without any extra data, let's show them the help screen
      console.log('No input file provided and stdin looks empty...\n\n');
      yargs.showHelp();
      process.exit(0);
    }
    sourceXml = stdin;
  }

  const resultJson = await converter(sourceXml);

  if (yargs.output) {
    return fs.writeFileSync(outPath, resultJson, { encoding: 'utf8' });
  }

  process.stdout.setEncoding('utf8');
  return process.stdout.write(resultJson);
}

//getStdin is a convenience function to read all data sent to stdin
//taken from @sindresorhus' get-stdin, https://github.com/sindresorhus/get-stdin
async function getStdin() {
  const { stdin } = process;
  let result = '';

  if (stdin.isTTY) {
    return result;
  }

  stdin.setEncoding('utf8');

  for await (const chunk of stdin) {
    result += chunk;
  }

  return result;
}

//treat all uncaught errors as fatals with some logging
process.on('uncaughtException', (err) => {
  console.error('error: ', err.msg);
  process.exit(1);
});
