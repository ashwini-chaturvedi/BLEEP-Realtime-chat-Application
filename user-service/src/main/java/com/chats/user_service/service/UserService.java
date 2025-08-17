package com.chats.user_service.service;

import com.chats.user_service.dto.UserRequest;
import com.chats.user_service.dto.UserResponse;
import com.chats.user_service.entity.User;
import com.chats.user_service.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class UserService {


    private final UserRepository userRepository;

    private  UserResponse mapUserToUserResponse(User user) {

        UserResponse userResponse = new UserResponse();

        userResponse.setUserId(user.getUserId());
        userResponse.setUserName(user.getUserName());
        userResponse.setEmailId(user.getEmailId());
        userResponse.setFullName(user.getFullName());
        userResponse.setProfileImageURL(user.getProfileImageURL());
        userResponse.setStatus(user.getStatus());
        userResponse.setLastSeen(user.getLastSeen());
        userResponse.setCreatedAt(user.getCreatedAt());
        userResponse.setUpdatedAt(user.getUpdatedAt());

        return userResponse;
    }

    public UserResponse createUser(UserRequest userRequest) {

        if (this.userRepository.existsByEmailId(userRequest.getEmailId())) {
            throw new RuntimeException("User with EmailId " + userRequest.getEmailId() + " Already Exists");
        }
        if (this.userRepository.existsByUserName(userRequest.getUserName())) {
            throw new RuntimeException("User with UserName " + userRequest.getUserName() + " Already Exists");
        }

        User newUser = new User();

        newUser.setUserName(userRequest.getUserName());
        newUser.setEmailId(userRequest.getEmailId());
        newUser.setFullName(userRequest.getFullName());
        newUser.setProfileImageURL(userRequest.getProfileImageURL());
        newUser.setStatus(userRequest.getStatus());

        try {
            return this.mapUserToUserResponse(this.userRepository.save(newUser));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public UserResponse getUser(String userId) {
        User existingUser = this.userRepository
                .findById(userId)
                .orElseThrow(() -> new RuntimeException("User Not " +
                        "Found"));

        return mapUserToUserResponse(existingUser);
    }

    public List<String> getAllUsers(String userId) {
        User existingUser = this.userRepository
                .findById(userId)
                .orElseThrow(() -> new RuntimeException("User Not " +
                        "Found"));
        return existingUser.getAllChatRooms();

    }


    public List<String> setNewChatRoomId(String userId, String chatRoomId) {
        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User Not Found"));

        List<String> allChatRooms = existingUser.getAllChatRooms();
        if (allChatRooms == null) {
            allChatRooms = new ArrayList<>();
        }

        allChatRooms.add(chatRoomId); // add new room
        existingUser.setAllChatRooms(allChatRooms);

        userRepository.save(existingUser); // could be optional if within @Transactional and user is managed

        return allChatRooms;
    }


    public UserResponse getUserByUserName(String userName) {
        System.out.println("UserName:"+userName);
        User existingUser = this.userRepository.findByUserName(userName);

        return mapUserToUserResponse(existingUser);
    }
    public UserResponse getUserByFullName(String fullName) {
        User existingUser = this.userRepository.findByFullName(fullName);

        return mapUserToUserResponse(existingUser);
    }

    public UserResponse getUserByEmailId(String emailId) {
        User existingUser = this.userRepository.findByEmailId(emailId);

        return mapUserToUserResponse(existingUser);
    }

    public boolean validateUserName(String userName) {
        return this.userRepository.existsByUserName(userName);
    }


    public boolean validateUserId(String userId) {
        return this.userRepository.existsById(userId);
    }
}
