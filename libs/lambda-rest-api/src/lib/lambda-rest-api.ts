import { DataService, DataType } from '@support-site/data';
import { DynamoDataService } from '@support-site/dynamo-data-service';
import { APIGatewayProxyEvent, APIGatewayProxyEventQueryStringParameters, APIGatewayProxyResult } from 'aws-lambda';

const dataService: DataService = new DynamoDataService();

function parsePageNumber(query: APIGatewayProxyEventQueryStringParameters): number {
  if (query && query['page']) {
    const pageNum = parseInt(query['page'], 10);
    if (!isNaN(pageNum)) {
      return pageNum;
    }
  }

  return 0;
}

export const getData = async ({
  pathParameters,
  queryStringParameters,
}: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const type = pathParameters['type'];
  const page = parsePageNumber(queryStringParameters);
  const group = queryStringParameters ? queryStringParameters['group'] : null;

  const response: APIGatewayProxyResult = {
    statusCode: 200,
    body: '',
  };

  try {
    const data = await dataService.getDataForType(
      DataType[type],
      { page },
      group
    );
    response.body = JSON.stringify(data);

  } catch (err) {
    console.log(err);
    response.statusCode = 500,
    response.body = JSON.stringify(err);
  }

  return response;
};
