package com.mywork.chatbot.controller;

import com.mywork.chatbot.domain.dto.FeedbackRequestDto;
import com.mywork.chatbot.service.FeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    @PostMapping("/feedback") // 최종 경로: /api/feedback
    public ResponseEntity<String> receiveFeedback(
            @RequestBody FeedbackRequestDto feedbackRequestDto) {

        try {
            feedbackService.saveFeedback(feedbackRequestDto);
            return ResponseEntity.ok("Feedback received and saved successfully!");
        } catch (Exception e) {
            System.err.println("Error saving feedback: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to save feedback: " + e.getMessage());
        }
    }
}