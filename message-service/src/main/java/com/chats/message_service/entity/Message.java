package com.chats.message_service.entity;

import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "Message")
@Data
public class Message {
    @Id
    private String messageId;

    private String tempId;
    private String chatRoomId;
    private String sendersId;
    private String contentType;
    private String content;
    private List<String> readBy;
    private List<String> participants;
    private boolean isTemporary;

    @CreatedDate
    private LocalDateTime timeStamp;

    @LastModifiedDate // Optional: for tracking updates
    private LocalDateTime updatedAt;

}
