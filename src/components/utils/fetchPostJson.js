// In a file like utils/fetchPostJSON.js

async function fetchPostJSON(url, data) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(`Error: ${response.status}`);
    }
  } catch (error) {
    console.error("Error in fetchPostJSON:", error);
    throw error;
  }
}

export default fetchPostJSON;
