package com.mywork.chatbot.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.mywork.chatbot.domain.dto.ChatResponseDto;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
public class ChatBotService {

    @Value("${chatbot.ai.server.url:http://localhost:5001/answer}")
    private String aiServerUrl;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public ChatBotService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    public ChatBotService(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    public CompletableFuture<ChatResponseDto> callBotAsync(String message, String sessionId) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                return callBotSync(message, sessionId); // 동기 메서드를 호출하여 DTO 반환
            } catch (Exception e) {
                // 비동기 처리 중 발생한 예외를 CompletableFuture에 전달
                throw new RuntimeException("비동기 AI 서버 호출 중 오류 발생", e);
            }
        });
    }

    public ChatResponseDto callBotSync(String message, String sessionId) throws Exception { // 예외를 던지도록 선언
        try {
            // AI 서버로 보낼 요청 데이터 구성
            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("message", message);

            // HTTP 헤더 설정
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // 세션 ID 헤더 추가
            if (sessionId != null && !sessionId.isEmpty()) {
                headers.set("X-Session-ID", sessionId);
                System.out.println("Sending to AI server with session ID: " + sessionId);
            } else {
                headers.set("X-Session-ID", "default_session");
                System.out.println("Using default session ID");
            }

            HttpEntity<Map<String, String>> entity = new HttpEntity<>(requestBody, headers);

            // AI 서버에 POST 요청
            // Python 서버가 {"response": "...", "intermediate_messages": [...]} 형태의 JSON을 반환하므로,
            // ResponseEntity<String>으로 전체 JSON 문자열을 받습니다.
            ResponseEntity<String> response = restTemplate.exchange(
                    aiServerUrl,
                    HttpMethod.POST,
                    entity,
                    String.class // 응답 본문을 String으로 받도록 변경
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                String rawJsonResponse = response.getBody();
                System.out.println("AI server raw JSON response: " + rawJsonResponse); // 디버깅용

                // JSON 문자열을 ChatResponseDto 객체로 변환
                return objectMapper.readValue(rawJsonResponse, ChatResponseDto.class);
            } else {
                // 응답이 없거나 상태 코드가 OK가 아닌 경우
                ChatResponseDto errorDto = new ChatResponseDto();
                errorDto.setResponse("AI 서버에서 응답을 받을 수 없습니다. 상태 코드: " + response.getStatusCode());
                errorDto.setIntermediateMessages(Collections.emptyList());
                errorDto.setIsFinalAnswer(true);
                return errorDto;
            }

        } catch (Exception e) {
            System.err.println("AI 서버 호출 중 오류 발생: " + e.getMessage());
            e.printStackTrace();
            // 오류 발생 시에도 ChatResponseDto 객체를 반환
            ChatResponseDto errorDto = new ChatResponseDto();
            errorDto.setResponse("죄송합니다. 현재 서비스에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
            errorDto.setIntermediateMessages(Collections.emptyList());
            errorDto.setIsFinalAnswer(true);
            return errorDto;
        }
    }
}