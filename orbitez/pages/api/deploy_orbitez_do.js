import { DigitalOceanAccount } from "../../services/digitalocean/digitalocean_account";
import { Region } from "../../services/digitalocean/model/digitalocean";
import sum from "hash-sum";

export default async function handler(req, res) {
    const { token, deployTezos, region, contractAddress, roomName } = req.body;

    // Matching only "a-z A-Z 0-9" and "-" character if it is surrounded...
    // .. by "a-z A-Z 0-9"
    const sanitizedRoomName = roomName.match(/[\w\d]-[\w\d]|[\w\d]/g).join('');

    // Generating subdomain name for server's url
    const hash = sum(Date.now().toString() + roomName);
    const assignedSubdomain = `${roomName}-${hash}`.toLowerCase();

    const doAccount = new DigitalOceanAccount("do_account", token, true);
    await doAccount.createServer({
        region: new Region(region),
        name: "ORBITEZ_TEZ_NODE",
        shouldDeployNode: deployTezos,
        contractAddress,
        sanitizedRoomName,
        assignedSubdomain,
    });

    res.send({ success: true });
}
