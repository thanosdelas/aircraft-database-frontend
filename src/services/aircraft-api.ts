import { API_BASE_URL } from '@/main.js';
import { HttpRequest } from '@/services/http-request';

export default class AircraftApi{
  private httpRequest: HttpRequest;

  constructor(httpRequest: HttpRequest){
    this.httpRequest = httpRequest;
  }

  public async fetchAll(): Promise<any>{
    const API_URL = `${API_BASE_URL}/aircraft`;

    return await this.httpRequest.get(API_URL);
  }

  public async fetch(id: string): Promise<any>{
    const API_URL = `${API_BASE_URL}/aircraft/${id}`;

    return await this.httpRequest.get(API_URL);
  }
}
