package com.chats.user_service.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "person")
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String userId;

    private String profileImageURL;

    @Email(message = "Invalid Email")
    @Column(unique = true,nullable = false)
    private String emailId;


    @Column(unique = true,nullable = false)
    private String userName;

    private String fullName;

    @Column(nullable = false)
    private String password;

    private Status status;

    private LocalDateTime lastSeen;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    List<String> allChatRooms;


}
