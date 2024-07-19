import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase, getMonthRanges } from "@/lib/dbUtils";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { database, username } = req.query;
    if (typeof database !== 'string') {
      res.status(400).json({ error: 'Invalid database parameter' });
      return;
    }

    const client = await connectToDatabase();
    const db = client.db(database);
    const collection = db.collection("calls");

    const { startOfMonthString, startOfNextMonthString, startOfLastMonthString, startOfThisMonthString } = getMonthRanges();

    const matchStage = username
      ? { "agent_info.username": username }
      : {};

    const currentMonthCount = await collection.countDocuments({
      ...matchStage,
      day_processed: {
        $gte: startOfMonthString,
        $lt: startOfNextMonthString,
      },
    });

    const lastMonthCount = await collection.countDocuments({
      ...matchStage,
      day_processed: {
        $gte: startOfLastMonthString,
        $lt: startOfThisMonthString,
      },
    });

    res.status(200).json({ currentMonthCount, lastMonthCount });
  } catch (error) {
    console.error("Failed to count documents:", error);
    res.status(500).json({
      status: `Failed to count documents: ${(error as Error).message}`,
    });
  }
};

export default handler;