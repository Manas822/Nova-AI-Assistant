/* ==========================================================================
   NOVA AI ULTIMATE v5.0 - FINAL UNIFIED SCRIPT
   ========================================================================== */
// =========================
// Voice Recognition
// =========================

const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();

recognition.lang = "en-US";
recognition.continuous = false;
recognition.interimResults = false;

// Global App States
console.log("STEP 1");
let chats = [];
let currentChat = [];
let currentChatId = null;
let voiceEnabled = false;
let autoSaveEnabled = true;
let webSearchMode = false;

// Global Element References
let chatBox, input, sendBtn, micBtn, attachBtn, fileInput, webBtn;
let newChatBtn, clearBtn, historyList, typing, themeBtn, voiceBtn, exportBtn, search, toast;
let settingsBtn, settingsModal, closeSettings, themeToggle, voiceToggle, autoSave;

// Initialize when DOM is completely loaded
document.addEventListener("DOMContentLoaded", () => {
    console.log("STEP 2");

    // 1. Element Assignments from HTML
    chatBox = document.getElementById("chat-box");
    input = document.getElementById("userInput");
    sendBtn = document.getElementById("sendBtn");
    micBtn = document.getElementById("micBtn");
    attachBtn = document.getElementById("attachBtn");
    fileInput = document.getElementById("fileInput");
    webBtn = document.getElementById("webBtn");
    newChatBtn = document.getElementById("newChat");
    clearBtn = document.getElementById("clearChat");
    historyList = document.getElementById("historyList");
    typing = document.getElementById("typing");
    themeBtn = document.getElementById("themeBtn");
    voiceBtn = document.getElementById("voiceBtn");
    exportBtn = document.getElementById("exportBtn");
    search = document.getElementById("searchChat");
    toast = document.getElementById("toast");
    
    // Settings Modal Elements
    settingsBtn = document.getElementById("settingsBtn");
    settingsModal = document.getElementById("settingsModal");
    closeSettings = document.getElementById("closeSettings");
    themeToggle = document.getElementById("themeToggle");
    voiceToggle = document.getElementById("voiceToggle");
    autoSave = document.getElementById("autoSave");

    const voiceMenu = document.getElementById("voiceMenu");

    // 2. Header & Menu Controls
    if (voiceBtn && voiceMenu) {
        voiceBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            voiceMenu.classList.toggle("hidden");
        });

        document.addEventListener("click", (e) => {
            if (!voiceMenu.contains(e.target) && e.target !== voiceBtn) {
                voiceMenu.classList.add("hidden");
            }
        });

        // Voice Menu volume radio listeners
        const voiceRadios = voiceMenu.querySelectorAll("input[name='voice']");
        voiceRadios.forEach(radio => {
            radio.addEventListener("change", (e) => {
                const vol = parseFloat(e.target.value);
                voiceEnabled = vol > 0;
                showToast(voiceEnabled ? `Voice Output Set (${vol * 100}%)` : "Voice Muted");
            });
        });
    }

    if (webBtn) {
        webBtn.addEventListener("click", () => {
            webSearchMode = !webSearchMode;
            webBtn.classList.toggle("active", webSearchMode);
            showToast(
                webSearchMode
                    ? "🌐 Web Search Enabled"
                    : "🌐 Web Search Disabled"
            );
        });
    }

    if (search) {
        search.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase();
            const items = historyList.querySelectorAll("li");
            items.forEach(li => {
                const match = li.textContent.toLowerCase().includes(query);
                li.style.display = match ? "flex" : "none";
            });
        });
    }

    // 3. Main Event Handlers
    if (sendBtn) sendBtn.addEventListener("click", sendMessage);

    if (input) {
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        input.addEventListener("input", autoResize);
    }

    if (newChatBtn) newChatBtn.addEventListener("click", newChat);
    if (clearBtn) clearBtn.addEventListener("click", clearChat);

    if (attachBtn && fileInput) {
        attachBtn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            fileInput.value = "";
            fileInput.click();
        });

        fileInput.addEventListener("change", () => {
            if (fileInput.files.length > 0) {
                uploadFile();
            }
        });
    }

    if (exportBtn) {
        exportBtn.addEventListener("click", exportChat);
    }

    // 4. Settings Modal Systems
    if (settingsBtn && settingsModal) {
        settingsBtn.addEventListener("click", () => {
            settingsModal.classList.add("show");
        });
    }

    if (closeSettings && settingsModal) {
        closeSettings.addEventListener("click", () => {
            settingsModal.classList.remove("show");
        });
    }

    window.addEventListener("click", (e) => {
        if (e.target === settingsModal) {
            settingsModal.style.display = "none";
        }
    });

    if (autoSave) {
        autoSave.addEventListener("change", () => {
            autoSaveEnabled = autoSave.checked;
            showToast(autoSaveEnabled ? "Auto Save Enabled" : "Auto Save Disabled");
        });
    }

    // 5. Unified Theme Systems
    if (themeBtn) themeBtn.addEventListener("click", toggleThemeState);
    if (themeToggle) themeToggle.addEventListener("click", toggleThemeState);

    // 6. Voice Controls
    if (voiceToggle) voiceToggle.addEventListener("click", toggleVoiceState);

    // 7. Speech Recognition Engine
    if ("webkitSpeechRecognition" in window && micBtn) {
        const recognition = new webkitSpeechRecognition();
        recognition.lang = "en-US";
        recognition.continuous = false;
        recognition.interimResults = false;

        micBtn.addEventListener("click", () => {
            recognition.start();
            micBtn.classList.add("listening");
        });

        recognition.onresult = (e) => {
            if (input) {
                input.value = e.results[0][0].transcript;
                autoResize();
            }
        };

        recognition.onend = () => {
            micBtn.classList.remove("listening");
        };
    }

    // Load setup configurations
    loadChats();
    initTheme();
    if (input) input.focus();
    showToast("Welcome to Nova AI 🚀");
});

