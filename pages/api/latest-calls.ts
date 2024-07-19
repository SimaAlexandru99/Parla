import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/dbUtils";
import { ObjectId } from "mongodb";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { database, page = 1, limit = 10, id } = req.query;
  
  if (typeof database !== 'string') {
    res.status(400).json({ error: 'Invalid database parameter' });
    return;
  }

  try {
    const client = await connectToDatabase();
    const db = client.db(database);
    const collection = db.collection("calls");

    if (req.method === 'GET') {
      const pageNumber = parseInt(page as string, 10);
      const limitNumber = parseInt(limit as string, 10);

      if (isNaN(pageNumber) || isNaN(limitNumber) || pageNumber < 1 || limitNumber < 1) {
        return res.status(400).json({ error: "Invalid pagination parameters" });
      }

      const skip = (pageNumber - 1) * limitNumber;
      const latestCalls = await collection
        .find()
        .sort({ day_processed: -1 })
        .skip(skip)
        .limit(limitNumber)
        .toArray();

      const totalCalls = await collection.countDocuments();

      res.status(200).json({ latestCalls, totalCalls });
    } else if (req.method === 'DELETE') {
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Invalid call ID' });
      }

      const result = await collection.deleteOne({ _id: new ObjectId(id) });

      if (result.deletedCount === 1) {
        res.status(200).json({ message: "Call deleted successfully" });
      } else {
        res.status(404).json({ error: "Call not found" });
      }
    } else {
      res.setHeader('Allow', ['GET', 'DELETE']);
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