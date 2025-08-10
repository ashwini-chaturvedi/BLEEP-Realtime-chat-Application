package com.chats.user_service.dto;


import com.chats.user_service.entity.Status;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class UserRequest {
    private String profileImageURL;
    private String emailId;
    private String userName;
    private String fullName;
    private String password;
    private Status status;
    private LocalDateTime lastSeen;
    List<String> allChatRooms;
}
