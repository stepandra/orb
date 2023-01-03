import * as errors from '../infra/errors';
import axios from 'axios';

export class XhrError extends errors.OutlineError {
  constructor() {
    super();
  }
}

export class RestApiSession {
  constructor(token){
    this.accessToken = token
  }

  getAccount() {
    console.info('Requesting account');
    return this.request('GET', 'account').then((response) => {
      return response.account;
    });
  }

  createDroplet(
    displayName,
    region,
    publicKeyForSSH,
    dropletSpec
  ) {
    const dropletName = makeValidDropletName(displayName);
    // Register a key with DigitalOcean, so the user will not get a potentially
    // confusing email with their droplet password, which could get mistaken for
    // an invite.
    console.log("PUBLICK KEY", publicKeyForSSH)
    return this.registerKey_(dropletName, publicKeyForSSH).then((keyId) => {
      return this.makeCreateDropletRequest(dropletName, region, keyId, dropletSpec);
    });
  }

  makeCreateDropletRequest(
    dropletName,
    region,
    keyId,
    dropletSpec
  ) {
    let requestCount = 0;
    const MAX_REQUESTS = 10;
    const RETRY_TIMEOUT_MS = 5000;
    return new Promise((fulfill, reject) => {
      const makeRequestRecursive = () => {
        ++requestCount;
        console.info(`Requesting droplet creation ${requestCount}/${MAX_REQUESTS}`);
        this.request('POST', 'droplets', {
          name: dropletName,
          region,
          size: dropletSpec.size,
          image: dropletSpec.image,
          ssh_keys: [keyId],
          user_data: dropletSpec.installCommand,
          tags: dropletSpec.tags,
          ipv6: true,
        })
          .then(fulfill)
          .catch((e) => {
            if (e.message.toLowerCase().indexOf('finalizing') >= 0 && requestCount < MAX_REQUESTS) {
              // DigitalOcean is still validating this account and may take
              // up to 30 seconds.  We can retry more frequently to see when
              // this error goes away.
              setTimeout(makeRequestRecursive, RETRY_TIMEOUT_MS);
            } else {
              reject(e);
            }
          });
      };
      makeRequestRecursive();
    });
  }

  deleteDroplet(dropletId) {
    console.info('Requesting droplet deletion');
    return this.request('DELETE', 'droplets/' + dropletId);
  }

  getRegionInfo() {
    console.info('Requesting region info');
    return this.request('GET', 'regions').then((response) => {
      return response.regions;
    });
  }

  // Registers a SSH key with DigitalOcean.
  registerKey_(keyName, publicKeyForSSH) {
    console.info('Requesting key registration');
    return this.request('POST', 'account/keys', {
      name: keyName,
      public_key: publicKeyForSSH,
    }).then((response) => {
      return response.ssh_key.id;
    });
  }

  getDroplet(dropletId) {
    console.info('Requesting droplet');
    return this.request('GET', 'droplets/' + dropletId).then((response) => {
      return response.droplet;
    });
  }

  getDropletTags(dropletId) {
    return this.getDroplet(dropletId).then((droplet) => {
      return droplet.tags;
    });
  }

  getDropletsByTag(tag) {
    console.info('Requesting droplet by tag', tag);
    return this.request(
      'GET',
      `droplets?tag_name=${encodeURI(tag)}`
    ).then((response) => {
      return response.droplets;
    });
  }

  getDroplets() {
    console.info('Requesting droplets');
    return this.request('GET', 'droplets').then((response) => {
      return response.droplets;
    });
  }

  // Makes an XHR request to DigitalOcean's API, returns a promise which fulfills
  // with the parsed object if successful.
  request(method, actionPath, data) {
    return new Promise(async (resolve, reject) => {
      const url = `https://api.digitalocean.com/v2/${actionPath}`;
      try {
        let response = await axios({
          method,
          url,
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          },
          data
        })

        if (response.status >= 200 && response.status <= 299) {
            // Parse JSON response if available.  For requests like DELETE
            // this.response may be empty.
            console.log(response.data)
            const responseObj = response.data ? response.data : {};
            resolve(responseObj);
          } else if (response.status === 401) {
            console.error('DigitalOcean request failed with Unauthorized error');
            reject(new XhrError());
          } else {
            // this.response is a JSON object, whose message is an error string.
            const responseJson = response.data;
            console.error(`DigitalOcean request failed with status ${response.status}`);
            reject(
              new Error(`XHR ${responseJson.id} failed with ${response.status}: ${responseJson.message}`)
            );
          }
        } catch (e) {
          console.log(e)
        }
    });
  }
}

// Removes invalid characters from input name so it can be used with
// DigitalOcean APIs.
function makeValidDropletName(name) {
  // Remove all characters outside of A-Z, a-z, 0-9 and '-'.
  return name.replace(/[^A-Za-z0-9-]/g, '');
}
