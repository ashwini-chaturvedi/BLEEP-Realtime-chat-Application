package com.chats.chat_service.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class LastMessagePreview {
    private String messageId;
    private String text;
    private String senderId;
    private LocalDateTime timestamp;
}
