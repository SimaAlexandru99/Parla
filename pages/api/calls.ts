import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/dbUtils";
import { CallDetails } from "@/types/PropsTypes";
import { ObjectId } from "mongodb";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { database, id, username, page = 1, limit = 10, search = '' } = req.query;

  if (!database) {
    return res.status(400).json({ status: "Database name is required" });
  }

  try {
    const client = await connectToDatabase();
    const db = client.db(database as string);
    const collection = db.collection("calls");

    if (req.method === "GET") {
      let query: any = {};
      if (username) {
        query["agent_info.username"] = username;
      }
      if (search) {
        query.$or = [
          { phone_number: { $regex: search, $options: 'i' } },
          { "agent_info.username": { $regex: search, $options: 'i' } },
          { status: { $regex: search, $options: 'i' } }
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
        phone_number: doc.phone_number,
        agent_info: doc.agent_info,
        score: doc.score,
        file_info: {
          duration: doc.file_info.duration,
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
        status: doc.status,
        call_summary: doc.call_summary || "",
      }));

      const totalCalls = await collection.countDocuments(query);

      res.status(200).json({ calls: formattedCalls, totalCalls });
    } else if (req.method === "DELETE") {
      // ... (keep the DELETE method as is)
    } else {
      res.setHeader("Allow", ["GET", "DELETE"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({
      status: `Error processing request: ${(error as Error).message}`,
    });
  }
};

export default handler;