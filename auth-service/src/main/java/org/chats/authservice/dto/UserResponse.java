package org.chats.authservice.dto;


import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class UserResponse {

    private String userId;
    private String profileImageURL;
    private String emailId;
    private String userName;
    private String fullName;
    private LocalDateTime lastSeen;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    List<String> allChatRooms;
}
