import yargs, { Arguments } from 'yargs';
import { importData } from './app/import';

interface ImportArgs {
  file: string;
  group: string;
}

yargs(process.argv)
  .command(
    'import [file]',
    'Import new data and clear old ones',
    (y) =>
      y
        .positional('file', { describe: 'file to import' })
        .demandOption(['file']),
    (arg: Arguments<ImportArgs>) => importData(arg.file, arg.group)
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