// ==========================================
// Theme & Voice Core Switches
// ==========================================
function toggleThemeState() {
    document.body.classList.toggle("light");
    const isLight = document.body.classList.contains("light");
    
    if (themeBtn) {
        themeBtn.innerHTML = isLight
            ? '<i class="fa-solid fa-sun"></i>'
            : '<i class="fa-solid fa-moon"></i>';
    }

    if (themeToggle) {
        themeToggle.textContent = isLight ? "☀️" : "🌙";
    }
    
    localStorage.setItem("theme", isLight ? "light" : "dark");
}

function toggleVoiceState() {
    voiceEnabled = !voiceEnabled;
    if (voiceBtn) {
        voiceBtn.innerHTML = voiceEnabled
            ? '<i class="fa-solid fa-volume-high"></i>'
            : '<i class="fa-solid fa-volume-xmark"></i>';
    }

    if (voiceToggle) {
        voiceToggle.textContent = voiceEnabled ? "🔊" : "🔇";
    }
    
    if (!voiceEnabled) window.speechSynthesis.cancel();
    showToast(voiceEnabled ? "Voice Reply ON" : "Voice Reply OFF");
}

function initTheme() {
    const theme = localStorage.getItem("theme");
    if (theme === "light") {
        document.body.classList.add("light");
        if (themeBtn) themeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
        if (themeToggle) themeToggle.textContent = "☀️";
    } else {
        document.body.classList.remove("light");
        if (themeBtn) themeBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
        if (themeToggle) themeToggle.textContent = "🌙";
    }
}

// ==========================================
// Core Messaging Pipeline
// ==========================================
async function sendMessage() {
    const message = input.value.trim();
    if (!message) return;

    removeWelcome();
    addUserMessage(message);

    currentChat.push({ role: "user", content: message });
    input.value = "";
    autoResize();
    showLoading();
    scrollBottom();

    try {
        const response = await fetch("http://localhost:3000/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message, webSearch: webSearchMode })
        });

        const data = await response.json();
        hideLoading();

        await typeWriter(data.reply || data.message || "No response received.");
        
        currentChat.push({ role: "assistant", content: data.reply || data.message });
        if (autoSaveEnabled) saveChat();
    } catch (err) {
        hideLoading();
        addBotMessage("❌ Unable to connect to server.");
        console.error(err);
    }
}

function addUserMessage(text) {
    if (!chatBox) return;

    const msg = document.createElement("div");
    msg.className = "message user";

    msg.innerHTML = `
        <div class="bubble">
            ${escapeHTML(text)}
            <span class="time">${getTime()}</span>
        </div>
        <div class="avatar">
            <i class="fa-solid fa-user"></i>
        </div>
    `;

    chatBox.appendChild(msg);
    scrollBottom();
}

