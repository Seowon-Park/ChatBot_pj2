package com.mywork.chatbot.controller;

import com.mywork.chatbot.service.ChatBotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Controller
public class ChatBotController {

    private final ChatBotService chatBotService;

    @Autowired
    public ChatBotController(ChatBotService chatBotService) {
        this.chatBotService = chatBotService;
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
    public CompletableFuture<ResponseEntity<String>> chatbot(
            @RequestBody Map<String, String> request,
            HttpServletRequest httpRequest) {

        String message = request.get("message");
        String sessionId = httpRequest.getHeader("X-Session-ID");

        // 디버깅용 로그
        System.out.println("Received message: " + message);
        System.out.println("Received session ID: " + sessionId);

        return chatBotService.callBotAsync(message, sessionId)
                .thenApply(ResponseEntity::ok);
    }

    // 폼 제출 방식
    @PostMapping("/chat")
    public String handleChatForm(@RequestParam String message, Model model) {
        try {
            String response = chatBotService.callBotSync(message, "default_session");
            model.addAttribute("userMessage", message);
            model.addAttribute("botResponse", response);
        } catch (Exception e) {
            model.addAttribute("error", "오류 발생: " + e.getMessage());
        }
        return "index";
    }
}