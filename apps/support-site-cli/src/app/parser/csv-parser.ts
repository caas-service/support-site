import { DataParser, DataTypeMap } from './parser';
import { parse } from 'csv-parse';
import { DataType } from '@support-site/data';

export interface CsvParseOption {
  delimiter?: string;
  typeColumn: number;
  dataColumn: number;
  titleColumn?: number;
  commentColumn?: number;
}

export class CsvParser implements DataParser {
  constructor(private option: CsvParseOption) {}

  parseContent(content: string): DataTypeMap {
    const { delimiter, typeColumn, dataColumn, titleColumn, commentColumn } =
      this.option;
    const result = {};

    const parser = parse({
      delimiter: delimiter || ',',
    });

    parser.on('readable', () => {
      let record;
      while ((record = parser.read()) !== null) {
        const type: DataType = this.parseTypeFromRecord(record);
        if (type == null) continue;

        const data = this.parseColumnFromRecord(record, dataColumn);

        if (!result[type]) {
          result[type] = [];
        }

        result[type].push({ data: data });
      }
    });

    parser.write(content);

    parser.end();

    return result;
  }

  private parseTypeFromRecord(record: string[]): DataType | null {
    const typeStr = this.parseColumnFromRecord(record, this.option.typeColumn);
    return typeStr ? parseInt(DataType[typeStr], 10) : null;
  }

  private parseColumnFromRecord(record: string[], column: number): string | null {
    if (!this.isIndexAvailable(record, column)) return null;
    return record[column].trim();
  }

  private isIndexAvailable(arr: string[], index: number): boolean {
    return index >= 0 && index < arr.length;
  }

  parse(file: string): DataTypeMap {
    return null;
  }
}
