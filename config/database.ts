import mongoose from "mongoose";

export const connect = async (): Promise<void> => {
  try {
    await mongoose.connect(`${process.env.MONGO_URL}`);
    console.log("Kết nối database thành công !");
  } catch (error) {
    console.log("Kết nối database thất bại");
    console.log(error);
  }
};
