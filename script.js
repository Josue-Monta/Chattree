document.addEventListener("DOMContentLoaded", () => {
    cargarMensajes();
});

document.getElementById("darkModeToggle").addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");
});

let memoriaConversacion = JSON.parse(localStorage.getItem("memoria")) || [];

function addMessage(text, sender) {
    const chatbox = document.getElementById("chatbox");
    const message = document.createElement("div");
    message.classList.add("message");
    message.textContent = text;

    if (sender === "bot") {
        message.style.alignSelf = "flex-start";
        message.style.background = "#ddd";
        message.style.color = "black";
    }

    chatbox.appendChild(message);
    chatbox.scrollTop = chatbox.scrollHeight;

    memoriaConversacion.push({ sender, text });
    localStorage.setItem("memoria", JSON.stringify(memoriaConversacion));
}

async function sendMessage() {
    const inputField = document.getElementById("userInput");
    let userText = inputField.value.trim();
    if (!userText) return;

    addMessage(userText, "user");

    let respuesta = await obtenerRespuestaDeOpenAI(userText);
    setTimeout(() => addMessage(respuesta, "bot"), 500);

    inputField.value = "";
}

//  Conexión con OpenAI
async function obtenerRespuestaDeOpenAI(mensaje) {
    const apiKey = "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"; // 🔑 Reemplaza con tu clave de OpenAI
    const apiUrl = "https://api.openai.com/v1/chat/completions";

    let historial = memoriaConversacion.map(m => ({ role: m.sender === "user" ? "user" : "assistant", content: m.text }));

    const payload = {
        model: "gpt-3.5-turbo", // 
        messages: [...historial, { role: "user", content: mensaje }],
        max_tokens: 100,
        temperature: 0.7
    };

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.choices && data.choices.length > 0) {
            return data.choices[0].message.content;
        } else {
            return "Lo siento, no tengo una respuesta para eso.";
        }
    } catch (error) {
        console.error("Error con la API de OpenAI:", error);
        return "Error al conectar con OpenAI.";
    }
}

