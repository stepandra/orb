import { DigitalOceanAccount } from "../../services/digitalocean/digitalocean_account";
import { Region } from "../../services/digitalocean/model/digitalocean";

export default function handler(req, res) {
    const { token, deployTezos, region, contractAddress, roomName } = req.body;
    const doAccount = new DigitalOceanAccount("do_account", token, true);
    doAccount.createServer({
        region: new Region(region),
        name: "ORBITEZ_TEZ_NODE",
        shouldDeployNode: deployTezos,
        contractAddress,
        roomName,
    });

    res.send({ success: true });
}
