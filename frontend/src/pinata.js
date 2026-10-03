// src/pinata.js
import axios from "axios";

const pinataApiKey = process.env.REACT_APP_PINATA_API_KEY;
const pinataSecretApiKey = process.env.REACT_APP_PINATA_API_SECRET;

// 1) Upload a file (image) to Pinata
export async function uploadFileToPinata(fileObj) {
  const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";

  const formData = new FormData();
  formData.append("file", fileObj);

  try {
    const res = await axios.post(url, formData, {
      maxContentLength: Infinity,
      headers: {
        // DO NOT manually set Content-Type — let the browser do it
        pinata_api_key: pinataApiKey,
        pinata_secret_api_key: pinataSecretApiKey,
      },
    });

    return res.data.IpfsHash;
  } catch (err) {
    console.error("Pinata file upload error:", err);
    return null;
  }
}

// 2) Upload JSON metadata to Pinata
export async function uploadJsonToPinata(jsonBody) {
  const url = "https://api.pinata.cloud/pinning/pinJSONToIPFS";

  try {
    const res = await axios.post(url, jsonBody, {
      headers: {
        "Content-Type": "application/json",
        pinata_api_key: pinataApiKey,
        pinata_secret_api_key: pinataSecretApiKey,
      },
    });

    return res.data.IpfsHash;
  } catch (err) {
    console.error("Pinata JSON upload error:", err);
    return null;
  }
}
