import { VippsPaymentStatus, VippsPaymentType } from "./types";

export type CompResponse = {
  id: string,
  name: string,
  start_date: string,
  end_date: string,
  registration_open: string,
  registration_close: string,
  competitor_limit: number,
  cancelled_at: null,
  url: string,
  website: string,
  short_name: string,
  city: string,
  venue_address: string,
  venue_details: string,
  latitude_degrees: number,
  longitude_degrees: number,
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
    avatar: {
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

export type BrregResponse = {
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

export type WCAResponse<T> = {
  pagination: {
    page: number,
    size: number
  },
  total: 10,
  items: T[],
};

export type WCAEvent = {
  id: string,
  name: string,
  format: string,
};

export type WCARecord = {
  rankType: string,
  personId: string,
  eventId: string,
  best: number,
  rank: {
    world: number,
    continent: number,
    country: number,
  },
};

export type GoogleSheetsRecords = {
  values: string[][]
};

export type WCAOAuthTokenResponse = {
  access_token: string,
  refresh_token: string,
  token_type: string,
  expires_in: number,
  scope: string,
  created_at: number
};

export type WCAProfileResponse = {
  me: {
    id: number,
    wca_id: string | null,
    name: string,
    gender: string,
    country_iso2: string,
    created_at: string,
    updated_at: string,
    url: string,
    country: {
      id: string,
      name: string,
      continent_id: string,
      iso2: string,
    },
    delegate_status: string | null,
    class: string,
    teams: string[],
    avatar: {
      id: number,
      status: string,
      thumbnail_crop_x: string | null,
      thumbnail_crop_y: string | null,
      thumbnail_crop_w: string | null,
      thumbnail_crop_h: string | null,
      url: string | null,
      thumb_url: string | null,
      is_default: boolean,
      can_edit_thumbnail: boolean,
    },
    dob: string,
    email: string,
  }
};

export type VippsAccessTokenResponse = {
  token_type: string,
  expires_in: number,
  ext_expires_in: number,
  expires_on: number,
  not_before: number,
  resource: string,
  access_token: string,
}

export type VippsPaymentCreateReponse = {
  redirectUrl: string,
  reference: string,
}

export type VippsPaymentStatusReponse = {
  aggregate: {
    authorizedAmount: {
      currency: "NOK",
      value: number
    },
    cancelledAmount: {
      currency: "NOK",
      value: number
    },
    capturedAmount: {
      currency: "NOK",
      value: number
    },
    refundedAmount: {
      currency: "NOK",
      value: number
    }
  },
  amount: {
    currency: "NOK",
    value: number
  },
  state: VippsPaymentStatus,
  paymentMethod: {
    type: VippsPaymentType,
    cardBin: string,
  },
  profile: {
    sub: string,
  },
  pspReference: string,
  redirectUrl: string,
  reference: string,
  metadata: Record<string, string>,
  shippingDetails: {
    address: {
      addressLine1: string,
      addressLine2: string,
      city: string,
      country: string,
      postCode: string,
    },
    shippingCost: number,
    shippingOptionId: string,
    shippingOptionName: string,
  },
  userDetails: {
    email: string,
    firstName: string,
    lastName: string,
    mobileNumber: string,
    dateOfBirth: string,
    addresses:
    {
      addressLine1: string,
      addressLine2: string,
      city: string,
      country: string,
      postCode: string,
    }[],
  }
}
