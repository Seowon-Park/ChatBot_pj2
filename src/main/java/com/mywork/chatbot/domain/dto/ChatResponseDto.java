package com.mywork.chatbot.domain.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponseDto {
    private String response;
    private List<String> intermediateMessages;
    private Boolean isFinalAnswer;
}