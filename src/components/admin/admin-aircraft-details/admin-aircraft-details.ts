import { HttpRequest } from '@/services/http-request';
import { WikipediaDetails } from '@/services/wikipedia-details';
import Authentication from '@/services/authentication';
import AircraftApiAdmin from '@/services/aircraft-api-admin';
import { Error, Image } from '@/types/types';

/**
 * The following handles component logic to retrieve,
 * and update details. Images are always loaded from
 * wikipedia, but on save, the selected images's url
 * is saved in the database.
 */
export class AdminAircraftDetails{
  private aircraft: any;

  /**
   * Holds all images with state for selected & saved.
   */
  private images: Image[];

  /**
   * Saved images from back-end.
   */
  private savedImages: any[] = [];

  /**
   * Selected images from user input.
   * Should be updated by default from saved imges.
   */
  private selectedImages: any[] = [];

  private httpRequest: HttpRequest;
  private authentication: Authentication;
  private aircraftApiAdmin: AircraftApiAdmin;
  private wikipediaDetails: WikipediaDetails;

  //
  // Expose the follwing to update view.
  //
  public wikipediaPageResult: string;
  public summary: string;
  public summaryLoading: boolean = true;
  public imagesLoading: boolean = true;
  public imagesError: string;

  constructor(aircraft: any){
    this.aircraft = aircraft;
    this.httpRequest = new HttpRequest();
    this.authentication = new Authentication();
    this.aircraftApiAdmin = new AircraftApiAdmin(this.httpRequest, this.authentication);
    this.wikipediaDetails = new WikipediaDetails(this.httpRequest);
  }

  public getImages(){
    return this.images;
  }

  /**
   * Save aircraft details to database.
   */
  public async updateAircraftDetails(data: any){
    const result = await this.aircraftApiAdmin.update(this.aircraft.id, {
      model: data.model,
      description: data.description
    });

    if('errors' in result){
      return result;
    }

    return result;
  }

  /**
   * Save selected images to database.
   */
  public async saveImages(){
    const result = await this.aircraftApiAdmin.saveImages(this.aircraft.id, this.selectedImages);

    if('errors' in result){
      return result;
    }

    this.savedImages = result.data;
    this.updateImagesWithSavedImages();

    return result;
  }

  public selectImage(image: any){
    this.updateSelectedImages(image);
    this.updateImagesWithSelectedImages();
  }

  /**
   * Use when edit is started.
   * Update selected images from saved images.
   */
  public initializeEdit(){
    this.images.forEach((image) => {
      image.saved = false;
      image.selected = false;

      this.savedImages.forEach((savedImage) => {
        if(image.url === savedImage.url){
          image.selected = true;
          this.appendSelectedImage(image);
        }
      });
    });
  }

  /**
   * Use when edit is fisnished.
   * Set all selected flag to false for all images, and
   * update saved to true from saved images.
   */
  public resetEdit(){
    this.selectedImages = [];

    this.images.forEach((image) => {
      image.selected = false;
    });

    this.updateImagesWithSavedImages();
  }

  /**
   * Load aircraft data from database and Wikipedia.
   * 1. Load saved images from database.
   * 2. Search Wikipedia by aircraft model to find a title.
   * 3. Search for Wikipedia for summary from previously found title.
   * 4. Search for Wikipedia for images from previously found title.
   * 5. Compare images from Wikipedia with saved images and update accordingly.
   */
  public async loadDetails(){
    //
    // Load saved images from database; return on error.
    //
    const fetchImagesResult = await this.aircraftApiAdmin.fetchImages(this.aircraft.id);
    if('errors' in fetchImagesResult){
      this.imagesLoading = false;
      this.summaryLoading = false;
      return fetchImagesResult;
    }
    this.savedImages = fetchImagesResult.data;

    //
    // Load wikipedia details, return on error;
    //
    const wikipediaDetails = await this.loadWikipediaDetails();
    if('errors' in wikipediaDetails){
      this.imagesLoading = false;
      this.summaryLoading = false;
      return wikipediaDetails;
    }

    this.wikipediaPageResult = wikipediaDetails;

    //
    // Load summary from Wikipedia; do not return on error.
    //
    const summaryResult = await this.wikipediaDetails.summary(wikipediaDetails.pageId);
    this.summaryLoading = false;
    if('data' in summaryResult){
      this.summary = summaryResult.data;
    }
    if('errors' in summaryResult){
      this.summary = 'Could not find summary';
    }

    //
    // Load images from Wikipedia; return on error.
    //
    const wikipediaImagesResult = await this.wikipediaDetails.fetchImages(wikipediaDetails.title, wikipediaDetails.pageId);
    this.imagesLoading = false;

    if('errors' in wikipediaImagesResult){
      this.imagesError = 'No images found';
      return wikipediaImagesResult;
    }

    this.images = wikipediaImagesResult.data

    this.updateImagesWithSavedImages();
    return {};
  }

  private async loadWikipediaDetails(){
    const result = await this.wikipediaDetails.searchAircraftModel(this.aircraft);
    if('errors' in result){
      return result;
    }

    return {
      title: result.title,
      pageId: result.pageid,
      page_url: `https://en.wikipedia.org/wiki/${ result.title.replace(/ /g,"_") }`
    }
  }

  private updateImagesWithSelectedImages(){
    this.images.forEach((image) => {
      image.saved = false;
      image.selected = false;

      this.selectedImages.forEach((selectedImage) => {
        if(image.url === selectedImage.url){
          image.selected = true;
        }
      });
    });
  }

  /**
   * Update images with saved and selected state
   */
  private updateImagesWithSavedImages(){
    this.images.forEach((image) => {
      image.saved = false;
      image.selected = false;

      this.savedImages.forEach((savedImage) => {
        if(image.url === savedImage.url){
          image.saved = true;
        }
      });
    });
  }

  private updateSelectedImages(image: Image){
    const findSelectedImage = this.selectedImages.filter((selectedImage) => {
      return selectedImage.url === image.url;
    });

    if(findSelectedImage.length === 0){
      return this.appendSelectedImage(image);
    }

    if(findSelectedImage.length === 1){
      for(let index = 0; index < this.selectedImages.length; index++){
        if(this.selectedImages[index].url === image.url){
          return this.removeSelectedImage(index);
        }
      }
    }
  }

  private appendSelectedImage(image: Image){
    this.selectedImages.push({
      filename: image.filename,
      url: image.url,
      description: image.description
    });
  }

  private removeSelectedImage(index: number){
    this.selectedImages.splice(index, 1);
  }
}
