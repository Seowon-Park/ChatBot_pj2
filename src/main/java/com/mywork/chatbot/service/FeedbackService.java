package com.mywork.chatbot.service;
import com.mywork.chatbot.domain.dto.FeedbackRequestDto;
import com.mywork.chatbot.domain.entity.ChatFeedback;
import com.mywork.chatbot.repository.ChatFeedbackRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class FeedbackService {

    private final ChatFeedbackRepository chatFeedbackRepository;

    public FeedbackService(ChatFeedbackRepository chatFeedbackRepository) {
        this.chatFeedbackRepository = chatFeedbackRepository;
    }

    @Transactional
    public ChatFeedback saveFeedback(FeedbackRequestDto requestDto) {
        ChatFeedback chatFeedback = new ChatFeedback();
        chatFeedback.setMessageId(requestDto.getMessageId());
        chatFeedback.setSessionId(requestDto.getSessionId());
        chatFeedback.setUserMessage(requestDto.getUserMessage());
        chatFeedback.setChatbotResponse(requestDto.getChatbotResponse());
        chatFeedback.setRating(requestDto.getRating());
        chatFeedback.setFeedbackTime(LocalDateTime.now());

        return chatFeedbackRepository.save(chatFeedback);
    }
}