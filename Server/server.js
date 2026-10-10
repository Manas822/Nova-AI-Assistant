require("dotenv").config();
console.log("SERVER STARTED");
const axios = require("axios");
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { exec } = require("child_process");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const XLSX = require("xlsx");

const { OpenAI } = require("openai");
const { GoogleGenAI } = require("@google/genai");

const app = express();
const PORT = process.env.PORT || 3000;


// ======================================
// Upload Folder
// ======================================

const uploadPath = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

// ======================================
// Multer
// ======================================

const upload = multer({
    dest: uploadPath,
    limits: {
        fileSize: 20 * 1024 * 1024
    }
});

// ======================================
// Middleware
// ======================================

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "../client")));

// ======================================
// AI Clients
// ======================================

const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
});

const openrouter = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1"
});


// ======================================
// Routes
// ======================================

// Home

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/index.html"));
});

// Health

app.get("/health", (req, res) => {

    res.json({
        success: true,
        app: "Nova AI Ultimate",
        version: "6.0",
        status: "Running"
    });

});

// ======================================
// Chat API
// ======================================

app.post("/chat", async (req, res) => {

    try {

   const { message } = req.body;

if (!message) {
    return res.status(400).json({
        reply: "Message is required."
    });
}

const msg = message.toLowerCase();
// ================= WEATHER =================

if (msg.startsWith("weather ")) {

    const city = message.substring(8);

    try {

        const url = `https://wttr.in/${city}?format=j1`;

        const response = await axios.get(url);

        const data = response.data.current_condition[0];

        return res.json({
            reply:
`🌤 Weather of ${city}

🌡 Temperature : ${data.temp_C}°C
🤗 Feels Like : ${data.FeelsLikeC}°C
💧 Humidity : ${data.humidity}%
🌬 Wind : ${data.windspeedKmph} km/h
☁ Condition : ${data.weatherDesc[0].value}`
        });

    } catch {

        return res.json({
            reply: "Unable to get weather."
        });

    }

}
// ================= WEBSITE COMMANDS =================

const websites = {
    "youtube": "https://www.youtube.com",
    "google": "https://www.google.com",
    "gmail": "https://mail.google.com",
    "chatgpt": "https://chat.openai.com",
    "github": "https://github.com",
    "linkedin": "https://linkedin.com",
    "instagram": "https://instagram.com",
    "facebook": "https://facebook.com",
    "x": "https://x.com",
    "twitter": "https://x.com",
    "whatsapp": "https://web.whatsapp.com",
    "amazon": "https://amazon.in",
    "flipkart": "https://flipkart.com",
    "netflix": "https://netflix.com",
    "spotify": "https://spotify.com",
    "leetcode": "https://leetcode.com",
    "geeksforgeeks": "https://geeksforgeeks.org",
    "hackerrank": "https://hackerrank.com",
    "codeforces": "https://codeforces.com"
};
for (const site in websites) {
    if (
        msg.includes("open " + site) ||
        msg === site ||
        msg.includes("go to " + site)
    ) {
        exec(`start "" "${websites[site]}"`);
        return res.json({
            reply: `Opening ${site}...`
        });
    }
}
// ================= WINDOWS APPS =================

const apps = {
    "calculator": "calc",
    "notepad": "notepad",
    "paint": "mspaint",
    "cmd": "cmd",
    "powershell": "powershell",
    "explorer": "explorer",
    "task manager": "taskmgr",
    "control panel": "control",
    "settings": "start ms-settings:",
    "camera": "start microsoft.windows.camera:",
    "snipping tool": "snippingtool"
};

for (const app in apps) {
    if (
        msg.includes("open " + app) ||
        msg === app
    ) {
        exec(apps[app]);
        return res.json({
            reply: `Opening ${app}...`
        });
    }
}
// ================= VS CODE =================

if (msg.includes("open vscode") || msg.includes("open vs code")) {
    exec("code");
    return res.json({ reply: "Opening VS Code..." });
}

// ================= FOLDERS =================

const folders = {
    "downloads": process.env.USERPROFILE + "\\Downloads",
    "desktop": process.env.USERPROFILE + "\\Desktop",
    "documents": process.env.USERPROFILE + "\\Documents",
    "pictures": process.env.USERPROFILE + "\\Pictures",
    "videos": process.env.USERPROFILE + "\\Videos",
    "music": process.env.USERPROFILE + "\\Music"
};

for (const folder in folders) {
    if (
        msg.includes("open " + folder) ||
        msg === folder
    ) {
        exec(`explorer "${folders[folder]}"`);
        return res.json({
            reply: `Opening ${folder}...`
        });
    }
}

// ================= GOOGLE SEARCH =================

if (msg.startsWith("search ")) {
    const query = message.substring(7);
    exec(`start https://www.google.com/search?q=${encodeURIComponent(query)}`);
    return res.json({ reply: `Searching "${query}" on Google...` });
}

// ================= PLAY YOUTUBE =================

if (msg.startsWith("play ")) {
    const song = message.substring(5);
    exec(`start https://www.youtube.com/results?search_query=${encodeURIComponent(song)}`);
    return res.json({ reply: `Playing ${song} on YouTube...` });
}

// ================= DATE =================

if (msg === "date") {
    return res.json({
        reply: new Date().toLocaleDateString()
    });
}

// ================= TIME =================

if (msg === "time") {
    return res.json({
        reply: new Date().toLocaleTimeString()
    });
}
// Open YouTube
if (msg.includes("open youtube")) {
    exec('start https://www.youtube.com');
    return res.json({ reply: "Opening YouTube..." });
}

// Open Google
if (msg.includes("open google")) {
    exec('start https://www.google.com');
    return res.json({ reply: "Opening Google..." });
}

// Open Calculator
if (msg.includes("open calculator")) {
    exec("calc");
    return res.json({ reply: "Opening Calculator..." });
}

// Open Notepad
if (msg.includes("open notepad")) {
    exec("notepad");
    return res.json({ reply: "Opening Notepad..." });
}

// Open VS Code
if (msg.includes("open vscode") || msg.includes("open vs code")) {
    exec("code");
    return res.json({ reply: "Opening VS Code..." });
}
        const completion =
            await groq.chat.completions.create({

                model: "openai/gpt-oss-120b",

                messages: [

                    {
                        role: "system",
                        content:
                            "You are Nova AI, a helpful AI assistant. Reply in simple language."
                    },

                    {
                        role: "user",
                        content: message
                    }

                ]

            });

        return res.json({

            reply:
                completion.choices[0].message.content

        });

    }

    catch (err) {

        console.error("CHAT ERROR");

        console.error(err);

        return res.status(500).json({

            reply: "Server Error"

        });

    }

});
// ======================================
// Upload API
// ======================================

