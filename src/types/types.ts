 export interface Aircraft{
  id: number;
  model: string;
  created_at: Date;
  updated_at: Date;
}

export interface Error{
  code: string;
  message: string;
}

export interface WikipediaImage{
  title: string;
  url: string;
}
