
export type compResponse = { 
  id: string, 
  name: string,
  start_date: string, 
  end_date: string, 
  competitor_limit: number, 
  cancelled_at: null, 
  url: string, 
  website: string,
  short_name: string, 
  city: string, 
  venue_address:string,
  venue_details: string, 
  latitude_degrees:number, 
  longitude_degrees:number, 
  country_iso2: string,
  event_ids: Array<string | number>,
  delegates: [{
    id: number,
    name: string,
    delegate_status: string,
    wca_id: string,
    gender: string,
    country_iso2: string,
    url: string,
    country: {
      id: string,
      name: string,
      continentId: string,
      iso2: string
    },
    email: string,
    region: string,
    senior_delegate_id: number,
    class: string,
    teams: [],
    avata: {
      url: string,
      pending_url: string,
      thumb_url: string,
      is_default: boolean
    }
  }],
  organizers: [{
    id: number,
    name: string,
    delegate_status: null,
    wca_id: null,
    gender: string,
    country_iso2: string,
    url: string,
    country: {
      id: string,
      name: string,
      continentId: string,
      iso2: string
    },
    class: string,
    teams: [],
    avatar: {
      url: string,
      pending_url: string,
      thumb_url: string,
      is_default: true
    }
  }],
  class: string
};

export type brregResponse = {
  type: {
    _links: {
      self: {
        href: string
      },
    },
    beskrivelse: string,
    kode: string,
  },
  person: {
    navn: {
      fornavn: string, 
      mellomnavn: string, 
      etternavn: string,
    }, 
    erDoed: boolean, 
    fodselsdato: string
  }, 
  fratraadt: boolean, 
  rekkefolge: number,
};

export type pagePaths = [
  {name: string, path: string},
  {name: string, path: string},
  {name: string, path: string},
  {name: string, path: string},
  {name: string, path: string},
  {name: string, path: string},
  {name: string, path: string},
  {name: string, path: string}
];
