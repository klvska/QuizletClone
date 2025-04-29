import axios from "axios";

export const addSetWithCards = async (title, userId, cards) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      "http://localhost:3001/sets",
      {
        title,
        description: "",
        isPublic: false,
        cards,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("Set and cards created:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating set and cards:", error);
    throw error;
  }
};
