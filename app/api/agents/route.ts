import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/dbUtils";
import { AgentDetails } from "@/types/PropsTypes";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const database = searchParams.get("database");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const search = searchParams.get("search") || "";

  if (!database) {
    return NextResponse.json(
      { error: "Database name is required" },
      { status: 400 }
    );
  }

  try {
    const client = await connectToDatabase();
    const db = client.db(database);
    const collection = db.collection("agents");

    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query = {
        $or: [
          { username: { $regex: search, $options: "i" } },
          { first_name: { $regex: search, $options: "i" } },
          { last_name: { $regex: search, $options: "i" } },
          { project: { $regex: search, $options: "i" } },
        ],
      };
    }

    const agents = await collection
      .find(query, {
        projection: {
          _id: 1,
          username: 1,
          first_name: 1,
          last_name: 1,
          project: 1,
        },
      })
      .skip(skip)
      .limit(limit)
      .toArray();

    const totalAgents = await collection.countDocuments(query);

    const formattedAgents: AgentDetails[] = agents.map((agent) => ({
      _id: agent._id.toString(),
      username: agent.username,
      first_name: agent.first_name,
      last_name: agent.last_name,
      project: agent.project,
    }));

    return NextResponse.json({ agents: formattedAgents, totalAgents });
  } catch (error) {
    console.error("Error fetching agents:", error);
    return NextResponse.json(
      {
        error: `Error fetching agents: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
