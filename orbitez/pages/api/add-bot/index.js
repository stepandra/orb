export default async function handler(req, res) {
    const { method } = req;

    if (method !== "POST") {
        res.setHeader("Allow", "POST");
        res.status(405).end(`Method ${method} Not Allowed`);
    }

    res.status(400).json({ error: "Provide a 'serverName' path parameter" });
}
