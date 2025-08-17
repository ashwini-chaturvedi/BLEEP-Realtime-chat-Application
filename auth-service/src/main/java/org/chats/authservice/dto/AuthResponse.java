package org.chats.authservice.dto;

import lombok.Data;

@Data
public class AuthResponse {
    private String id;
    private String emailId;
    private String userName;
    private String password;
}
