
const { GoogleGenerativeAI } = require("@google/generative-ai");


// Read from .env manually if dotenv isn't handy or just use the passed key
const apiKey = "AIzaSyA-K-i-Wowvmf12ZgdsfRFXfQTOxHjBIvk";
const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        const candidateModels = [
            "gemini-1.5-flash",
            "gemini-1.5-flash-latest",
            "gemini-pro"
        ];

        console.log("Testing model availability with NEW KEY...");

        for (const modelName of candidateModels) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Hello?");
                const response = await result.response;
                console.log(`✅ SUCCESS: ${modelName} is working.`);
                return;
            } catch (e) {
                console.log(`❌ FAILED: ${modelName} - ${e.message.split('[')[0]}`);
            }
        }
        console.log("All models failed.");

    } catch (error) {
        console.error("Global script error:", error);
    }
}

listModels();