function addBotMessage(text) {
    if (!chatBox) return;

    const msg = document.createElement("div");
    msg.className = "message bot";

    msg.innerHTML = `
        <div class="avatar">
            <i class="fa-solid fa-robot"></i>
        </div>
        <div class="bubble">
            ${typeof marked !== "undefined" ? marked.parse(text) : escapeHTML(text)}
            <span class="time">${getTime()}</span>
        </div>
    `;

    attachCopyButton(msg.querySelector(".bubble"), text);
    chatBox.appendChild(msg);
    speak(text);
    applySyntaxHighlighting();
    scrollBottom();
}

async function typeWriter(text) {
    if (!chatBox) return;

    const msg = document.createElement("div");
    msg.className = "message bot";

    msg.innerHTML = `
        <div class="avatar">
            <i class="fa-solid fa-robot"></i>
        </div>
        <div class="bubble"></div>
    `;

    chatBox.appendChild(msg);
    const bubble = msg.querySelector(".bubble");

    let i = 0;
    while (i <= text.length) {
        const chunk = text.substring(0, i);
        bubble.innerHTML = typeof marked !== "undefined" ? marked.parse(chunk) : escapeHTML(chunk);
        applySyntaxHighlighting();
        scrollBottom();
        await new Promise(r => setTimeout(r, 8));
        i++;
    }

    const timeSpan = document.createElement("span");
    timeSpan.className = "time";
    timeSpan.textContent = getTime();
    bubble.appendChild(timeSpan);

    attachCopyButton(bubble, text);
    speak(text);
}

// ==========================================
// File Upload System
// ==========================================
async function uploadFile() {
    const file = fileInput.files[0];
    if (!file) return;

    removeWelcome();
    addUserMessage("📎 " + file.name);

    showLoading();

    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await fetch("http://localhost:3000/upload", {
            method: "POST",
            body: formData
        });

        const data = await response.json();
        hideLoading();

        if (!response.ok) {
            addBotMessage("❌ " + (data.message || "Upload failed."));
            return;
        }

        if (data.success) {
            currentChat.push({
                role: "user",
                content: "📎 " + file.name
            });

            await typeWriter(data.reply);

            currentChat.push({
                role: "assistant",
                content: data.reply
            });

            if (autoSaveEnabled) {
                saveChat();
            }
        } else {
            addBotMessage("❌ " + data.message);
        }
    } catch (err) {
        console.error(err);
        hideLoading();
        addBotMessage("❌ Unable to connect to server.");
    }

    fileInput.value = "";
}

// ==========================================
// Database & Session Store Management
// ==========================================
function saveChat() {
    if (currentChat.length === 0) return;

    if (!currentChatId) {
        currentChatId = Date.now();
        chats.push({
            id: currentChatId,
            title: currentChat[0].content.substring(0, 30),
            messages: [...currentChat]
        });
    } else {
        const index = chats.findIndex(c => c.id === currentChatId);
        if (index !== -1) {
            chats[index].messages = [...currentChat];
        }
    }

    localStorage.setItem("novaChats", JSON.stringify(chats));
    renderHistory();
}

function loadChats() {
    const saved = localStorage.getItem("novaChats");
    if (saved) {
        try {
            chats = JSON.parse(saved);
            renderHistory();
        } catch (e) {
            console.error("Failed to parse saved chats:", e);
            chats = [];
        }
    }
}

function renderHistory() {
    if (!historyList) return;
    historyList.innerHTML = "";
    chats.slice().reverse().forEach(chat => {
        const li = document.createElement("li");
        li.textContent = chat.title || "Untitled Chat";
        if (chat.id === currentChatId) li.classList.add("active");
        li.onclick = () => openChat(chat);
        historyList.appendChild(li);
    });
}

function openChat(chat) {
    if (!chatBox) return;
    chatBox.innerHTML = "";
    currentChatId = chat.id;
    currentChat = [...chat.messages];

    currentChat.forEach(msg => {
        if (msg.role === "user") {
            addUserMessage(msg.content);
        } else {
            addBotMessage(msg.content);
        }
    });
    renderHistory();
}

