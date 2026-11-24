import mongoose from "mongoose";
const ConnectDB = async () => {
    try {

        await mongoose.connect(process.env.MONGO_URI);
        console.log("Database connected successfully")

    } catch (err) {
        console.log(`An error occurred during connection to database ${err}`);
        process.exit(1)

    }
}
export default ConnectDB;