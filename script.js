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

    let respuesta = await obtenerRespuestaDelWorker(userText);
    setTimeout(() => addMessage(respuesta, "bot"), 500);

    inputField.value = "";
}

// 🔗 Conexión con el Worker de Cloudflare
async function obtenerRespuestaDelWorker(mensaje) {
    const apiUrl = "https://lingering-voice-fbeb.josuemonta20.workers.dev/"; // Reemplázalo con tu URL de Worker

    let historial = memoriaConversacion.map(m => ({ role: m.sender === "user" ? "user" : "assistant", content: m.text }));

    const payload = {
        messages: [...historial, { role: "user", content: mensaje }]
    };

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
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
        console.error("Error con el Worker:", error);
        return "Error al conectar con el servidor.";
    }
}
