import { RestApiSession } from "./cloud/digitalocean_api";
import * as crypto from "./infra/crypto";
import * as digitalocean from "./model/digitalocean";

import { DigitalOceanServer } from "./digitalocean_server";

// Tag used to mark Orbitez Droplets.
const ORBITEZ_TAG = "orbitez";
const MACHINE_SIZE = "s-4vcpu-8gb-intel";

export class DOSingleton {
    constructor() {
        throw new Error("Use DOSingleton.getInstance()");
    }

    static getInstance(id, accessToken, debugMode) {
        if (!DOSingleton.instanceMap) {
            DOSingleton.instanceMap = new Map();
        }
        if (!DOSingleton.instanceMap.has(accessToken)) {
            DOSingleton.instanceMap.set(
                accessToken,
                new DigitalOceanAccount(id, accessToken, debugMode)
            );
        }

        return DOSingleton.instanceMap.get(accessToken);
    }
}

export class DigitalOceanAccount {
    digitalOcean;
    servers = [];

    constructor(id, accessToken, debugMode) {
        this.id = id;
        this.debugMode = debugMode;
        this.digitalOcean = new RestApiSession(accessToken);
    }

    getId() {
        return this.id;
    }

    async getName() {
        return (await this.digitalOcean.getAccount())?.email;
    }

    // Return a list of regions indicating whether they are available and support
    // our target machine size.
    async listLocations() {
        const regions = await this.digitalOcean.getRegionInfo();
        return regions.map((info) => ({
            cloudLocation: new digitalocean.Region(info.slug),
            available:
                info.available && info.sizes.indexOf(MACHINE_SIZE) !== -1,
        }));
    }

    // Creates a server and returning it when it becomes active.
    async createServer({
        region,
        name,
        shouldDeployNode,
        contractAddress,
        roomName,
    }) {
        console.time("activeServer");
        console.time("servingServer");
        const keyPair = await crypto.generateKeyPair();
        const installCommand = getInstallScript(
            this.digitalOcean.accessToken,
            shouldDeployNode,
            contractAddress,
            roomName
        );

        const dropletSpec = {
            installCommand,
            size: MACHINE_SIZE,
            image: "docker-18-04",
            tags: [ORBITEZ_TAG],
        };
        if (this.debugMode) {
            // Strip carriage returns, which produce weird blank lines when pasted into a terminal.
            console.debug(
                `private key for SSH access to new droplet:\n${keyPair.private.replace(
                    /\r/g,
                    ""
                )}\n\n` +
                    'Use "ssh -i keyfile root@[ip_address]" to connect to the machine'
            );
        }
        const response = await this.digitalOcean.createDroplet(
            name,
            region.id,
            keyPair.public,
            dropletSpec
        );
        const server = this.createDigitalOceanServer(
            this.digitalOcean,
            response.droplet
        );
        return server;
    }

    listServers() {
        if (this.servers.length) {
            return Promise.resolve(this.servers); // Return the in-memory servers.
        }
        return this.digitalOcean
            .getDropletsByTag(ORBITEZ_TAG)
            .then((droplets) => {
                this.servers = [];
                return droplets.map((droplet) => {
                    return this.createDigitalOceanServer(
                        this.digitalOcean,
                        droplet
                    );
                });
            });
    }

    getAccessToken() {
        return this.accessToken;
    }

    // Creates a DigitalOceanServer object and adds it to the in-memory server list.
    createDigitalOceanServer(digitalOcean, dropletInfo) {
        const server = new DigitalOceanServer(
            `${this.id}:${dropletInfo.id}`,
            digitalOcean,
            dropletInfo
        );
        this.servers.push(server);
        return server;
    }
}

function sanitizeDigitalOceanToken(input) {
    const sanitizedInput = input.trim();
    const pattern = /^[A-Za-z0-9_/-]+$/;
    if (!pattern.test(sanitizedInput)) {
        throw new Error("Invalid DigitalOcean Token");
    }
    return sanitizedInput;
}

