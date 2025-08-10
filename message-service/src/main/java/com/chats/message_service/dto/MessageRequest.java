package com.chats.message_service.dto;

import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class MessageRequest {

    private String chatRoomId;
    private String tempId;
    private String sendersId;
    private String contentType;
    private String content;
    private List<String> readBy;
    private List<String> participants;
    private boolean isTemporary;
}
