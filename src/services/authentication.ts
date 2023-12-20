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
