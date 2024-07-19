// pages/api/average-by-date-range.ts
import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/dbUtils";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { database, startDate, endDate } = req.query;

    if (!database || !startDate || !endDate) {
      return res
        .status(400)
        .json({ error: "Missing database, startDate, or endDate" });
    }

    const client = await connectToDatabase();
    const db = client.db(database as string);
    const collection = db.collection("calls");

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    const pipeline = [
      {
        $match: {
          day_processed: {
            $gte: start.toISOString(),
            $lte: end.toISOString(),
          },
        },
      },
      {
        $group: {
          _id: null,
          averageDuration: { $avg: "$file_info.duration" },
        },
      },
    ];

    const [result] = await collection.aggregate(pipeline).toArray();
    const averageDurationInSeconds = result?.averageDuration || 0;
    const averageDurationText = formatDuration(averageDurationInSeconds);

    res.status(200).json({ averageDurationText, averageDurationInSeconds });
  } catch (error) {
    console.error("Error calculating average audio duration:", error);
    res.status(500).json({
      status: `Error calculating average audio duration: ${
        (error as Error).message
      }`,
    });
  }
};

const formatDuration = (durationInSeconds: number) => {
  const minutes = Math.floor(durationInSeconds / 60);
  const seconds = Math.floor(durationInSeconds % 60);
  return `${minutes} m ${seconds} s`;
};

export default handler;