function newChat() {
    console.log("NEW CHAT STARTED");
    currentChat = [];
    currentChatId = null;
    if (chatBox) {
        chatBox.innerHTML = `
            <div class="welcome" id="welcomeScreen">
                <div class="welcome-icon">
                    <i class="fa-solid fa-robot"></i>
                </div>
                <h2>Welcome to Nova AI</h2>
                <p>
                    Ask questions, upload files, generate code,
                    analyze documents and chat naturally.
                </p>
            </div>
        `;
    }
    renderHistory();
    if (input) input.focus();
}

function clearChat() {
    if (!confirm("Clear current chat?")) return;
    currentChat = [];
    currentChatId = null;
    if (chatBox) chatBox.innerHTML = "";
    showToast("Chat Cleared");
}

async function exportChat() {

    if (currentChat.length === 0) {
        showToast("Nothing to export");
        return;
    }

    const { jsPDF } = window.jspdf;

    const doc = new jsPDF();

    doc.setFont("helvetica");

    doc.setFontSize(18);
    doc.text("Nova AI Chat Export", 15, 20);

    doc.setFontSize(11);

    let y = 35;

    currentChat.forEach(msg => {

        const title = msg.role === "user"
            ? "USER:"
            : "NOVA AI:";

        const lines = doc.splitTextToSize(
            title + " " + msg.content,
            180
        );

        if (y > 270) {
            doc.addPage();
            y = 20;
        }

        doc.text(lines, 15, y);

        y += lines.length * 7 + 6;

    });

    doc.save("NovaChat.pdf");

    showToast("PDF Exported");

}
// ==========================================
// Shortcuts & System Event Listeners
// ==========================================
document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "k") {
        e.preventDefault();
        if (input) input.focus();
    }
    if (e.ctrlKey && e.key === "l") {
        e.preventDefault();
        clearChat();
    }
    if (e.key === "Escape") {
        window.speechSynthesis.cancel();
        hideLoading();
        if (settingsModal) settingsModal.style.display = "none";
    }
});

window.addEventListener("error", (e) => {
    console.error(e.error);
    showToast("Something went wrong");
});

window.addEventListener("beforeunload", () => {
    window.speechSynthesis.cancel();
    if (autoSaveEnabled && chats.length > 0) {
        localStorage.setItem("novaChats", JSON.stringify(chats));
    }
});

document.addEventListener("dblclick", (e) => {
    const msg = e.target.closest(".message");
    if (!msg) return;

    if (confirm("Delete this message?")) {
        msg.remove();
        showToast("Deleted");
    }
});

// ==========================================
// Functional Micro-Helpers
// ==========================================
function attachCopyButton(container, text) {
    if (!container) return;
    const copy = document.createElement("button");
    copy.className = "copy-btn";
    copy.innerHTML = '<i class="fa-regular fa-copy"></i>';
    copy.onclick = () => {
        navigator.clipboard.writeText(text);
        showToast("Copied");
        copy.innerHTML = "✔";
        setTimeout(() => {
            copy.innerHTML = '<i class="fa-regular fa-copy"></i>';
        }, 1200);
    };
    container.appendChild(copy);
}

function applySyntaxHighlighting() {
    if (typeof hljs !== 'undefined') {
        document.querySelectorAll("pre code").forEach(block => hljs.highlightElement(block));
    }
}

function speak(text) {
    if (!voiceEnabled) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#`~]/g, ""); // Strip markdown tags for natural speech
    const speech = new SpeechSynthesisUtterance(cleanText);
    speech.lang = "en-US";
    window.speechSynthesis.speak(speech);
}

function removeWelcome() {
    const welcome = document.querySelector(".welcome");
    if (welcome) welcome.remove();
}

function scrollBottom() {
    if (!chatBox) return;
    requestAnimationFrame(() => {
        chatBox.scrollTop = chatBox.scrollHeight;
    });
}

function autoResize() {
    if (!input) return;
    input.style.height = "auto";
    const h = Math.min(input.scrollHeight, 180);
    input.style.height = Math.max(h, 58) + "px";
}

function getTime() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function showToast(text) {
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2000);
}

function showLoading() {
    if (!typing) return;
    typing.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Nova is thinking...`;
    typing.style.display = "block";
}

function hideLoading() {
    if (typing) typing.style.display = "none";
}

function escapeHTML(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}