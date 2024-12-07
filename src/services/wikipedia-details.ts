import { Error, WikipediaImage } from '@/types/types'
import { HttpRequest } from '@/services/http-request';
import { Image } from '@/types/types'
import {
  AircraftResults,
  AircraftDetails,
  AircraftTypeResults,
  AircraftManufacturerResults,
  HttpRequestError
} from '@/types/types'

export class WikipediaDetails{
  private errors: Error[] = [];
  private httpRequest: HttpRequest;

  constructor(httpRequest: HttpRequest){
    this.httpRequest = httpRequest;
  }

  /**
   * Search for Wikipedia titles by aircraft model
   */
  public async searchAircraftModel(model: any): Promise<any | HttpRequestError>{
    const searchTerm = `${ model }`;
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

    const result =  await response.json();

    if(result.query.search.length === 0){
      return {
        errors: [{
          code: 'error',
          message: `No results found on wikipedia for: ${ searchTerm }`
        }]
      };
    }

    return result.query.search[0];
  }

  /**
   * Summary text by page id
   * `https://en.wikipedia.org/w/api.php?origin=*&format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&pageids=${pageId}`
   */
  public async summary(pageId: string): Promise<any | HttpRequestError>{
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

    const result =  await response.json();

    if(!(pageId in result.query.pages)){
      this.errors.push({ code: 'error', 'message': `Could not find summary on Wikipedia with page id: ${ pageId }` });
      return { errors: this.errors };
    }

    return { data: result.query.pages[pageId].extract }
  }

  /**
   * Find page images.
   * Requires two requests; one to find image filenames and one
   * to find the image URLs. Additional filtering is applied to the
   * last results of the last query, to filter out icons and flags.
   */
  public async fetchImages(title: string, pageId: string): Promise<any | HttpRequestError>{
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

    let transformImageURLs: Image[] = [];
    imageURLs.forEach((imageURL: any) => {
      transformImageURLs.push({
        url: imageURL.url,
        filename: imageURL.title,
        description: this.stripHTML(imageURL.description)
      });
    });

    return { data: transformImageURLs }
  }

  /**
   * Fetch a list of filenames from provided Wikipedia title.
   * https://en.wikipedia.org/w/api.php?format=json&action=query&origin=*&imlimit=50&prop=images&titles=Lockheed+Model+10+Electra
   */
  private async fetchImageFilenames(title: string, pageId: string){
    const params = {
      format: 'json',
      action: 'query',
      origin: '*',
      imlimit: '100',
      prop: 'images',
      titles: title
    };

    const searchParams = new URLSearchParams(params);
    const API_URL = `https://en.wikipedia.org/w/api.php?${ searchParams.toString() }`
    const response = await this.httpRequest.get(API_URL);
    if('errors' in response){
      return response;
    }

    const result =  await response.json();

    if(
      !(pageId in result.query.pages) ||
      !('images' in result.query.pages[pageId])
    ){
      return {
        errors: [{
          code: 'failed',
          message: `Could not find images for title: ${ title }`
        }]
      }
    }

    let collectImages = [];
    for(let x = 0; x < result.query.pages[pageId].images.length; x++){
      collectImages.push(result.query.pages[pageId].images[x].title);
    }

    return collectImages;
  }

  /**
   * TODO: Keep track of URLs and skip duplicates.
   * Fetch image URLs according to files (titles) collected from fetchImageFilenames.
   * https://en.wikipedia.org/w/api.php?format=json&action=query&origin=*&prop=imageinfo&iiprop=url%7Cextmetadata&titles=File:...
   */
  private async fetchImageURLs(imageFilenames: string[]){
    const images: WikipediaImage[] = [];

    const params = {
      format: 'json',
      action: 'query',
      origin: '*',
      prop: 'imageinfo',
      iiprop: 'url|extmetadata',
      titles: imageFilenames.join('|')
    }

    const API_URL = `https://en.wikipedia.org/w/api.php?${ new URLSearchParams(params).toString() }`
    const response = await this.httpRequest.get(API_URL);
    if('errors' in response){
      return response;
    }

    const result =  await response.json();

    if(Object.keys(result.query.pages).length === 0){
      return images;
    }

    //
    // Filter out any image URLs matching criteria like flags & wikipedia icons.
    //
    for(const key in result.query.pages){
      if(
        result.query.pages[key].imageinfo.length === 1 &&
        !/.svg/i.test(result.query.pages[key].imageinfo[0].url) &&
        !/.tif/i.test(result.query.pages[key].imageinfo[0].url) &&
        !/.gif/i.test(result.query.pages[key].imageinfo[0].url) &&
        !/.ogv/i.test(result.query.pages[key].imageinfo[0].url) &&
        !/.ogg/i.test(result.query.pages[key].imageinfo[0].url) &&
        !/.webm/i.test(result.query.pages[key].imageinfo[0].url) &&
        !/flag/i.test(result.query.pages[key].imageinfo[0].url) &&
        !/edit/i.test(result.query.pages[key].imageinfo[0].url) &&
        !/commons-logo/i.test(result.query.pages[key].imageinfo[0].url) &&
        !/globe_content/i.test(result.query.pages[key].imageinfo[0].url) &&
        !/question_mark/i.test(result.query.pages[key].imageinfo[0].url) &&
        !/Question_book/i.test(result.query.pages[key].imageinfo[0].url) &&
        !/apps_kaboodle/i.test(result.query.pages[key].imageinfo[0].url) &&
        !/support_vote/i.test(result.query.pages[key].imageinfo[0].url) &&
        !/Wiki_letter/i.test(result.query.pages[key].imageinfo[0].url) &&
        !/Aviacionavion/i.test(result.query.pages[key].imageinfo[0].url)
      ){
        let image = {
          title: result.query.pages[key].title,
          url: result.query.pages[key].imageinfo[0].url,
          description: ''
        }

        if(
          'ImageDescription' in result.query.pages[key].imageinfo[0].extmetadata &&
          'value' in result.query.pages[key].imageinfo[0].extmetadata.ImageDescription
        ){
          image.description = result.query.pages[key].imageinfo[0].extmetadata.ImageDescription.value;
        }

        images.push(image);
      }
    }

    return images.reverse();
  }

  private stripHTML(html: string): string{
    let element = document.createElement('div');
    element.innerHTML = html;

    return element.textContent || element.innerText || '';
  }
}
