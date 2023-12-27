import { HttpRequest } from '@/services/http-request';
import Authentication from '@/services/authentication';

export default class AircraftApiAdmin{
  private httpRequest: HttpRequest;
  private authentication: Authentication;

  constructor(httpRequest: HttpRequest, authentication: Authentication){
    this.httpRequest = httpRequest;
    this.authentication = authentication;
  }

  public async fetch(): Promise<any>{
    const API_URL = `http://localhost:3000/api/admin/aircraft`;

    return await this.httpRequest.get(API_URL, this.authentication.headers());
  }
}
