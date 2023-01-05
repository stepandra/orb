import { DigitalOceanAccount } from "../../services/digitalocean/digitalocean_account";
import { Region } from "../../services/digitalocean/model/digitalocean";
import sum from "hash-sum";

export default async function handler(req, res) {
    const { token, deployTezos, region, contractAddress, roomName } = req.body;

    // Generating subdomain name for server's url
    const hash = sum(Date.now().toString() + roomName);
    const assignedSubdomain = `${roomName}-${hash}`;

    const doAccount = new DigitalOceanAccount("do_account", token, true);
    await doAccount.createServer({
        region: new Region(region),
        name: "ORBITEZ_TEZ_NODE",
        shouldDeployNode: deployTezos,
        contractAddress,
        roomName,
        assignedSubdomain,
    });

    res.send({ success: true });
}
