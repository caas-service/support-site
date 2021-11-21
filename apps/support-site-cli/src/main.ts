import yargs, { Arguments } from 'yargs';
import { importData } from './app/import';

interface ImportArgs {
  file: string;
  group: string;
  clear: boolean;
}

yargs(process.argv)
  .command(
    'import [file]',
    'Import data from file',
    (y) =>
      y
        .positional('file', { describe: 'file to import' })
        .option('clear', {
          alias: 'c',
          type: 'boolean',
          description: 'Clear data before importing',
        })
        .demandOption(['file']),
    (arg: Arguments<ImportArgs>) => importData(arg.file, arg.group, arg.clear)
  )
  .option('group', {
    alias: 'g',
    type: 'string',
    description: 'Group ID of data',
  })
  .demandOption('group')
  .strictCommands()
  .demandCommand(1)
  .parse();
