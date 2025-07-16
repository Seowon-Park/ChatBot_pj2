/**
 * 챗봇 클라이언트 JavaScript
 * Virtual Threads 챗봇 웹 애플리케이션
 */

// 전역 변수
let isLoading = false;
let messageHistory = [];

// DOM 요소 캐싱
let messageInput, sendBtn, chatMessages;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    setupEventListeners();
    welcomeMessage();
});

/**
 * DOM 요소 초기화
 */
function initializeElements() {
    messageInput = document.getElementById("msg");
    sendBtn = document.getElementById("sendBtn");
    chatMessages = document.getElementById("chatMessages");

    // 요소 존재 확인
    if (!messageInput || !sendBtn || !chatMessages) {
        console.error('필수 DOM 요소를 찾을 수 없습니다.');
        return;
    }

    // 입력 필드에 포커스
    messageInput.focus();
}

/**
 * 이벤트 리스너 설정
 */
function setupEventListeners() {
    // 엔터 키로 메시지 전송
    messageInput.addEventListener("keypress", function(event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendChat(event);
        }
    });

    // 입력 필드 포커스 유지
    messageInput.addEventListener("blur", function() {
        setTimeout(() => messageInput.focus(), 100);
    });
}

/**
 * 환영 메시지 (선택사항)
 */
function welcomeMessage() {
    console.log('Virtual Threads 챗봇이 준비되었습니다.');
}

/**
 * 채팅 메시지 전송 메인 함수
 */
async function sendChat(event) {
    event.preventDefault();

    // 이미 로딩 중이면 무시
    if (isLoading) {
        return;
    }

    const message = messageInput.value.trim();

    // 빈 메시지 체크
    if (!message) {
        messageInput.focus();
        return;
    }

    // 메시지 히스토리에 추가
    messageHistory.push({
        type: 'user',
        content: message,
        timestamp: new Date()
    });

    // UI 업데이트
    addMessage(message, 'user-message');
    clearInput();
    setLoadingState(true);

    // 로딩 메시지 추가
    const loadingDiv = addMessage('응답을 생성중입니다...', 'bot-message loading');

    try {
        // 서버로 메시지 전송
        const response = await sendMessageToServer(message);

        // 로딩 메시지 제거
        removeMessage(loadingDiv);

        // 봇 응답 추가
        addMessage(response, 'bot-message');

        // 응답 히스토리에 추가
        messageHistory.push({
            type: 'bot',
            content: response,
            timestamp: new Date()
        });

    } catch (error) {
        // 로딩 메시지 제거
        removeMessage(loadingDiv);

        // 에러 메시지 추가
        const errorMessage = `오류가 발생했습니다: ${error.message}`;
        addMessage(errorMessage, 'bot-message');

        console.error('챗봇 요청 오류:', error);

    } finally {
        // 로딩 상태 해제
        setLoadingState(false);
    }
}

/**
 * 서버로 메시지 전송
 */
async function sendMessageToServer(message) {
    const response = await fetch('http://localhost:5001/answer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'  // 서버가 JSON 응답을 보내니 맞춰줍니다
        },
        body: JSON.stringify({ message })
    });

    if (!response.ok) {
        throw new Error(`서버 응답 오류: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();  // JSON 파싱
    return data.response;  // JSON 내 'response' 필드만 리턴
}

/**
 * 채팅 영역에 메시지 추가
 */
function addMessage(text, className) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ' + className;
    messageDiv.textContent = text;

    // 타임스탬프 추가 (개발 모드에서만)
    if (window.location.hostname === 'localhost') {
        messageDiv.title = new Date().toLocaleTimeString();
    }

    chatMessages.appendChild(messageDiv);
    scrollToBottom();

    return messageDiv;
}

/**
 * 메시지 제거
 */
function removeMessage(messageDiv) {
    if (messageDiv && messageDiv.parentNode) {
        chatMessages.removeChild(messageDiv);
    }
}

/**
 * 입력 필드 초기화
 */
function clearInput() {
    messageInput.value = '';
}

/**
 * 로딩 상태 설정
 */
function setLoadingState(loading) {
    isLoading = loading;
    sendBtn.disabled = loading;
    sendBtn.textContent = loading ? '전송 중...' : '전송';
    messageInput.disabled = loading;

    if (!loading) {
        messageInput.focus();
    }
}

/**
 * 채팅 영역을 맨 아래로 스크롤
 */
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * 메시지 히스토리 가져오기 (디버깅용)
 */
function getMessageHistory() {
    return messageHistory;
}

/**
 * 채팅 히스토리 초기화
 */
function clearChatHistory() {
    // 첫 번째 환영 메시지 제외하고 모든 메시지 제거
    const messages = chatMessages.querySelectorAll('.message');
    for (let i = 1; i < messages.length; i++) {
        messages[i].remove();
    }

    // 히스토리 배열 초기화
    messageHistory = [];

    console.log('채팅 히스토리가 초기화되었습니다.');
}

/**
 * 에러 처리를 위한 전역 에러 핸들러
 */
window.addEventListener('error', function(event) {
    console.error('JavaScript 오류:', event.error);
});

/**
 * 네트워크 상태 모니터링
 */
window.addEventListener('online', function() {
    console.log('네트워크 연결이 복구되었습니다.');
});

window.addEventListener('offline', function() {
    console.log('네트워크 연결이 끊어졌습니다.');
    addMessage('네트워크 연결을 확인해주세요.', 'bot-message');
});