import { Error } from '@/types/types'

export class WikipediaDetails{
  private errors: Error[] = [];

  /**
   * Search for Wikipedia titles by aircraft model
   */
  public async searchAircraftModel(data: any): Promise<any>{
    const searchTerm = `${ data.aircraft.model }`;
    const params = {
      format: 'json',
      action: 'query',
      origin: '*',
      list: 'search',
      srsearch: searchTerm
    };

    const searchParams = new URLSearchParams(params);
    const API_URL = `https://en.wikipedia.org/w/api.php?${ searchParams.toString() }`

    try{
      const response = await fetch(API_URL);

      if(this.responseErrors(response)){
        return { errors: this.errors };
      }

      const results = await response.json();

      if(results.query.search.length === 0){
        return {
          errors: [{
            code: 'error',
            message: `No results found on wikipedia for: ${ searchTerm }`
          }]
        };
      }

      return results.query.search[0];
    }
    catch(error){
      this.errors.push({ code: 'exception', 'message': error.message });

      return { errors: this.errors };
    }
  }

  /**
   * `https://en.wikipedia.org/w/api.php?origin=*&format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&pageids=${pageId}`
   */
  public async summary(pageId: string): Promise<any>{
    const params:any = {
      format: 'json',
      action: 'query',
      origin: '*',
      prop: 'extracts',
      exintro: 'true',
      explaintext: true,
      redirects: 1,
      pageids: pageId
    };

    const searchParams = new URLSearchParams(params);
    const API_URL = `https://en.wikipedia.org/w/api.php?${ searchParams.toString() }`

    try{
      const response = await fetch(API_URL);

      if(this.responseErrors(response)){
        return { errors: this.errors };
      }

      const results = await response.json();

      if(pageId in results.query.pages){
        return { data: results.query.pages[pageId].extract }
      }

      this.errors.push({ code: 'error', 'message': `Could not find summary on Wikipedia with page id: ${ pageId }` });
      return { error: results.query.pages[pageId].extract };
    }
    catch(error){
      this.errors.push({ code: 'exception', 'message': error.message });
      return { errors: this.errors };
    }
  }

  public async fetchImages(title: string, pageId: string): Promise<any>{
    try{
      const imageFilenames = await this.fetchImageFilenames(title, pageId);

      if(imageFilenames.length === 0){
        return {
          errors: [{
            code: 'error',
            message: `No images found on wikipedia for title: ${ title }`
          }]
        };
      }

      const imageURLs = await this.fetchImageURLs(imageFilenames);

      if(imageURLs.length === 0){
        return {
          errors: [{
            code: 'error',
            message: `No images found on wikipedia for title: ${ title }`
          }]
        };
      }

      return { data: imageURLs }
    }
    catch(error){
      this.errors.push({ code: 'exception', 'message': error.message });
      return { errors: this.errors };
    }
  }

  private async fetchImageFilenames(title: string, pageId: string){
    const params = {
      format: 'json',
      action: 'query',
      origin: '*',
      imlimit: '50',
      prop: 'images',
      titles: title
    };

    const searchParams = new URLSearchParams(params);
    const API_URL = `https://en.wikipedia.org/w/api.php?${ searchParams.toString() }`

    const response = await fetch(API_URL);
    const results = await response.json();

    let collectImages = [];
    for(let x = 0; x < results.query.pages[pageId].images.length; x++){
      collectImages.push(results.query.pages[pageId].images[x].title);
    }

    return collectImages;
  }

  private async fetchImageURLs(imageFilenames: string[]){
    const images: string[] = [];

    const params = {
      format: 'json',
      action: 'query',
      origin: '*',
      prop: 'imageinfo',
      iiprop: 'url',
      titles: imageFilenames.join('|')
    }

    const API_URL = `https://en.wikipedia.org/w/api.php?${ new URLSearchParams(params).toString() }`

    const response = await fetch(API_URL);
    const results = await response.json();
    if(Object.keys(results.query.pages).length === 0){
      return images;
    }

    for(const key in results.query.pages){
      if(
        results.query.pages[key].imageinfo.length === 1 &&
        !/flag/i.test(results.query.pages[key].imageinfo[0].url) &&
        !/edit/i.test(results.query.pages[key].imageinfo[0].url) &&
        !/commons-logo/i.test(results.query.pages[key].imageinfo[0].url) &&
        !/question_mark/i.test(results.query.pages[key].imageinfo[0].url) &&
        !/Question_book/i.test(results.query.pages[key].imageinfo[0].url) &&
        !/Aviacionavion/i.test(results.query.pages[key].imageinfo[0].url)
      ){
        images.push(results.query.pages[key].imageinfo[0].url)
      }
    }

    return images.reverse();
  }

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
}
