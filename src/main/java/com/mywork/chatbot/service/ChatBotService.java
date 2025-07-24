package com.mywork.chatbot.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
public class ChatBotService {

    @Value("${chatbot.ai.server.url:http://localhost:5001/answer}")
    private String aiServerUrl;

    private final RestTemplate restTemplate;

    public ChatBotService() {
        this.restTemplate = new RestTemplate();
    }

    public CompletableFuture<String> callBotAsync(String message, String sessionId) {
        return CompletableFuture.supplyAsync(() -> callBotSync(message, sessionId));
    }

    public String callBotSync(String message, String sessionId) {
        try {
            // AI 서버로 보낼 요청 데이터 구성
            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("message", message);

            // HTTP 헤더 설정
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // 세션 ID 헤더 추가 (AI 서버가 기대하는 헤더)
            if (sessionId != null && !sessionId.isEmpty()) {
                headers.set("X-Session-ID", sessionId);
                System.out.println("Sending to AI server with session ID: " + sessionId); // 디버깅용
            } else {
                headers.set("X-Session-ID", "default_session");
                System.out.println("Using default session ID"); // 디버깅용
            }

            HttpEntity<Map<String, String>> entity = new HttpEntity<>(requestBody, headers);

            // AI 서버에 POST 요청
            ResponseEntity<Map> response = restTemplate.exchange(
                    aiServerUrl,
                    HttpMethod.POST,
                    entity,
                    Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();
                String aiResponse = (String) responseBody.get("response");
                System.out.println("AI server response: " + aiResponse); // 디버깅용
                return aiResponse;
            } else {
                return "AI 서버에서 응답을 받을 수 없습니다.";
            }

        } catch (Exception e) { //서버에 문제 발생!(서버 다운 등)
            System.err.println("AI 서버 호출 중 오류 발생: " + e.getMessage());
            e.printStackTrace(); // 상세 에러 로그
            return "죄송합니다. 현재 서비스에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.";
        }
    }
}