import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/dbUtils";
import { ObjectId } from "mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url);
  const database = searchParams.get("database");
  const id = params.id;

  if (!database) {
    return NextResponse.json(
      { message: "Database parameter is required" },
      { status: 400 }
    );
  }

  try {
    const client = await connectToDatabase();
    const db = client.db(database);
    const agentsCollection = db.collection("agents");

    const agent = await agentsCollection.findOne({ _id: new ObjectId(id) });

    if (!agent) {
      return NextResponse.json({ message: "Agent not found" }, { status: 404 });
    }

    const agentDetails = {
      ...agent,
      _id: agent._id.toString(),
    };

    return NextResponse.json(agentDetails);
  } catch (error) {
    console.error("Error fetching agent details:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
