import { API_BASE_URL } from '@/main.js';

export default class Authentication{
  public headers(): any{
    let headers = {};

    const accessToken: string = this.findAccessToken();

    if(accessToken.length > 0){
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    return headers;
  }

  public saveAccessToken(accessToken): void{
    document.cookie = `access_token=${accessToken}`;
  }

  public async isLoggedIn(): boolean{
    const accessToken: string = this.findAccessToken();

    if(accessToken.length === 0){
      return false;
    }

    return await this.verifyToken(accessToken);
  }

  private async verifyToken(accessToken){
    const API_URL = `${ API_BASE_URL }/api/authentication/verify_token`;
    const requestOptions = {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        access_token: accessToken,
      })
    }

    try{
      const response = await fetch(API_URL, requestOptions);
      const results = await response.json();

      if(results.status === 'ok'){
        return true;
      }

      return false;
    }
    catch(error){
      return false;
    }
  }

  private findAccessToken(): string{
    let accessToken: string = '';
    const cookieEntries = document.cookie.split(';')

    for(let x = 0; x < cookieEntries.length; x++){
      const cookieEntry = cookieEntries[x].split('=');

      if(cookieEntry.length === 2 && cookieEntry[0].trim() === 'access_token'){
        accessToken = cookieEntry[1];

        break;
      }
    }

    return accessToken;
  }
}
