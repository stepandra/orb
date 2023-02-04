import addBot from "@services/addBot/addBot";

export default async function handler(req, res) {
    const { query, method } = req;
    const { serverName } = query;

    if (method !== "POST") {
        res.setHeader("Allow", "POST");
        res.status(405).end(`Method ${method} Not Allowed`);
        return;
    }

    try {
        const operationHash = await addBot(serverName);
        res.status(201).json({ operationHash });
    } catch (error) {
        res.status(error.status).json(error.json);
    }
}
