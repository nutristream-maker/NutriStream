
const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = "AIzaSyA-K-i-Wowvmf12ZgdsfRFXfQTOxHjBIvk";
const genAI = new GoogleGenerativeAI(apiKey);

async function testModel() {
    try {
        const modelName = "gemini-2.5-flash";
        console.log(`Testing ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Say hello");
        const response = await result.response;
        console.log("Response:", response.text());
        console.log("✅ SUCCESS!");
    } catch (error) {
        console.log("❌ FAILED");
        console.log(error.message);
    }
}

testModel();
