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
    const API_URL = `http://localhost:3000/api/admin/aircraft?${ searchParams.toString() }`;

    return await this.httpRequest.get(API_URL, this.authentication.headers(), searchParams);
  }

  public async fetchImages(id: string): Promise<any>{
    const params = new URLSearchParams({aircraft_id: id});
    const API_URL = `http://localhost:3000/api/admin/aircraft/images?${ params.toString() }`;

    return await this.httpRequest.get(API_URL, this.authentication.headers());
  }

  public async saveImages(id: string, images: any): Promise<any>{
    const API_URL = `http://localhost:3000/api/admin/aircraft/images`;

    return await this.httpRequest.put(API_URL, this.authentication.headers(), { aircraft_id: id, images: images });
  }
}
