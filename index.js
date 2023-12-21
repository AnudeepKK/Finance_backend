import express from "express";
const app = express();
const port = 3000;

import cors from "cors";

import bodyParser from "body-parser";

import verifyAadhaarCard from "./verify.js";

import sharp from "sharp";
import { spawn } from "child_process";
import fs from "fs";

import panImage from "./PanImage.js";
import PassImage from "./PassbookImage.js";
import adharImage from "./Adharimage.js";

const storage = multer.memoryStorage();

import multer from "multer";

const upload = multer({ storage: storage });

app.use(cors());
// Your backend routes and logic here

app.use(bodyParser.json());

// Your Aadhaar card verification logic here
app.post(
  "/verifyAadhaarCardEndpoint",
  upload.single("uploadedImage"),
  async (req, res) => {
    try {
      console.log(req.file);
      // const {uploadedImagePath} = req.body;
      const { buffer } = req.file;

      if (!adharImage || !buffer) {
        return res
          .status(400)
          .send("Invalid request. Missing template or uploaded image path.");
      }

      // Call your verification function
      const result = await verifyAadhaarCard(adharImage, buffer);

      if (result == true) {
        //Convert to png
        sharp(buffer)
          .toFormat("png")
          .toFile("./buffer.png", (err, info) => {
            if (err) {
              console.error("Error: ", err);
            } else {
              console.log("Image converted successfully", info);
            }
          });

          // PowerShell commands to execute sequentially
          const commands = [
            "imcrypt -e buffer.png -i encryptedBuffer.png -p keyFile.txt",
            "imcrypt -d encryptedBuffer.png -k keyFile.txt -i decryptedBuffer.png",
          ];
          
          // Function to execute commands sequentially
          function executeCommands(commands, index) {
            if (index >= commands.length) {
              console.log("All commands executed");
              return;
            }
          
            const command = commands[index];
          
            // Execute the command in PowerShell
            const child = spawn("powershell.exe", ["-Command", command], {
              stdio: "inherit", // To use the current terminal's stdio
            });
          
            // Listen for the command to close
            child.on("exit", (code) => {
              if (code === 0) {
                console.log(`Command ${index + 1} executed successfully`);
                executeCommands(commands, index + 1); // Execute the next command
              } else {
                console.error(`Command ${index + 1} failed with code: ${code}`);
              }
            });
          }
          
          // Start executing commands
          executeCommands(commands, 0);
        res.status(200).json({ success: result });
      }
    } catch (error) {
      console.error("Error:", error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

app.post(
  "/verifyPanEndpoint",
  upload.single("uploadedImage"),
  async (req, res) => {
    try {
      console.log(req.file);
      // const {uploadedImagePath} = req.body;
      const { buffer } = req.file;

      console.log(panImage);

      if (!panImage || !buffer) {
        return res
          .status(400)
          .send("Invalid request. Missing template or uploaded image path.");
      }

      // Call your verification function
      const result = await verifyAadhaarCard(panImage, buffer);
      if (result == true) {
        res.status(200).json({ success: result });
      }
    } catch (error) {
      console.error("Error:", error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

app.post(
  "/verifyPassEndpoint",
  upload.single("uploadedImage"),
  async (req, res) => {
    try {
      console.log(req.file);
      console.log(PassImage);
      // const {uploadedImagePath} = req.body;
      const { buffer } = req.file;

      if (!PassImage || !buffer) {
        return res
          .status(400)
          .send("Invalid request. Missing template or uploaded image path.");
      }

      // Call your verification function
      const result = await verifyAadhaarCard(PassImage, buffer);
      if (result == true) {
        res.status(200).json({ success: result });
      }
    } catch (error) {
      console.error("Error:", error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
