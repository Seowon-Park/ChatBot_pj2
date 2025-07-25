package com.mywork.chatbot.controller;

import com.mywork.chatbot.service.ChatBotService;
import com.mywork.chatbot.domain.dto.ChatResponseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Controller
public class ChatBotController {

    private final ChatBotService chatBotService;
    private final ObjectMapper objectMapper;

    @Autowired
    public ChatBotController(ChatBotService chatBotService, ObjectMapper objectMapper) {

        this.chatBotService = chatBotService;
        this.objectMapper = objectMapper;
    }

    @GetMapping("/")
    public String index(Model model) {
        model.addAttribute("title", "Virtual Threads 챗봇");
        model.addAttribute("version", "1.0.0");
        return "index";
    }

    // 비동기 API 방식 (세션 ID 포함)
    @PostMapping("/chatbot")
    @ResponseBody
    public CompletableFuture<ResponseEntity<ChatResponseDto>> chatbot(
            @RequestBody Map<String, String> request,
            HttpServletRequest httpRequest) {

        String message = request.get("message");
        String sessionId = httpRequest.getHeader("X-Session-ID");

        // 디버깅용 로그
        System.out.println("Received message: " + message);
        System.out.println("Received session ID: " + sessionId);

        return chatBotService.callBotAsync(message, sessionId)
                .thenApply(ResponseEntity::ok)
                .exceptionally(ex -> {
                    System.err.println("Async chatbot error: " + ex.getMessage());
                    ChatResponseDto errorResponse = new ChatResponseDto();
                    errorResponse.setResponse("비동기 호출 오류: " + ex.getMessage());
                    errorResponse.setIntermediateMessages(new String[]{});
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
                });
    }

    // 폼 제출 방식
    @PostMapping("/chat")
    @ResponseBody // JSON 응답을 위해 @ResponseBody 유지
    public ResponseEntity<ChatResponseDto> handleChatJson(@RequestParam String message) {
        try {
            // chatBotService.callBotSync가 이제 ChatResponseDto 객체를 직접 반환
            ChatResponseDto chatResponse = chatBotService.callBotSync(message, "default_session");

            // ChatResponseDto 객체를 JSON으로 변환하여 반환 (Spring이 자동으로 처리)
            return ResponseEntity.ok(chatResponse);

        } catch (Exception e) {
            System.err.println("Error in /chat: " + e.getMessage());
            ChatResponseDto errorResponse = new ChatResponseDto();
            errorResponse.setResponse("오류 발생: " + e.getMessage());
            errorResponse.setIntermediateMessages(new String[]{});

            // HTTP 500 상태 코드와 함께 오류 응답 DTO 반환
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}