import { DataType } from '@support-site/data';
import { CsvParser } from './csv-parser';

describe('CSV Parser', () => {
  let parser: CsvParser;

  beforeEach(() => {
    parser = new CsvParser({ delimiter: ',', typeColumn: 0, dataColumn: 1 });
  });

  it('should create parser', () => {
    expect(parser).toBeTruthy();
  });

  it('should parse content', () => {
    const actual = parser.parseContent(
      `IMAGE,image1\nMESSAGE,text1\nIMAGE,image2\nLINK,link1\nLINK,link2\nMESSAGE,text2`
    );

    expect(actual[DataType.IMAGE]).toEqual(
      expect.arrayContaining([{ data: 'image1' }, { data: 'image2' }])
    );
    expect(actual[DataType.MESSAGE]).toEqual(
      expect.arrayContaining([{ data: 'text1' }, { data: 'text2' }])
    );
    expect(actual[DataType.LINK]).toEqual(
      expect.arrayContaining([{ data: 'link1' }, { data: 'link2' }])
    );
  });

  it('should ignore invalid types', () => {
    const actual = parser.parseContent(`IMAGE,image1\nINVALID,invalid1`);

    expect(actual[DataType.IMAGE]).toEqual(
      expect.arrayContaining([{ data: 'image1' }])
    );
  });
});
