package org.chats.authservice.dto;


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
    private LocalDateTime lastSeen;
    List<String> allChatRooms;
}
