import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/dbUtils";
import { ObjectId } from "mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id, database } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (!database || typeof database !== 'string') {
    return res.status(400).json({ message: 'Database parameter is required' });
  }

  try {
    const client = await connectToDatabase();
    const db = client.db(database);
    const agentsCollection = db.collection("agents");

    const agent = await agentsCollection.findOne({ _id: new ObjectId(id as string) });

    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    const agentDetails = {
      ...agent,
      _id: agent._id.toString(),
    };

    res.status(200).json(agentDetails);
  } catch (error) {
    console.error("Error fetching agent details:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
