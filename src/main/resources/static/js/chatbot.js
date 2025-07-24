/**
 * 챗봇 클라이언트 JavaScript
 * Virtual Threads 챗봇 웹 애플리케이션
 */

// 전역 변수
let isLoading = false;
let messageHistory = [];

let chatSessionId = null; // 세션 ID를 저장할 변수


// DOM 요소 캐싱
let messageInput, sendBtn, chatMessages;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    setupEventListeners();
    
    // welcomeMessage(); // 기존 환영 메시지 호출 제거 또는 수정
    initializeChatSession(); // 새로운 세션 초기화 및 초기 메시지 요청 함수 호출
    
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
 * 이제 이 함수는 직접적으로 초기 메시지를 표시하지 않고,
 * 콘솔 로깅 용도로만 남겨두거나 삭제할 수 있습니다.
 */
function welcomeMessage() {
    console.log('Virtual Threads 챗봇이 준비되었습니다.');
}


/**
 * **새로운 함수: 세션 ID 생성 및 관리**
 * localStorage를 사용하여 브라우저 세션 전반에 걸쳐 고유한 ID를 유지합니다.
 */
function getSessionId() {
    let sessionId = localStorage.getItem('chatSessionId');
    if (!sessionId) {
        // 고유한 ID 생성 (간단한 예시, 더 강력한 UUID 생성기 사용 가능)
        sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('chatSessionId', sessionId);
    }
    return sessionId;
}

/**
 * **새로운 함수: 챗봇 세션 초기화 및 초기 메시지 요청**
 * 페이지 로드 시 Flask 챗봇 서버에 빈 메시지를 보내어 초기 상태를 설정하고 환영 메시지를 받습니다.
 */
async function initializeChatSession() {
    // 세션 ID 생성 또는 기존 ID 로드
    chatSessionId = getSessionId();
    console.log(`Chat session initialized with ID: ${chatSessionId}`);

    // 초기 로딩 메시지 추가 (선택사항)
    const initialLoadingDiv = addMessage('챗봇이 로딩 중입니다...', 'bot-message loading');
    setLoadingState(true);

    try {
        // 서버로 빈 메시지를 보내 초기 응답 요청 (sendMessageToServer가 X-Session-ID를 자동으로 포함)
        const response = await sendMessageToServer("");

        // 로딩 메시지 제거
        removeMessage(initialLoadingDiv);

        // Flask에서 받은 초기 메시지 화면에 표시
        addMessage(response, 'bot-message');
        messageHistory.push({
            type: 'bot',
            content: response,
            timestamp: new Date()
        });

    } catch (error) {
        removeMessage(initialLoadingDiv);
        const errorMessage = `챗봇 초기화 중 오류가 발생했습니다: ${error.message}`;
        addMessage(errorMessage, 'bot-message');
        console.error('챗봇 초기화 오류:', error);
    } finally {
        setLoadingState(false);
    }
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
        // 서버로 메시지 전송 (sendMessageToServer 함수에서 sessionId를 자동으로 추가)
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
 * **X-Session-ID 헤더를 추가하도록 수정**
 */
async function sendMessageToServer(message) {
    
    // chatSessionId 전역 변수를 사용. initializeChatSession에서 이미 설정되어 있을 것임.
    // 혹시 모를 경우를 대비해 getSessionId()를 한 번 더 호출해도 됩니다.
    const sessionIdToSend = chatSessionId || getSessionId();
    

    const response = await fetch('http://localhost:5001/answer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            
            'X-Session-ID': sessionIdToSend // 이 부분이 핵심: 세션 ID 헤더 추가
            
        },
        body: JSON.stringify({ message })
    });

    if (!response.ok) {
        throw new Error(`서버 응답 오류: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.response;
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
    // 모든 메시지 제거
    chatMessages.innerHTML = ''; // 이 방법이 더 간단하고 확실합니다.
    

    // 히스토리 배열 초기화
    messageHistory = [];
    
    // 세션 ID 초기화 (채팅 히스토리 초기화 시 새로운 세션 시작)
    localStorage.removeItem('chatSessionId');
    chatSessionId = null; // 전역 변수도 초기화

    console.log('채팅 히스토리가 초기화되었습니다. 새로운 세션이 시작됩니다.');
    initializeChatSession(); // 초기화 후 다시 초기 메시지 요청
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