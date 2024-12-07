import { API_BASE_URL } from '@/main.js';
import { HttpRequest } from '@/services/http-request';
import {
  AircraftResults,
  AircraftDetails,
  AircraftTypeResults,
  AircraftManufacturerResults,
  HttpRequestError
} from '@/types/types'

export default class AircraftApi{
  private httpRequest: HttpRequest;

  constructor(httpRequest: HttpRequest){
    this.httpRequest = httpRequest;
  }

  public async fetchAll(params = {}): Promise<AircraftResults | HttpRequestError>{
    let searchParams = new URLSearchParams(params);
    let API_URL = `${API_BASE_URL}/aircraft?${ searchParams.toString() }`;
    let response: Response | HttpRequestError = await this.httpRequest.get(API_URL);

    if(response instanceof Response){
      return await response.json();
    }

    return response;
  }

  public async fetch(id: string): Promise<AircraftDetails | HttpRequestError>{
    let API_URL = `${API_BASE_URL}/aircraft/${id}`;
    let response: Response | HttpRequestError = await this.httpRequest.get(API_URL);

    if(response instanceof Response){
      return await response.json();
    }

    return response;
  }

  public async fetchAircraftManufacturers(params = {}): Promise<AircraftManufacturerResults | HttpRequestError>{
    let searchParams = new URLSearchParams(params);
    let API_URL = `${API_BASE_URL}/aircraft-manufacturers?${ searchParams.toString() }`;
    let response: Response | HttpRequestError = await this.httpRequest.get(API_URL);

    if(response instanceof Response){
      return await response.json();
    }

    return response;
  }

  public async fetchAircraftTypes(params = {}): Promise<AircraftTypeResults | HttpRequestError>{
    let searchParams = new URLSearchParams(params);
    let API_URL = `${API_BASE_URL}/aircraft-types?${ searchParams.toString() }`;
    let response: Response | HttpRequestError = await this.httpRequest.get(API_URL);

    if(response instanceof Response){
      return await response.json();
    }

    return response;
  }
}
