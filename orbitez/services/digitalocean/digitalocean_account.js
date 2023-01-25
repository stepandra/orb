import dedent from "dedent";
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
        assignedSubdomain,
    }) {
        console.time("activeServer");
        console.time("servingServer");
        const keyPair = await crypto.generateKeyPair();
        const installCommand = getInstallScript(
            this.digitalOcean.accessToken,
            shouldDeployNode,
            contractAddress,
            roomName,
            assignedSubdomain
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

echo "true" | cloud::add_encoded_kv_tag "install-started"`;

const TEZOS_NODE_DEPLOY = dedent`
    sudo add-apt-repository -yu ppa:serokell/tezos
    sudo apt-get install -y tezos-baking
    echo "true" | cloud::add_encoded_kv_tag "tez-node-install-started"
    yes $'1\n2\n1\n1\n1' | tezos-setup

    if [ $? -eq 0 ]; then
        echo true
    else
        echo false
    fi | cloud::add_encoded_kv_tag "tez-node-ready"
`;

function getInstallScript(
    accessToken,
    shouldDeployNode,
    contractAddress,
    roomName,
    assignedSubdomain,
) {
    const sanitizedAccessToken = sanitizeDigitalOceanToken(accessToken);
    return dedent`
    #!/bin/bash
    exec &> "./install-shadowbox-output"
    export DO_ACCESS_TOKEN="${sanitizedAccessToken}"
    readonly DO_METADATA_URL="http://169.254.169.254/metadata/v1"
    ${TAG_FUNCS_SH}

    echo ${assignedSubdomain} | cloud::add_encoded_kv_tag "assigned-subdomain"
    echo ${roomName} | cloud::add_encoded_kv_tag "room-name"

    ${shouldDeployNode ? `echo "true" | cloud::add_encoded_kv_tag "tez-node"` : ""}

    apt-get update && apt-get -y install nginx
    snap install --classic certbot

    docker run --name orbitez-server --env CONTRACT_ADDRESS=${contractAddress} --env SERVER_NAME=${roomName} -d -p 8080:8080 -p 88:88 orbitez/orb-game-server-main:latest

    if [ $? -eq 0 ]; then
        echo true
    else
        echo false
    fi | cloud::add_encoded_kv_tag "docker-container-started"

    ${getSetupReverseProxyAndSSLScript(assignedSubdomain, shouldDeployNode)}

    ${shouldDeployNode ? TEZOS_NODE_DEPLOY : ""}
    `;
}

const getSetupServerBlocksAndProxyScript = (serverData) => {
    const { domainName, port } = serverData;

    return dedent`
    mkdir -p /var/www/${domainName}/html
    chown -R $USER:$USER /var/www/${domainName}/html
    chmod -R 755 /var/www/${domainName}
    cat > /etc/nginx/sites-available/${domainName} <<EOF
    server {
        server_name ${domainName};

        access_log /var/log/nginx/${domainName}.access.log;

        location / {
            proxy_http_version 1.1;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection \$connection_upgrade;

            proxy_pass http://localhost:${port};
            proxy_read_timeout 90;

            proxy_redirect http://localhost:${port} https://${domainName};
        }
    }

    EOF
    sudo ln -s /etc/nginx/sites-available/${domainName} /etc/nginx/sites-enabled/`
};

// Connect via ssh to DO instance and run this script to install ...
// .. Let's Encrypt Certificate and setup NGINX reverse proxy
const getSetupReverseProxyAndSSLScript = (assignedSubdomain, shouldDeployNode) => {
    const baseDomainName = `${assignedSubdomain}.orbitez.io`;

    const gameServer = {
        domainName: `server.${baseDomainName}`,
        port: '8080'
    };
    const statsServer = {
        domainName: `stats.${baseDomainName}`,
        port: '88'
    };
    const tezNode = {
        domainName: `rpc.${baseDomainName}`,
        port: '8732'
    };

    return dedent`
    sudo ln -s /snap/bin/certbot /usr/bin/certbot
    sudo ufw allow 'Nginx Full'
    ${getSetupServerBlocksAndProxyScript(gameServer)}
    ${getSetupServerBlocksAndProxyScript(statsServer)}
    ${shouldDeployNode ? getSetupServerBlocksAndProxyScript(tezNode) : ""}
    sed -i 's/# server_names_hash_bucket_size 64/server_names_hash_bucket_size 128/' /etc/nginx/nginx.conf
    cat << EOF | sed -i '/^http {$/ r /dev/stdin' /etc/nginx/nginx.conf

    map \$http_upgrade \$connection_upgrade {
        default upgrade;
        ''      close;
    }

    EOF
    systemctl restart nginx

    if [ $? -eq 0 ]; then
        echo true
    else
        echo false
    fi | cloud::add_encoded_kv_tag "nginx-ready"

    until ip addr | grep -q $(host -t A ${gameServer.domainName} | awk '{print $NF}') 2>/dev/null
    do
        echo 'Waiting for DNS records'
        sleep 30
    done

    echo "true" | cloud::add_encoded_kv_tag "dns-records-available"

    certbot -n --nginx --agree-tos -d ${gameServer.domainName} --register-unsafely-without-email --redirect &&
    certbot -n --nginx --agree-tos -d ${statsServer.domainName} --register-unsafely-without-email --redirect ${shouldDeployNode ? '&&' : '' }
    ${shouldDeployNode ?
        `certbot -n --nginx --agree-tos -d ${tezNode.domainName} --register-unsafely-without-email --redirect` :
        ''
    }

    if [ $? -eq 0 ]; then
        echo true
    else
        echo false
    fi | cloud::add_encoded_kv_tag "ssl-ready"`;
};
