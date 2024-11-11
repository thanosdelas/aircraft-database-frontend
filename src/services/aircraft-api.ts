import { API_BASE_URL } from '@/main.js';
import { HttpRequest } from '@/services/http-request';

export default class AircraftApi{
  private httpRequest: HttpRequest;

  constructor(httpRequest: HttpRequest){
    this.httpRequest = httpRequest;
  }

  public async fetchAll(params = {}): Promise<any>{
    const searchParams = new URLSearchParams(params);
    const API_URL = `${API_BASE_URL}/aircraft?${ searchParams.toString() }`;

    return await this.httpRequest.get(API_URL);
  }

  public async fetch(id: string): Promise<any>{
    const API_URL = `${API_BASE_URL}/aircraft/${id}`;

    return await this.httpRequest.get(API_URL);
  }

  public async fetchAircraftManufacturers(params = {}): Promise<any>{
    const searchParams = new URLSearchParams(params);
    const API_URL = `${API_BASE_URL}/aircraft-manufacturers?${ searchParams.toString() }`;

    return await this.httpRequest.get(API_URL);
  }

  public async fetchAircraftTypes(params = {}): Promise<any>{
    const searchParams = new URLSearchParams(params);
    const API_URL = `${API_BASE_URL}/aircraft-types?${ searchParams.toString() }`;

    return await this.httpRequest.get(API_URL);
  }
}
