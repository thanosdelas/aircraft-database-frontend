import { HttpRequest } from '@/services/http-request';
import Authentication from '@/services/authentication';
import AircraftApi from '@/services/aircraft-api';
import aircraftFixture from '@/tests/fixtures/aircraft.json';
import aircraftDetailsFixture from '@/tests/fixtures/aircraft-details.json';
import {
  AircraftResults,
  Aircraft,
  AircraftDetails,
  AircraftTypeResults,
  AircraftManufacturerResults,
  HttpRequestError
} from '@/types/types';

const MOCK_HTTP_REQUESTS = true;

jest.mock('@/main.js', () => ({
  API_BASE_URL: 'http://localhost:3000/api'
}));

jest.mock('@/store/store.js', () => ({
  API_BASE_URL: 'Mock Store'
}));

describe('AircraftApi fetchAll', () => {
  let aircraftApi: AircraftApi;
  let httpRequest: HttpRequest;

  beforeEach(() => {
    httpRequest = new HttpRequest();
    aircraftApi = new AircraftApi(httpRequest);

    if(MOCK_HTTP_REQUESTS){
      aircraftApi.fetchAll = jest.fn().mockResolvedValue(aircraftFixture);
    }
  });

  it('successfully fetches all aircraft', async() => {
    let results: AircraftResults | HttpRequestError = await aircraftApi.fetchAll()

    if('data' in results){
      expect(results.data.length).toEqual(16)
    }
  });
});

describe('AircraftApi fetch', () => {
  let aircraftApi: AircraftApi;
  let httpRequest: HttpRequest;

  beforeEach(() => {
    httpRequest = new HttpRequest();
    aircraftApi = new AircraftApi(httpRequest);

    if(MOCK_HTTP_REQUESTS){
      aircraftApi.fetch = jest.fn().mockResolvedValue(aircraftDetailsFixture);
    }
  });

  it('successfully fetches all aircraft', async() => {
    let aircraftId: string = '9999'
    let result: AircraftDetails | HttpRequestError = await aircraftApi.fetch(aircraftId)

    if('errors' in result){
      throw new Error('Found error in result.');
    }

    expect(result.model).toEqual('Grumman Gulfstream I');
    expect(result.wikipedia_info_collected).toEqual(true);
    expect(result.featured_image).toEqual('File:Uscg vc4gulfstream 1380 1964.jpg');
  });
});
