import { DataParser, DataTypeMap } from './parser';

export class CsvParser implements DataParser {
  parse(file: string): DataTypeMap {
    throw new Error('Method not implemented.');
  }
}
