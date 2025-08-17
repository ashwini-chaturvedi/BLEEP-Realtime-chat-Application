package com.chats.chat_service.dto;

import com.chats.chat_service.entity.ChatRoomType;
import com.chats.chat_service.entity.LastMessagePreview;
import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ChatRoomRequest {

    private String chatRoomName;

    private String chatRoomProfileURL;

    private ChatRoomType chatRoomType;

    private Boolean isGroupChatting;

    private List<String> participants;

    private String createdBy;
}
