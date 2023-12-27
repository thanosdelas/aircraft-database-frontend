import { Error } from '@/types/types'

export class HttpRequest{
  private errors: Error[];

  constructor(){
    this.errors = [];
  }

  public async get(url: string, headers = {}): Promise<any>{
    try{
      const response = await fetch(url, { headers: headers });

      if(this.responseErrors(response)){
        return this.errorResponse();
      }

      return await response.json();
    }
    catch(error){
      this.errors.push({ code: 'exception', message: error.message });
      return this.errorResponse();
    }
  }

  /**
   * TODO: Match all or some of the successful responses.
   */
  private responseErrors(response: any): boolean{
    if(response.status !== 200){
      this.errors.push({
        code: response.status,
        message: response.statusText
      });

      return true;
    }

    return false
  }

  private errorResponse(){
    return { errors: this.errors };
  }
}
