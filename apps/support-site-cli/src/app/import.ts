import { DynamoDataService } from '@support-site/dynamo-data-service';

export function importData(file: string, group: string) {
  const service = new DynamoDataService(group);
  console.log(file, group);
}
