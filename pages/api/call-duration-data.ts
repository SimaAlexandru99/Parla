// pages/api/call-duration-data.ts
import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/dbUtils";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { database, startDate, endDate } = req.query;

    if (!database || !startDate || !endDate) {
      return res.status(400).json({ error: "Missing database, startDate, or endDate" });
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    const client = await connectToDatabase();
    const db = client.db(database as string);
    const collection = db.collection("calls");

    const records = await collection
      .find({
        day_processed: {
          $gte: start.toISOString(),
          $lte: end.toISOString(),
        },
      })
      .toArray();

    const ranges = [
      { range: "< 10 sec", min: 0, max: 10 },
      { range: "10 - 30 sec", min: 10, max: 30 },
      { range: "30 - 60 sec", min: 30, max: 60 },
      { range: "1 - 3 min", min: 60, max: 180 },
      { range: "3 - 5 min", min: 180, max: 300 },
      { range: "5 - 10 min", min: 300, max: 600 },
      { range: "10 - 20 min", min: 600, max: 1200 },
      { range: "20 - 30 min", min: 1200, max: 1800 },
      { range: "> 30 min", min: 1800, max: Infinity },
    ];

    const durationData = ranges.map((range) => ({
      range: range.range,
      count: records.filter((record) => {
        const duration = record.total_talk_duration.SPEAKER_00; // Assuming `total_talk_duration` is in seconds
        return duration >= range.min && duration < range.max;
      }).length,
    }));

    res.status(200).json(durationData);
  } catch (error) {
    console.error("Error fetching call duration data:", error);
    res.status(500).json({
      status: `Error fetching call duration data: ${(error as Error).message}`,
    });
  }
};

export default handler;
