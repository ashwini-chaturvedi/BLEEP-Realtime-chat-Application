package com.chats.websocket_service.dto;

import lombok.Data;

import java.util.List;

@Data
public class IncomingMessageDTO {
    private String chatRoomId;
    private String sendersId;
    private String contentType;
    private String content;
    private List<String> readBy;
    private List<String> participants;
}
