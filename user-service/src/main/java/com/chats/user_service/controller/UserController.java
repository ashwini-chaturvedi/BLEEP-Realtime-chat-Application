package com.chats.user_service.controller;

import com.chats.user_service.dto.UserRequest;
import com.chats.user_service.dto.UserResponse;
import com.chats.user_service.service.PatternDeterminer;
import com.chats.user_service.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    private final PatternDeterminer patternDeterminer;

    @PostMapping("/create")
    public ResponseEntity<UserResponse> createUser(@RequestBody UserRequest userRequest){
        try{
            System.out.println("User Request:"+userRequest);
            return ResponseEntity.ok(this.userService.createUser(userRequest));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @GetMapping("/addFriend/{text}")
    public ResponseEntity<UserResponse> createUser(@PathVariable String text){
        try{
            return ResponseEntity.ok(this.userService.getUser(text));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
    @GetMapping("/find/{text}")
    public ResponseEntity<UserResponse> getUserByUserName(@PathVariable String text){
        try{
            String result=this.patternDeterminer.detectType(text);

            //new Switch technique
            return switch (result) {
                case "EMAIL" -> ResponseEntity.ok(this.userService.getUserByEmailId(text));
                case "USER-NAME" -> ResponseEntity.ok(this.userService.getUserByUserName(text));
                case "FULL-NAME" -> ResponseEntity.ok(this.userService.getUserByFullName(text));
                default -> ResponseEntity.notFound().build();
            };

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @GetMapping("/{userId}/allChats")
    public ResponseEntity<List<String>> getAllUsers(@PathVariable String userId){
        try{
            return ResponseEntity.ok(this.userService.getAllUsers(userId));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @GetMapping("/{userId}/validate")
    public ResponseEntity<?> validateUser(@PathVariable String userId){
        try{
            return ResponseEntity.ok(this.userService.validateUserId(userId));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }



    @PutMapping("/addChatRoom/{userId}/{chatRoomId}")
    public ResponseEntity<?> addNewChatRoom(@PathVariable String userId,@PathVariable String chatRoomId){
        try{
            return ResponseEntity.ok(this.userService.setNewChatRoomId(userId,chatRoomId));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }


}