// cloudFunctions needs to define cloud::public_ip and cloud::add_tag.
const TAG_FUNCS_SH = `
# Applies a tag to this droplet.
function cloud::add_tag() {
  local -r tag="$1"
  local -ar base_flags=(-X POST -H 'Content-Type: application/json' -H \
   "Authorization: Bearer \${DO_ACCESS_TOKEN}")
  local -r TAGS_URL='https://api.digitalocean.com/v2/tags'
  # Create the tag
  curl "\${base_flags[@]}" -d "{\\"name\\":\\"\${tag}\\"}" "\${TAGS_URL}"
  local droplet_id
  droplet_id="$(curl "\${DO_METADATA_URL}/id")"
  droplet_obj="{\\"resources\\":[{\\"resource_id\\": \\"\${droplet_id}\\",\\"resource_type\\": \\"droplet\\"}]}"
  # Link the tag to this droplet
  curl "\${base_flags[@]}" -d "\${droplet_obj}" "\${TAGS_URL}/\${tag}/resources"
}

function cloud::add_kv_tag() {
  local -r key="$1"
  local value
  value="$(xxd -p -c 255)"
  cloud::add_tag \"kv:\${key}:\${value}\"
}

# Adds a key-value tag where the value is already hex-encoded.
function cloud::add_encoded_kv_tag() {
  local -r key="$1"
  local value
  read -r value
  cloud::add_tag \"kv:\${key}:\${value}\"
}

echo "true" | cloud::add_encoded_kv_tag "install-started"
`;

const TEZOS_NODE_DEPLOY = `
  sudo add-apt-repository -yu ppa:serokell/tezos
  sudo apt-get install -y tezos-baking
  echo "true" | cloud::add_encoded_kv_tag "node_install_started"
  yes $'1\n2\n1\n1\n1' | tezos-setup-wizard
  ngrok http 8732 --log=stdout > ngrok_teznode.log &
  sleep 10
  export TEZ_RPC_URL=$(grep 'addr=http://localhost:8732 url=' ngrok_teznode.log | sed 's/^.*url=https://' | tr -d '"//*.ngrok.io' )
  echo \${TEZ_RPC_URL} | cloud::add_encoded_kv_tag "TEZ_RPC_URL"
  echo "true" | cloud::add_encoded_kv_tag "node_live"
`;

function getInstallScript(
    accessToken,
    shouldDeployNode,
    contractAddress,
    roomName
) {
    const sanitizedAccessToken = sanitizeDigitalOceanToken(accessToken);
    return `#!/bin/bash
    exec &> "./install-shadowbox-output"
    export DO_ACCESS_TOKEN="${sanitizedAccessToken}"
    readonly DO_METADATA_URL="http://169.254.169.254/metadata/v1"
    ${TAG_FUNCS_SH}
    snap install ngrok
    ngrok config add-authtoken 1z8JvuGlnqE3EDHXods2B1qNzP9_6H5x8AiP5wfyRQ158DhR5
    docker run --env CONTRACT_ADDRESS=${contractAddress} --env SERVER_NAME=${roomName} -d -p 8080:8080 -p 88:88 andriiolefirenko/orbitez:latest
    ngrok http 8080 --subdomain=orbitez-server --log=stdout > ngrok.log &
    sleep 15
    ngrok http 88 --subdomain=orbitez-stats --log=stdout > ngrok.log &
    sleep 15
    export NGROK_URL=$(curl -s localhost:4040/api/tunnels | jq .tunnels[0].public_url)
    echo \${NGROK_URL} | tr -d '"https://*.ngrok.io' | cloud::add_encoded_kv_tag "NGROK_URL"
    echo "true" | cloud::add_encoded_kv_tag "ngrok_ready"
    ${shouldDeployNode ? TEZOS_NODE_DEPLOY : ""}
    `;
}
