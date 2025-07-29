package com.mywork.chatbot.domain.entity;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder; // DTO -> Entity 변환 시 편리하게 사용 가능 (선택 사항)

import jakarta.persistence.*; // Spring Boot 3.x 이상 사용자 (사용하는 Spring Boot 버전에 맞게 선택)
import java.time.LocalDateTime;

@Entity
@Table(name = "CHAT_FEEDBACK")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "FEEDBACK_ID")
    private Long id;

    @Column(name = "MESSAGE_ID", nullable = false)
    private String messageId;

    @Column(name = "SESSION_ID", nullable = false)
    private String sessionId;

    @Column(name = "USER_MESSAGE", columnDefinition = "TEXT", nullable = false)
    private String userMessage;

    @Column(name = "CHATBOT_RESPONSE", columnDefinition = "TEXT", nullable = false)
    private String chatbotResponse;

    @Column(name = "RATING", nullable = false)
    private int rating;

    @Column(name = "FEEDBACK_TIME", nullable = false)
    private LocalDateTime feedbackTime;
}