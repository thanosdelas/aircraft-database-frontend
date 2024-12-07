export type AircraftResults = {
  data: Aircraft[];
  metadata: any;
}

export type Aircraft = {
  id: number;
  model: string;
  wikipedia_title: string;
  featured_image: string;
  first_flight_year: number;
}

export type AircraftTypeResults = {
  data: AircraftType[]
}

export type AircraftManufacturerResults = {
  data: AircraftManufacturer[]
}

export type AircraftType = {
  id: number;
  aircraft_type: string;
  aircraft_count: number;
}

export type AircraftManufacturer = {
  id: number;
  manufacturer: string;
  aircraft_count: number;
}

export type AircraftDetails = {
  id: number;
  model: string;
  description: string;
  featured_image: string;
  first_flight: string;
  first_flight_raw: string;
  first_flight_year: string;
  infobox_json: string;
  infobox_raw: string;
  snippet: string;
  wikipedia_info_collected: boolean;
  wikipedia_page_id: string;
  wikipedia_title: string;
  created_at: Date;
  updated_at: Date;
  images: AircraftImage[];
  manufacturers: AircraftManufacturer[];
  types: AircraftType[];
}

export type AircraftImage = {
  id: number;
  aircraft_id: number;
  url: string;
  filename: string;
  description: string;
  created_at: Date;
  updated_at: Date;
}

export type Error = {
  code: string;
  message: string;
}

export type WikipediaImage = {
  title: string;
  url: string;
}

export type Image = {
  url: string;
  filename: string;
  description: string;
  saved?: boolean;
  selected?: boolean;
}

export type HttpRequestError = {
  errors: Error[]
}
