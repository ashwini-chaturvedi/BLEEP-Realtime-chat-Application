package org.chats.authservice.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;

@Entity
@Data
public class Auth {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    private String emailId;
    private String userName;
    private String password;
}
