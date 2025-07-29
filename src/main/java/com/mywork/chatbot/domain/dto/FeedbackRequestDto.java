package com.mywork.chatbot.domain.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class FeedbackRequestDto {
    private String messageId;
    private String sessionId;
    private String userMessage;
    private String chatbotResponse;
    private int rating; // 1: 좋아요, -1: 싫어요
}
