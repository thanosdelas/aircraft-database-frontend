import { Error, WikipediaImage } from '@/types/types'
import { HttpRequest } from '@/services/http-request';

export class WikipediaDetails{
  private errors: Error[] = [];
  private httpRequest: HttpRequest;

  constructor(httpRequest: HttpRequest){
    this.httpRequest = httpRequest;
  }

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
    const response = await this.httpRequest.get(API_URL);

    if('errors' in response){
      return response;
    }

    if(response.query.search.length === 0){
      return {
        errors: [{
          code: 'error',
          message: `No results found on wikipedia for: ${ searchTerm }`
        }]
      };
    }

    return response.query.search[0];
  }

  /**
   * Summary text by page id
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
    const response = await this.httpRequest.get(API_URL);

    if('errors' in response){
      return response;
    }

    if(!(pageId in response.query.pages)){
      this.errors.push({ code: 'error', 'message': `Could not find summary on Wikipedia with page id: ${ pageId }` });
      return { errors: this.errors };
    }

    return { data: response.query.pages[pageId].extract }
  }

  /**
   * Find page images.
   * Requires two requests; one to find image filenames and one
   * to find the image URLs.
   */
  public async fetchImages(title: string, pageId: string): Promise<any>{
    const imageFilenames = await this.fetchImageFilenames(title, pageId);

    if('errors' in imageFilenames){
      return imageFilenames;
    }

    if(imageFilenames.length === 0){
      return {
        errors: [{
          code: 'error',
          message: `No images found on wikipedia for title: ${ title }`
        }]
      };
    }

    const imageURLs = await this.fetchImageURLs(imageFilenames);
    if('errors' in imageURLs){
      return imageURLs;
    }

    if(imageURLs.length === 0){
      return {
        errors: [{
          code: 'error',
          message: `No image URLs found on wikipedia for title: ${ title }`
        }]
      };
    }

    return { data: imageURLs }
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
    const response = await this.httpRequest.get(API_URL);

    if('errors' in response){
      return response;
    }

    let collectImages = [];
    for(let x = 0; x < response.query.pages[pageId].images.length; x++){
      collectImages.push(response.query.pages[pageId].images[x].title);
    }

    return collectImages;
  }

  private async fetchImageURLs(imageFilenames: string[]){
    const images: WikipediaImage[] = [];

    const params = {
      format: 'json',
      action: 'query',
      origin: '*',
      prop: 'imageinfo',
      iiprop: 'url',
      titles: imageFilenames.join('|')
    }

    const API_URL = `https://en.wikipedia.org/w/api.php?${ new URLSearchParams(params).toString() }`
    const response = await this.httpRequest.get(API_URL);

    if('errors' in response){
      return response;
    }

    if(Object.keys(response.query.pages).length === 0){
      return images;
    }

    for(const key in response.query.pages){
      if(
        response.query.pages[key].imageinfo.length === 1 &&
        !/flag/i.test(response.query.pages[key].imageinfo[0].url) &&
        !/edit/i.test(response.query.pages[key].imageinfo[0].url) &&
        !/commons-logo/i.test(response.query.pages[key].imageinfo[0].url) &&
        !/globe_content/i.test(response.query.pages[key].imageinfo[0].url) &&
        !/question_mark/i.test(response.query.pages[key].imageinfo[0].url) &&
        !/Question_book/i.test(response.query.pages[key].imageinfo[0].url) &&
        !/Aviacionavion/i.test(response.query.pages[key].imageinfo[0].url)
      ){
        images.push({
          title: response.query.pages[key].title,
          url: response.query.pages[key].imageinfo[0].url
        })
      }
    }

    return images.reverse();
  }
}
