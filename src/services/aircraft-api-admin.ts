import { API_BASE_URL } from '@/main.js';
import { HttpRequest } from '@/services/http-request';
import Authentication from '@/services/authentication';
import {
  AircraftResults,
  AircraftDetails,
  AircraftTypeResults,
  AircraftManufacturerResults,
  HttpRequestError
} from '@/types/types'

export default class AircraftApiAdmin{
  private httpRequest: HttpRequest;
  private authentication: Authentication;

  constructor(httpRequest: HttpRequest, authentication: Authentication){
    this.httpRequest = httpRequest;
    this.authentication = authentication;
  }

  public async fetchAll(params = {}): Promise<AircraftResults | HttpRequestError>{
    let searchParams = new URLSearchParams(params);
    let API_URL = `${API_BASE_URL}/admin/aircraft?${ searchParams.toString() }`;
    let response: Response | HttpRequestError = await this.httpRequest.get(API_URL, this.authentication.headers());

    if(response instanceof Response){
      return await response.json();
    }

    return response;
  }

  public async fetch(id: string): Promise<AircraftDetails | HttpRequestError>{
    let API_URL = `${API_BASE_URL}/admin/aircraft/${id}`;
    let response: Response | HttpRequestError = await this.httpRequest.get(API_URL, this.authentication.headers());

    if(response instanceof Response){
      return await response.json();
    }

    return response;
  }

  public async update(id: string, data: any): Promise<any>{
    let API_URL = `${API_BASE_URL}/admin/aircraft/${id}`;
    let response: Response | HttpRequestError = await this.httpRequest.get(API_URL, this.authentication.headers());

    if(response instanceof Response){
      return await response.json();
    }

    return response;
  }

  public async fetchImages(id: string): Promise<any>{
    let params = new URLSearchParams({});
    let API_URL = `${API_BASE_URL}/admin/aircraft/${id}/images?${ params.toString() }`;
    let response: Response | HttpRequestError = await this.httpRequest.get(API_URL, this.authentication.headers());

    if(response instanceof Response){
      return await response.json();
    }

    return response;
  }

  public async saveImages(id: string, images: any): Promise<any>{
    let API_URL = `${API_BASE_URL}/admin/aircraft/${id}/images`;
    let response: Response | HttpRequestError = await this.httpRequest.put(API_URL, this.authentication.headers(), { images: images });

    if(response instanceof Response){
      return await response.json();
    }

    return response;
  }
}
