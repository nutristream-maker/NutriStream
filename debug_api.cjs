
const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = "AIzaSyA-K-i-Wowvmf12ZgdsfRFXfQTOxHjBIvk";
const genAI = new GoogleGenerativeAI(apiKey);

async function debugError() {
    try {
        console.log("Trying gemini-1.5-flash with NEW KEY and full error logging...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Test");
        console.log("Success");
    } catch (error) {
        console.log("FULL ERROR DETAILS:");
        console.log(JSON.stringify(error, null, 2));
        console.log(error.message);
        if (error.response) {
            console.log("Response data:", error.response);
        }
    }
}

debugError();
