// chatbot.js - 말풍선 스타일 적용

document.addEventListener("DOMContentLoaded", function () {
    const toggleButton = document.getElementById("chatbot-toggle");
    const chatbotContainer = document.getElementById("chatbot-container");
    const inputField = document.getElementById("chatbot-input-field");
    const sendButton = document.getElementById("chatbot-send");
    const messages = document.getElementById("chatbot-messages");

    // 세션 ID를 한 번만 생성하고 유지
    const sessionId = 'session_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    console.log('Generated Session ID:', sessionId); // 디버깅용

    // 챗봇을 처음 열 때 초기 메시지 표시
    let isFirstOpen = true;

    toggleButton.addEventListener("click", () => {
        const isHidden = chatbotContainer.style.display === "none" || chatbotContainer.style.display === "";
        chatbotContainer.style.display = isHidden ? "flex" : "none";

        // 처음 열 때 초기 메시지 표시
        if (isHidden && isFirstOpen) {
            showInitialMessage();
            isFirstOpen = false;
        }
    });

    // 초기 메시지 표시 함수
    function showInitialMessage() {
        appendMessage("안녕하세요. 패캠 행정문의 챗봇 '우주🌌🧑‍🚀' 입니다. 학번을 말해주세요.", "bot");
    }

    sendButton.addEventListener("click", sendMessage);
    inputField.addEventListener("keydown", (e) => {
        if (e.key === "Enter") sendMessage();
    });

    function appendMessage(text, sender) {
        const messageContainer = document.createElement("div");
        messageContainer.className = `message-container ${sender}`;

        const messageBox = document.createElement("div");
        messageBox.className = `message ${sender}`;
        messageBox.textContent = text;

        messageContainer.appendChild(messageBox);
        messages.appendChild(messageContainer);
        messages.scrollTop = messages.scrollHeight;
    }

    //AI서버 응답 받는 함수
    function sendMessage() {
        const userInput = inputField.value.trim();
        if (!userInput) return;

        appendMessage(userInput, "user");
        inputField.value = "";

        // 봇이 응답하는 동안 로딩 표시
        showTypingIndicator();// 타이핑 애니메이션 시작

        //AI서버에 요청
        fetch("/chatbot", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Session-ID": sessionId
            },
            body: JSON.stringify({ message: userInput }),
        })
            .then((res) => res.text())
            .then((response) => { //응답받음
                hideTypingIndicator(); //타이핑 애니메이션 제거
                appendMessage(response || "응답이 없습니다.", "bot");
            })
            .catch((err) => {//에러
                hideTypingIndicator();//타이핑애니메이션 제거
                appendMessage("에러 발생", "bot");
                console.error(err);
            });
    }

    // 타이핑 인디케이터 표시
    function showTypingIndicator() {
        const typingContainer = document.createElement("div");
        typingContainer.className = "message-container bot";
        typingContainer.id = "typing-indicator";

        const typingBox = document.createElement("div");
        typingBox.className = "message bot typing";
        typingBox.innerHTML = `
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;

        typingContainer.appendChild(typingBox);
        messages.appendChild(typingContainer);
        messages.scrollTop = messages.scrollHeight;
    }

    function hideTypingIndicator() {
        const typingIndicator = document.getElementById("typing-indicator");
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
});