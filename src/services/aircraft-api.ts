import { HttpRequest } from '@/services/http-request';
import Authentication from '@/services/authentication';

export default class AircraftApi{
  private httpRequest: HttpRequest;

  constructor(httpRequest: HttpRequest){
    this.httpRequest = httpRequest;
  }

  public async fetch(): Promise<any>{
    const API_URL = `http://localhost:3000/api/aircraft`;

    return await this.httpRequest.get(API_URL);
  }
}
