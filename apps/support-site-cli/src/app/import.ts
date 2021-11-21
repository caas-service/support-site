import { DynamoDataService } from '@support-site/dynamo-data-service';
import { CsvParser } from './parser/csv-parser';
import { readFileSync } from 'fs';
import { DataType } from '@support-site/data';

export async function importData(file: string, group: string, clear: boolean) {
  const service = new DynamoDataService(group);
  const parser = new CsvParser({
    delimiter: ',',
    typeColumn: 0,
    dataColumn: 1,
  });

  const content = readFileSync(file).toString();
  const data = parser.parseContent(content);

  for (const key of Object.keys(data)) {
    const type = key as unknown as DataType;

    if (clear) {
      await service.clearData(type);
    }

    await service.saveData(type, data[key]);
  }

}
