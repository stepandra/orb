import * as errors from './infra/errors';

// Converts the access key JSON from the API to its model.
function makeAccessKeyModel(apiAccessKey) {
  return apiAccessKey;
}

export class OrbitezServer {
  managementApiAddress;
  serverConfig;

  constructor(id) {
    this.id = id
  }

  getId() {
    return this.id;
  }

  listAccessKeys() {
    console.info('Listing access keys');
    return this.apiRequest('access-keys').then((response) => {
      return response.accessKeys.map(makeAccessKeyModel);
    });
  }

  async addAccessKey() {
    console.info('Adding access key');
    return makeAccessKeyModel(
      await this.apiRequest<AccessKeyJson>('access-keys', {method: 'POST'})
    );
  }

  renameAccessKey(accessKeyId, name) {
    console.info('Renaming access key');
    const body = new FormData();
    body.append('name', name);
    return this.apiRequest('access-keys/' + accessKeyId + '/name', {method: 'PUT', body});
  }

  removeAccessKey(accessKeyId) {
    console.info('Removing access key');
    return this.apiRequest('access-keys/' + accessKeyId, {method: 'DELETE'});
  }

  async setDefaultDataLimit(limit) {
    console.info(`Setting server default data limit: ${JSON.stringify(limit)}`);
    const requestOptions = {
      method: 'PUT',
      headers: new Headers({'Content-Type': 'application/json'}),
      body: JSON.stringify({limit}),
    };
    await this.apiRequest(this.getDefaultDataLimitPath(), requestOptions);
    this.serverConfig.accessKeyDataLimit = limit;
  }

  async removeDefaultDataLimit() {
    console.info(`Removing server default data limit`);
    await this.apiRequest(this.getDefaultDataLimitPath(), {method: 'DELETE'});
    delete this.serverConfig.accessKeyDataLimit;
  }

  getDefaultDataLimit() {
    return this.serverConfig.accessKeyDataLimit;
  }

  getDefaultDataLimitPath() {
    const version = this.getVersion();
    // if (semver.gte(version, '1.4.0')) {
    //   // Data limits became a permanent feature in shadowbox v1.4.0.
    //   return 'server/access-key-data-limit';
    // }
    return 'experimental/access-key-data-limit';
  }

  async setAccessKeyDataLimit(keyId, limit) {
    console.info(`Setting data limit of ${limit.bytes} bytes for access key ${keyId}`);
    const requestOptions = {
      method: 'PUT',
      headers: new Headers({'Content-Type': 'application/json'}),
      body: JSON.stringify({limit}),
    };
    await this.apiRequest(`access-keys/${keyId}/data-limit`, requestOptions);
  }

  async removeAccessKeyDataLimit(keyId) {
    console.info(`Removing data limit from access key ${keyId}`);
    await this.apiRequest(`access-keys/${keyId}/data-limit`, {method: 'DELETE'});
  }

  async getDataUsage(){
    const jsonResponse = await this.apiRequest<DataUsageByAccessKeyJson>('metrics/transfer');
    const usageMap = new Map();
    for (const [accessKeyId, bytes] of Object.entries(jsonResponse.bytesTransferredByUserId)) {
      usageMap.set(accessKeyId, bytes ?? 0);
    }
    return usageMap;
  }

  getName() {
    return this.serverConfig?.name;
  }

  setName(name) {
    console.info('Setting server name');
    const requestOptions = {
      method: 'PUT',
      headers: new Headers({'Content-Type': 'application/json'}),
      body: JSON.stringify({name}),
    };
    return this.apiRequest('name', requestOptions).then(() => {
      this.serverConfig.name = name;
    });
  }

  getVersion() {
    return this.serverConfig.version;
  }

  getMetricsEnabled() {
    return this.serverConfig.metricsEnabled;
  }

  setMetricsEnabled(metricsEnabled) {
    const action = metricsEnabled ? 'Enabling' : 'Disabling';
    console.info(`${action} metrics`);
    const requestOptions = {
      method: 'PUT',
      headers: new Headers({'Content-Type': 'application/json'}),
      body: JSON.stringify({metricsEnabled}),
    };
    return this.apiRequest('metrics/enabled', requestOptions).then(() => {
      this.serverConfig.metricsEnabled = metricsEnabled;
    });
  }

  getMetricsId() {
    return this.serverConfig.serverId;
  }

  isHealthy(timeoutMs = 30000) {
    return new Promise((fulfill, _reject) => {
      // Query the API and expect a successful response to validate that the
      // service is up and running.
      this.getServerConfig().then(
        (serverConfig) => {
          this.serverConfig = serverConfig;
          fulfill(true);
        },
        (_e) => {
          fulfill(false);
        }
      );
      // Return not healthy if API doesn't complete within timeoutMs.
      setTimeout(() => {
        fulfill(false);
      }, timeoutMs);
    });
  }

  getCreatedDate() {
    return new Date(this.serverConfig.createdTimestampMs);
  }

  async setHostnameForAccessKeys(hostname) {
    console.info(`setHostname ${hostname}`);
    this.serverConfig.hostnameForAccessKeys = hostname;
    const requestOptions = {
      method: 'PUT',
      headers: new Headers({'Content-Type': 'application/json'}),
      body: JSON.stringify({hostname}),
    };
    return this.apiRequest('server/hostname-for-access-keys', requestOptions).then(() => {
      this.serverConfig.hostnameForAccessKeys = hostname;
    });
  }

  getHostnameForAccessKeys() {
    try {
      return (
        this.serverConfig?.hostnameForAccessKeys ?? new URL(this.managementApiAddress).hostname
      );
    } catch (e) {
      return '';
    }
  }

  getPortForNewAccessKeys() {
    try {
      if (typeof this.serverConfig.portForNewAccessKeys !== 'number') {
        return undefined;
      }
      return this.serverConfig.portForNewAccessKeys;
    } catch (e) {
      return undefined;
    }
  }

  setPortForNewAccessKeys(newPort) {
    console.info(`setPortForNewAccessKeys: ${newPort}`);
    const requestOptions = {
      method: 'PUT',
      headers: new Headers({'Content-Type': 'application/json'}),
      body: JSON.stringify({port: newPort}),
    };
    return this.apiRequest('server/port-for-new-access-keys', requestOptions).then(() => {
      this.serverConfig.portForNewAccessKeys = newPort;
    });
  }

  async getServerConfig() {
    console.info('Retrieving server configuration');
    return await this.apiRequest<ServerConfigJson>('server');
  }

  setManagementApiUrl(apiAddress) {
    this.managementApiAddress = apiAddress;
  }

  getManagementApiUrl() {
    return this.managementApiAddress;
  }

  // Makes a request to the management API.
  apiRequest(path, options){
    try {
      let apiAddress = this.managementApiAddress;
      if (!apiAddress) {
        const msg = 'Management API address unavailable';
        console.error(msg);
        throw new Error(msg);
      }
      if (!apiAddress.endsWith('/')) {
        apiAddress += '/';
      }
      const url = apiAddress + path;
      return fetch(url, options)
        .then(
          (response) => {
            if (!response.ok) {
              throw new errors.ServerApiError(
                `API request to ${path} failed with status ${response.status}`,
                response
              );
            }
            return response.text();
          },
          (_error) => {
            throw new errors.ServerApiError(`API request to ${path} failed due to network error`);
          }
        )
        .then((body) => {
          if (!body) {
            return;
          }
          return JSON.parse(body);
        });
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
