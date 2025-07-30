// chatbot.js - 말풍선 스타일 적용

document.addEventListener("DOMContentLoaded", function () {
    const toggleButton = document.getElementById("chatbot-toggle");
    const chatbotContainer = document.getElementById("chatbot-container");
    const inputField = document.getElementById("chatbot-input-field");
    const sendButton = document.getElementById("chatbot-send");
    const messages = document.getElementById("chatbot-messages");

    const sessionId = 'session_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    let isFirstOpen = true;
    let lastUserQuestion = "";
    let lastChatbotResponse = "";
    const ratedMessageIds = new Set();

    toggleButton.addEventListener("click", () => {
        const isHidden = chatbotContainer.style.display === "none" || chatbotContainer.style.display === "";
        chatbotContainer.style.display = isHidden ? "flex" : "none";

        if (isHidden && isFirstOpen) {
            showInitialMessage();
            isFirstOpen = false;
        }
    });

    sendButton.addEventListener("click", sendMessage);
    inputField.addEventListener("keydown", (e) => {
        if (e.key === "Enter") sendMessage();
    });

    function appendMessage(text, sender, isIntermediate, isThinking, isFinal) {

        const messageContainer = document.createElement("div");
        messageContainer.className = `message-container ${sender}`;

        const messageBox = document.createElement("div");
        messageBox.className = `message ${sender}`;

        if (isIntermediate) {
            messageBox.classList.add('intermediate-message');
            messageBox.classList.add('bot-message', 'info');
        }
        if (isThinking) {
            messageBox.classList.add('thinking-message');
        }

        messageBox.textContent = text;
        messageContainer.appendChild(messageBox);
        messages.appendChild(messageContainer);
        messages.scrollTop = messages.scrollHeight;

        if (sender === "bot" && !isIntermediate && !isThinking && isFinal) {
            const messageId = `msg_${Date.now()}`;
            messageBox.id = messageId;

            const feedbackContainer = document.createElement("div");
            feedbackContainer.className = "feedback-buttons";

            const likeButton = document.createElement("button");
            likeButton.className = "feedback-button like";
            likeButton.innerHTML = "👍";
            likeButton.title = "이 답변이 도움이 되었습니다.";
            likeButton.addEventListener("click", () => sendFeedback(messageId, lastUserQuestion, text, 1, feedbackContainer)); // 1: 좋아요

            const dislikeButton = document.createElement("button");
            dislikeButton.className = "feedback-button dislike";
            dislikeButton.innerHTML = "👎";
            dislikeButton.title = "이 답변이 도움이 되지 않았습니다.";
            dislikeButton.addEventListener("click", () => sendFeedback(messageId, lastUserQuestion, text, -1, feedbackContainer)); // -1: 싫어요

            feedbackContainer.appendChild(likeButton);
            feedbackContainer.appendChild(dislikeButton);
            messageContainer.appendChild(feedbackContainer);
        }

        return messageBox;
    }

    function showInitialMessage() {
        appendMessage("안녕하세요. 패캠 행정문의 챗봇 '우주🌌🧑‍🚀' 입니다. 학번을 말해주세요.", "bot", false, false, false);
    }

    function sendMessage() {
        const userInput = inputField.value.trim();
        if (!userInput) {
            appendMessage("학번을 입력해주세요.", "bot", false, false, false);
            return;
        }

        appendMessage(userInput, "user", false, false, false);
        lastUserQuestion = userInput;
        inputField.value = "";

        showTypingIndicator();

        fetch("/chatbot", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Session-ID": sessionId
            },
            body: JSON.stringify({message: userInput}),
        })
            .then((res) => res.json())
            .then(async (data) => {
                const intermediateMessages = data.intermediateMessages || [];
                const finalResponse = data.response || "응답이 없습니다.";
                const isFinalAnswerFromServer = data.isFinalAnswer !== undefined ? data.isFinalAnswer : false;

                hideTypingIndicator();

                for (const msg of intermediateMessages) {
                    appendMessage(msg, "bot", true, false, false);
                    await new Promise(resolve => setTimeout(resolve, 500));
                }

                if (isFinalAnswerFromServer && finalResponse.includes("죄송합니다.")) {
                    appendMessage(finalResponse, "bot error-message", false, false, false); // 새로운 CSS 클래스 적용
                } else if (isFinalAnswerFromServer) {
                    appendMessage(finalResponse, "bot", false, false, true);
                } else {
                    appendMessage(finalResponse, "bot intermediate", false, false, false);
                }
                lastChatbotResponse = finalResponse;
            })
            .catch((error) => {
                console.error("Fetch error:", error);
                hideTypingIndicator();
                appendMessage("챗봇과 통신 중 오류가 발생했습니다. 네트워크 연결을 확인하거나 잠시 후 다시 시도해주세요.", "bot", false, false, false);
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

    async function sendFeedback(messageId, userMsg, botResp, rating, feedbackButtonsContainer) {
        if (ratedMessageIds.has(messageId)) {
            return;
        }

        try {
            const response = await fetch("/api/feedback", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Session-ID": sessionId,
                },
                body: JSON.stringify({
                    messageId: messageId,
                    sessionId: sessionId,
                    userMessage: userMsg,
                    chatbotResponse: botResp,
                    rating: rating
                }),
            });

            if (response.ok) {
                ratedMessageIds.add(messageId);

                if (feedbackButtonsContainer) {
                    feedbackButtonsContainer.innerHTML = '';

                    const feedbackConfirmation = document.createElement("span");
                    feedbackConfirmation.className = "feedback-confirmation";
                    feedbackConfirmation.textContent = rating === 1 ? "👍" : "👎";
                    feedbackButtonsContainer.appendChild(feedbackConfirmation);
                }

            } else {
                const errorData = await response.json();
                console.error("Failed to send feedback:", response.status, errorData);
                alert("피드백 전송에 실패했습니다. 잠시 후 다시 시도해주세요.");
            }
        } catch (error) {
            console.error("Network error while sending feedback:", error);
            alert("네트워크 오류로 피드백 전송에 실패했습니다.");
        }
    }
});