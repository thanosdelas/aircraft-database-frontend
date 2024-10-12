import { API_BASE_URL } from '@/main.js';
import { HttpRequest } from '@/services/http-request';
import Authentication from '@/services/authentication';

export default class AircraftApiAdmin{
  private httpRequest: HttpRequest;
  private authentication: Authentication;

  constructor(httpRequest: HttpRequest, authentication: Authentication){
    this.httpRequest = httpRequest;
    this.authentication = authentication;
  }

  public async fetch(params = {}): Promise<any>{
    const searchParams = new URLSearchParams(params);
    const API_URL = `${API_BASE_URL}/admin/aircraft?${ searchParams.toString() }`;

    return await this.httpRequest.get(API_URL, this.authentication.headers());
  }

  public async update(id: string, data: any): Promise<any>{
    const API_URL = `${API_BASE_URL}/admin/aircraft/${id}`;

    return await this.httpRequest.put(API_URL, this.authentication.headers(), data);
  }

  public async fetchImages(id: string): Promise<any>{
    const params = new URLSearchParams({});
    const API_URL = `${API_BASE_URL}/admin/aircraft/${id}/images?${ params.toString() }`;

    return await this.httpRequest.get(API_URL, this.authentication.headers());
  }

  public async saveImages(id: string, images: any): Promise<any>{
    const API_URL = `${API_BASE_URL}/admin/aircraft/${id}/images`;

    return await this.httpRequest.put(API_URL, this.authentication.headers(), { images: images });
  }
}
