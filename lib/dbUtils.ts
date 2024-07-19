import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI environment variable is not defined");
}

let client: MongoClient | null = null;

export async function connectToDatabase() {
  if (client) {
    return client;
  }
  client = new MongoClient(uri as string);
  await client.connect();
  return client;
}

export const getMonthRanges = () => {
  const currentDate = new Date();

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const startOfNextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
  const startOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);

  const startOfMonthString = startOfMonth.toISOString().split("T")[0] + "T00:00:00Z";
  const startOfNextMonthString = startOfNextMonth.toISOString().split("T")[0] + "T00:00:00Z";
  const startOfLastMonthString = startOfLastMonth.toISOString().split("T")[0] + "T00:00:00Z";
  const startOfThisMonthString = startOfMonth.toISOString().split("T")[0] + "T00:00:00Z";

  return {
    startOfMonthString,
    startOfNextMonthString,
    startOfLastMonthString,
    startOfThisMonthString,
  };
};
