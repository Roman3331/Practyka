import { MongoClient } from "mongodb";
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);
try {
    console.log("Connecting...");
    await client.connect();
    console.log("Connected!");
    await client.close();
    process.exit(0);
} catch (e) {
    console.error(e);
    process.exit(1);
}
