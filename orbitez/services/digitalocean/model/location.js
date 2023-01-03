export class GeoLocation {
  constructor(id, countryCode) {
    this.id = id
    this.countryCode = countryCode
  }

  countryIsRedundant() {
    return this.countryCode === this.id;
  }
}

export const AMSTERDAM = new GeoLocation('amsterdam', 'NL');
export const NORTHERN_VIRGINIA = new GeoLocation('northern-virginia', 'US');
export const BANGALORE = new GeoLocation('bangalore', 'IN');
export const IOWA = new GeoLocation('iowa', 'US');
export const CHANGHUA_COUNTY = new GeoLocation('changhua-county', 'TW');
export const DELHI = new GeoLocation('delhi', 'IN');
export const EEMSHAVEN = new GeoLocation('eemshaven', 'NL');
export const FRANKFURT = new GeoLocation('frankfurt', 'DE');
export const HAMINA = new GeoLocation('hamina', 'FI');
export const HONG_KONG = new GeoLocation('HK', 'HK');
export const JAKARTA = new GeoLocation('jakarta', 'ID');
export const JURONG_WEST = new GeoLocation('jurong-west', 'SG');
export const LAS_VEGAS = new GeoLocation('las-vegas', 'US');
export const LONDON = new GeoLocation('london', 'GB');
export const LOS_ANGELES = new GeoLocation('los-angeles', 'US');
export const OREGON = new GeoLocation('oregon', 'US');
export const MELBOURNE = new GeoLocation('melbourne', 'AU');
export const MONTREAL = new GeoLocation('montreal', 'CA');
export const MUMBAI = new GeoLocation('mumbai', 'IN');
export const NEW_YORK_CITY = new GeoLocation('new-york-city', 'US');
export const SAN_FRANCISCO = new GeoLocation('san-francisco', 'US');
export const SINGAPORE = new GeoLocation('SG', 'SG');
export const OSAKA = new GeoLocation('osaka', 'JP');
export const SAO_PAULO = new GeoLocation('sao-paulo', 'BR');
export const SALT_LAKE_CITY = new GeoLocation('salt-lake-city', 'US');
export const SEOUL = new GeoLocation('seoul', 'KR');
export const ST_GHISLAIN = new GeoLocation('st-ghislain', 'BE');
export const SYDNEY = new GeoLocation('sydney', 'AU');
export const SOUTH_CAROLINA = new GeoLocation('south-carolina', 'US');
export const TOKYO = new GeoLocation('tokyo', 'JP');
export const TORONTO = new GeoLocation('toronto', 'CA');
export const WARSAW = new GeoLocation('warsaw', 'PL');
export const ZURICH = new GeoLocation('zurich', 'CH');