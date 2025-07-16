package com.mywork.chatbot.service;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
public class ChatBotService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final String flaskUrl = "http://localhost:5001/answer";

    //비동기처리
    @Async
    public CompletableFuture<String> callBotAsync(String message) {
        String response = callBotSync(message);
        return CompletableFuture.completedFuture(response);
    }

    //동기처리
    public String callBotSync(String message) {
        try {
            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("message", message);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, String>> request = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(flaskUrl, request, Map.class);
            return (String) response.getBody().get("response");

        } catch (Exception e) {
            return "⚠️ 서버 오류: " + e.getMessage();
        }
    }
}