import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/dbUtils";
import { AgentDetails } from "@/types/PropsTypes";


const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { database, page = 1, limit = 10, search = '' } = req.query;

  if (!database) {
    return res.status(400).json({ status: "Database name is required" });
  }

  try {
    const client = await connectToDatabase();
    const db = client.db(database as string);
    const collection = db.collection("agents");

    const skip = (+page - 1) * +limit;

    let query = {};
    if (search) {
      query = {
        $or: [
          { username: { $regex: search, $options: 'i' } },
          { first_name: { $regex: search, $options: 'i' } },
          { last_name: { $regex: search, $options: 'i' } },
          { project: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const agents = await collection
      .find(query, { projection: { _id: 1, username: 1, first_name: 1, last_name: 1, project: 1 } })
      .skip(skip)
      .limit(+limit)
      .toArray();

    const totalAgents = await collection.countDocuments(query);

    const formattedAgents: AgentDetails[] = agents.map((agent) => ({
      _id: agent._id.toString(),
      username: agent.username,
      first_name: agent.first_name,
      last_name: agent.last_name,
      project: agent.project,
    }));

    res.status(200).json({ agents: formattedAgents, totalAgents });
  } catch (error) {
    console.error("Error fetching agents:", error);
    res
      .status(500)
      .json({ status: `Error fetching agents: ${(error as Error).message}` });
  }
};

export default handler;
