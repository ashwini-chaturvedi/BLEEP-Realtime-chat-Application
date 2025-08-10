package com.chats.websocket_service.dto;

import lombok.Data;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OutgoingMessageDTO {
    private String messageId;
    private String chatRoomId;
    private String sendersId;
    private String contentType;
    private String content;
    private List<String> readBy;
    private List<String> participants;
    private LocalDateTime timeStamp;
    private LocalDateTime updatedAt;

}
