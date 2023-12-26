import { Aircraft, Error } from '@/types/types'
import Authentication from '@/services/authentication';

export default class AircraftApi{
  private data: Aircraft[];
  private errors: Error[];
  private authentication: Authentication;

  constructor(authentication: Authentication){
    this.data = [];
    this.errors = [];
    this.authentication = authentication;
  }

  public async fetch(): Promise<any>{
    try{
      const API_URL = `http://localhost:3000/api/aircraft`
      const response = await fetch(API_URL, { headers: this.authentication.headers() });

      if(response.status !== 200){
        this.errors.push({
          code: response.status.toString(), message: 'Could not fetch aircraft data'
        });

        return { errors: this.errors };
      }

      return response.json();
    }
    catch(error){
      this.errors.push({ code: 'exception', message: error.message });
      return { errors: this.errors };
    }
  }
}
