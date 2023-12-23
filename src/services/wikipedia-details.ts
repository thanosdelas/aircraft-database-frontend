export class WikipediaDetails{
  public async searchAircraftModel(data: any){
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

    const response = await fetch(API_URL);
    const results = await response.json();
    console.log("Search term: ", searchTerm);
    console.log("Results from searchAircraftModel: ", results);

    return results;
  }

  /**
   * `https://en.wikipedia.org/w/api.php?origin=*&format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&pageids=${pageId}`
   */
  public async contentSummary(pageId: string): Promise<string>{
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

    const response = await fetch(API_URL);
    const results = await response.json();

    if(pageId in results.query.pages){
      return results.query.pages[pageId].extract
    }

    return '';
  }

  private async fetchImageFilenames(title: string, pageId: string){
    const params = {
      format: 'json',
      action: 'query',
      origin: '*',
      imlimit: '20',
      prop: 'images',
      titles: title
    };

    const searchParams = new URLSearchParams(params);
    const API_URL = `https://en.wikipedia.org/w/api.php?${ searchParams.toString() }`

    const response = await fetch(API_URL);
    const results = await response.json();
    console.log("[*] fetchImageFilenames: ", API_URL);
    console.log("[*] fetchImageFilenames: ", results);

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
        !/Aviacionavion/i.test(results.query.pages[key].imageinfo[0].url)
      ){
        images.push(results.query.pages[key].imageinfo[0].url)
      }
    }

    return images.reverse();
  }
}
