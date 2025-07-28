package com.mywork.chatbot.domain.dto;
import com.fasterxml.jackson.annotation.JsonProperty;
//{"answer": "수업 취소는..."}
public class ChatResponseDto {
    private String response;

    @JsonProperty("intermediate_messages")
    private String[] intermediateMessages;

    public ChatResponseDto() {}

    public String getResponse() {
        return response;
    }

    public void setResponse(String response) {
        this.response = response;
    }

    public String[] getIntermediateMessages() {
        return intermediateMessages;
    }

    public void setIntermediateMessages(String[] intermediateMessages) {
        this.intermediateMessages = intermediateMessages;
    }


}
