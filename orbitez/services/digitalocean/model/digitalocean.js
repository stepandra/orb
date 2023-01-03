import * as location from './location';

// A DigitalOcean Region, e.g. "NYC2".
export class Region {
  static LOCATION_MAP = {
    ams: location.AMSTERDAM,
    blr: location.BANGALORE,
    fra: location.FRANKFURT,
    lon: location.LONDON,
    nyc: location.NEW_YORK_CITY,
    sfo: location.SAN_FRANCISCO,
    sgp: location.SINGAPORE,
    tor: location.TORONTO,
  };
  constructor(id) {
    this.id = id
  }

  get location() {
    return Region.LOCATION_MAP[this.id.substr(0, 3).toLowerCase()];
  }
}