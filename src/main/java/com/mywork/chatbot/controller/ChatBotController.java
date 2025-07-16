package com.mywork.chatbot.controller;

import com.mywork.chatbot.service.ChatBotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

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

    // 비동기 API 방식
    @PostMapping("/chatbot")
    @ResponseBody
    public CompletableFuture<ResponseEntity<String>> chatbot(@RequestBody Map<String, String> request) {
        String message = request.get("message");
        return chatBotService.callBotAsync(message)
                .thenApply(ResponseEntity::ok);
    }

    // 폼 제출 방식
    @PostMapping("/chat")
    public String handleChatForm(@RequestParam String message, Model model) {
        try {
            String response = chatBotService.callBotSync(message);
            model.addAttribute("userMessage", message);
            model.addAttribute("botResponse", response);
        } catch (Exception e) {
            model.addAttribute("error", "오류 발생: " + e.getMessage());
        }
        return "index";
    }
}