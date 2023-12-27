import { HttpRequest } from '@/services/http-request';
import Authentication from '@/services/authentication';

export default class AircraftApi{
  private httpRequest: HttpRequest;
  private authentication: Authentication;

  constructor(httpRequest: HttpRequest, authentication: Authentication){
    this.httpRequest = httpRequest;
    this.authentication = authentication;
  }

  public async fetch(): Promise<any>{
    const API_URL = `http://localhost:3000/api/aircraft`;

    return await this.httpRequest.get(API_URL, this.authentication.headers());
  }
}
