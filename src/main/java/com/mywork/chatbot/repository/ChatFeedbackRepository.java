package com.mywork.chatbot.repository;

import com.mywork.chatbot.domain.entity.ChatFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatFeedbackRepository extends JpaRepository<ChatFeedback, Long> {
}
