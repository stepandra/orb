import addBot from "@services/addBot/addBot";

export default async function handler(req, res) {
    const { query, method } = req;
    const { serverName } = query;

    if (method !== "POST") {
        res.setHeader("Allow", "POST");
        res.status(405).end(`Method ${method} Not Allowed`);
        return;
    }

    console.log(`Requesting a bot addition for server ${serverName}`);
    try {
        const operationHash = await addBot(serverName);
        res.status(201).json({ operationHash });
        console.log(`Successfully added a bot for server ${serverName}`);
    } catch (error) {
        res.status(error.status).json(error.json);
        console.log(`Error adding a bot, for server ${serverName}. Status: ${error.status}, ${JSON.stringify(error.json)}`);
    }
}
