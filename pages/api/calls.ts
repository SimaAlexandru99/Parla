import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/dbUtils";
import { CallDetails } from "@/types/PropsTypes";
import { ObjectId } from "mongodb";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const {
    database,
    username,
    page = 1,
    limit = 10,
    search = "",
    id,
  } = req.query;

  console.log("Received request with params:", {
    database,
    username,
    page,
    limit,
    search,
    id,
  });

  if (!database || typeof database !== "string") {
    console.error("Invalid database parameter");
    return res
      .status(400)
      .json({ error: "Database name is required and must be a string" });
  }

  try {
    console.log("Connecting to database:", database);
    const client = await connectToDatabase();
    const db = client.db(database);
    const collection = db.collection("calls");

    if (req.method === "GET") {
      console.log("Processing GET request");
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
        .skip((+page - 1) * +limit)
        .limit(+limit)
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
        status: doc.status as CallDetails['status'], // This ensures only valid statuses are used
        call_summary: doc.call_summary || "",
      }));

      const totalCalls = await collection.countDocuments(query);

      console.log(
        `Returning ${formattedCalls.length} calls out of ${totalCalls} total`
      );
      res.status(200).json({ calls: formattedCalls, totalCalls });
    } else if (req.method === "DELETE") {
      console.log("Processing DELETE request");
      if (!id) {
        console.error("Missing call ID for deletion");
        return res
          .status(400)
          .json({ error: "Call ID is required for deletion" });
      }

      const result = await collection.deleteOne({
        _id: new ObjectId(id as string),
      });

      if (result.deletedCount === 0) {
        console.log(`Call with ID ${id} not found for deletion`);
        return res.status(404).json({ error: "Call not found" });
      }

      console.log(`Successfully deleted call with ID ${id}`);
      res.status(200).json({ message: "Call deleted successfully" });
    } else if (req.method === "POST") {
      console.log("Processing POST request");
      const { callData } = req.body;

      if (!callData) {
        console.error("Missing call data in POST request");
        return res.status(400).json({ error: "Missing call data" });
      }

      console.log("Received call data:", JSON.stringify(callData, null, 2));

      // Add additional fields to callData
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
      res
        .status(200)
        .json({ message: "Call added successfully", id: result.insertedId });
    } else {
      console.warn(`Received unsupported HTTP method: ${req.method}`);
      res.setHeader("Allow", ["GET", "DELETE", "POST"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({
      error: `Error processing request: ${(error as Error).message}`,
    });
  }
};

export default handler;
