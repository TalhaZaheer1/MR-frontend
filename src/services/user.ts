import axios from "axios";
import toast from "react-hot-toast";

export async function getUser() {
  try {
    const user = await axios.get("/user");
    return user;
  } catch (error:any) {
    toast.error(error.message);
  }
}
