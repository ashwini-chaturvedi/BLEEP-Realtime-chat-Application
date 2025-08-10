package com.chats.message_service.dto;

import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class MessageResponse {
    private String messageId;
    private String tempId;
    private String chatRoomId;
    private String sendersId;
    private String contentType;
    private String content;
    private List<String> readBy;
    private List<String> participants;
    private LocalDateTime timeStamp;
    private LocalDateTime updatedAt;
    private boolean isTemporary;

}
