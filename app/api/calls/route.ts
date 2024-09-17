import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/dbUtils";
import { CallDetails } from "@/types/PropsTypes";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const database = searchParams.get("database");
  const username = searchParams.get("username");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const search = searchParams.get("search") || "";

  console.log("Received GET request with params:", {
    database,
    username,
    page,
    limit,
    search,
  });

  if (!database) {
    console.error("Invalid database parameter");
    return NextResponse.json(
      { error: "Database name is required" },
      { status: 400 }
    );
  }

  try {
    console.log("Connecting to database:", database);
    const client = await connectToDatabase();
    const db = client.db(database);
    const collection = db.collection("calls");

    let query: any = {};
    if (username) {
      query["agent_info.username"] = username;
    }
    if (search) {
      query.$or = [
        { phone_number: { $regex: search, $options: "i" } },
        { "agent_info.username": { $regex: search, $options: "i" } },
        { status: { $regex: search, $options: "i" } },
      ];
    }

    const calls = await collection
      .find(query)
      .sort({ day_processed: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    const formattedCalls: CallDetails[] = calls.map((doc) => ({
      _id: doc._id.toString(),
      project_id: doc.project_id,
      filename: doc.filename,
      phone_number: doc.phone_number,
      agent_info: doc.agent_info,
      score: doc.score,
      file_info: {
        extension: doc.file_info.extension,
        duration: doc.file_info.duration,
        day: doc.file_info.day,
        file_path: doc.file_info.file_path,
      },
      segments: doc.segments || [],
      day_processed: doc.day_processed,
      average_sentiment: doc.average_sentiment || 0,
      crosstalk_duration: doc.crosstalk_duration || 0,
      total_dead_air_duration: {
        SPEAKER_00: doc.total_dead_air_duration?.SPEAKER_00 || 0,
        SPEAKER_01: doc.total_dead_air_duration?.SPEAKER_01 || 0,
      },
      total_talk_duration: {
        SPEAKER_00: doc.total_talk_duration?.SPEAKER_00 || 0,
        SPEAKER_01: doc.total_talk_duration?.SPEAKER_01 || 0,
      },
      status: doc.status as CallDetails["status"],
      call_summary: doc.call_summary || "",
    }));

    const totalCalls = await collection.countDocuments(query);

    console.log(
      `Returning ${formattedCalls.length} calls out of ${totalCalls} total`
    );
    return NextResponse.json({ calls: formattedCalls, totalCalls });
  } catch (error) {
    console.error("Error processing GET request:", error);
    return NextResponse.json(
      {
        error: `Error processing request: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const database = searchParams.get("database");
  const id = searchParams.get("id");

  console.log("Received DELETE request with params:", { database, id });

  if (!database) {
    console.error("Invalid database parameter");
    return NextResponse.json(
      { error: "Database name is required" },
      { status: 400 }
    );
  }

  if (!id) {
    console.error("Missing call ID for deletion");
    return NextResponse.json(
      { error: "Call ID is required for deletion" },
      { status: 400 }
    );
  }

  try {
    console.log("Connecting to database:", database);
    const client = await connectToDatabase();
    const db = client.db(database);
    const collection = db.collection("calls");

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      console.log(`Call with ID ${id} not found for deletion`);
      return NextResponse.json({ error: "Call not found" }, { status: 404 });
    }

    console.log(`Successfully deleted call with ID ${id}`);
    return NextResponse.json({ message: "Call deleted successfully" });
  } catch (error) {
    console.error("Error processing DELETE request:", error);
    return NextResponse.json(
      {
        error: `Error processing request: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const database = searchParams.get("database");

  console.log("Received POST request with database:", database);

  if (!database) {
    console.error("Invalid database parameter");
    return NextResponse.json(
      { error: "Database name is required" },
      { status: 400 }
    );
  }

  try {
    const callData = await request.json();

    if (!callData) {
      console.error("Missing call data in POST request");
      return NextResponse.json({ error: "Missing call data" }, { status: 400 });
    }

    console.log("Received call data:", JSON.stringify(callData, null, 2));

    console.log("Connecting to database:", database);
    const client = await connectToDatabase();
    const db = client.db(database);
    const collection = db.collection("calls");

    const enhancedCallData = {
      ...callData,
      day_processed: new Date().toISOString(),
      status: callData.status || "new",
      score: callData.score || 0,
      average_sentiment: callData.average_sentiment || 0,
      crosstalk_duration: callData.crosstalk_duration || 0,
      total_dead_air_duration: callData.total_dead_air_duration || {
        SPEAKER_00: 0,
        SPEAKER_01: 0,
      },
      total_talk_duration: callData.total_talk_duration || {
        SPEAKER_00: 0,
        SPEAKER_01: 0,
      },
    };

    const result = await collection.insertOne(enhancedCallData);

    console.log(`Successfully added new call with ID ${result.insertedId}`);
    return NextResponse.json({
      message: "Call added successfully",
      id: result.insertedId,
    });
  } catch (error) {
    console.error("Error processing POST request:", error);
    return NextResponse.json(
      {
        error: `Error processing request: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
