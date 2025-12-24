const express = require("express");
const multer = require("multer");
const axios = require("axios");
const cors = require("cors");
const FormData = require("form-data");

const app = express();
app.use(cors());

// multer memory storage
const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// health check
app.get("/", (req, res) => {
  res.send("BG Remover Backend Running");
});

// remove background API
app.post("/remove-bg", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const formData = new FormData();
    formData.append(
      "image_file",
      req.file.buffer,
      req.file.originalname
    );
    formData.append("size", "auto");

    const response = await axios.post(
      "https://api.remove.bg/v1.0/removebg",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          "X-Api-Key": process.env.REMOVE_BG_KEY
        },
        responseType: "arraybuffer",
        timeout: 60000
      }
    );

    // IMPORTANT HEADERS
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Disposition", "inline; filename=bg.png");

    res.send(response.data);

  } catch (err) {
    console.error("ERROR:", err?.response?.data || err.message);

    res.status(500).json({
      error: "Background remove failed",
      details: err?.response?.data || err.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
