
const apiKey = "AIzaSyA-K-i-Wowvmf12ZgdsfRFXfQTOxHjBIvk";

async function fetchModels() {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.error) {
            console.error("API Error:", data.error);
        } else {
            console.log("Available Models for this Key:");
            data.models.forEach(m => console.log(`- ${m.name}`));
        }
    } catch (e) {
        console.error("Fetch error:", e);
    }
}

fetchModels();