app.post("/upload", upload.single("file"), async (req, res) => {
console.log("File:", req.file);
console.log("Body:", req.body);
    try {

        if (!req.file) {

            return res.status(400).json({
                success: false,
                message: "No file uploaded."
            });

        }

        let content = "";

        // ================= PDF =================

        if (req.file.mimetype === "application/pdf") {

            const buffer = fs.readFileSync(req.file.path);

            const pdf = await pdfParse(buffer);

            content = pdf.text;

        }

        // ================= TXT =================
else if (req.file.mimetype.startsWith("image/")) {

    const imageBytes = fs.readFileSync(req.file.path);

   const completion = await openrouter.chat.completions.create({
    model: "qwen/qwen2.5-vl-72b-instruct",
    max_tokens: 1500,
    messages: [
        {
            role: "user",
            content: [
                {
                    type: "text",
                    text: "Analyze this image. Describe what you see. Read visible text and explain any code in simple language."
                },
                {
                    type: "image_url",
                    image_url: {
                        url: `data:${req.file.mimetype};base64,${imageBytes.toString("base64")}`
                    }
                }
            ]
        }
    ]
});

    fs.unlinkSync(req.file.path);

    return res.json({
        success: true,
        reply: completion.choices[0].message.content
    });

}
// ================= TXT =================

else if (req.file.mimetype === "text/plain") {

    content = fs.readFileSync(req.file.path, "utf8");

}

// ================= DOCX =================

else if (
    req.file.mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
) {

    const result = await mammoth.extractRawText({
        path: req.file.path
    });

    content = result.value;

}

// ================= XLSX =================

else if (
    req.file.mimetype ===
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
) {

    const workbook = XLSX.readFile(req.file.path);

    const sheet =
        workbook.Sheets[workbook.SheetNames[0]];

    content = XLSX.utils.sheet_to_csv(sheet);

}

// ================= IMAGE =================

else if (req.file.mimetype.startsWith("image/")) {

    // (Tumhara image wala code yahin rahega)

}

// ================= OTHER FILES =================

else {

    fs.unlinkSync(req.file.path);

    return res.status(400).json({

        success: false,

        message: "Unsupported file type."

    });

}

        const completion =
            await groq.chat.completions.create({

               model: "openai/gpt-oss-120b",

                messages: [

                    {
                        role: "system",
                        content:
                            "Explain the uploaded document in simple language. If it contains code, explain it. If it contains tables, summarize them."
                    },

                    {
                        role: "user",
                        content: content.substring(0, 12000)
                    }

                ]

            });

        fs.unlinkSync(req.file.path);

        return res.json({

            success: true,

            reply:
                completion.choices[0].message.content

        });

    }

    catch (err) {

        console.error("UPLOAD ERROR");

        console.error(err);

        if (req.file && fs.existsSync(req.file.path)) {

            fs.unlinkSync(req.file.path);

        }

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

});
// ======================================
// 404 Handler
// ======================================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route Not Found"
    });
});

// ======================================
// Global Error Handler
// ======================================

app.use((err, req, res, next) => {
    console.error(err);

    res.status(500).json({
        success: false,
        message: "Internal Server Error"
    });
});

// ======================================
// Start Server
// ======================================
if (require.main === module) {
    app.listen(PORT, () => {
        console.log("\n====================================");
        console.log("🚀 Nova AI Ultimate Started");
        console.log("====================================");
        console.log(`🌐 http://localhost:${PORT}`);
        console.log("❤️ Server Running Successfully");
        console.log("====================================\n");
    });
}

module.exports = app;