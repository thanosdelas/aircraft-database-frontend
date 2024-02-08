import { HttpRequest } from '@/services/http-request';

export default class AircraftApi{
  private httpRequest: HttpRequest;

  constructor(httpRequest: HttpRequest){
    this.httpRequest = httpRequest;
  }

  public async fetchAll(): Promise<any>{
    const API_URL = `http://localhost:3000/api/aircraft`;

    return await this.httpRequest.get(API_URL);
  }

  public async fetch(id: string): Promise<any>{
    const API_URL = `http://localhost:3000/api/aircraft/${id}`;

    return await this.httpRequest.get(API_URL);
  }
}
