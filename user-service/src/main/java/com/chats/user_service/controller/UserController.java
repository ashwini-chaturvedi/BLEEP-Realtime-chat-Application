package com.chats.user_service.controller;

import com.chats.user_service.dto.UserRequest;
import com.chats.user_service.dto.UserResponse;
import com.chats.user_service.service.PatternDeterminer;
import com.chats.user_service.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/user")
@CrossOrigin(methods = {RequestMethod.PUT,RequestMethod.POST,RequestMethod.GET},origins = "http://localhost:5173/")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private PatternDeterminer patternDeterminer;

    @PostMapping("/create")
    public ResponseEntity<UserResponse> createUser(@RequestBody UserRequest userRequest){
        try{
            System.out.println("User Request:"+userRequest);
            return ResponseEntity.ok(this.userService.createUser(userRequest));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
    @GetMapping("/auth/{emailId}")
    public ResponseEntity<String> auth(@PathVariable String  emailId){
        try{
            System.out.println("Email Id:"+emailId);
            return ResponseEntity.ok(this.userService.getUserId(emailId));
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

    @PutMapping("/{userId}/{chatRoomId}")
    public ResponseEntity<List<String>> addNewChatRoom(@PathVariable String userId,@PathVariable String chatRoomId){
        try{
            return ResponseEntity.ok(this.userService.setNewChatRoomId(userId,chatRoomId));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }


}
