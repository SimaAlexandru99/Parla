// pages/api/count-by-date-range.ts
import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/dbUtils";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { database, startDate, endDate } = req.query;

    if (!database || !startDate || !endDate) {
      return res.status(400).json({ error: "Missing database, startDate, or endDate" });
    }

    const client = await connectToDatabase();
    const db = client.db(database as string);
    const collection = db.collection("calls");

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    const count = await collection.countDocuments({
      day_processed: {
        $gte: start.toISOString(),
        $lte: end.toISOString(),
      },
    });

    res.status(200).json(count);
  } catch (error) {
    console.error("Error fetching count by date range:", error);
    res.status(500).json({
      status: `Error fetching count by date range: ${(error as Error).message}`,
    });
  }
};

export default handler;
