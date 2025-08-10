package com.chats.chat_service.dto;

import com.chats.chat_service.entity.ChatRoomType;
import com.chats.chat_service.entity.LastMessagePreview;
import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
public class ChatRoomResponse {
    private String chatRoomId;
    private String chatRoomProfileURL;
    private String chatRoomName;
    private ChatRoomType chatRoomType;
    private Boolean isGroupChatting;
    private List<String> participants;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LastMessagePreview lastMessage;
}
