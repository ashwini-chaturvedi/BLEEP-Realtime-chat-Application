package com.chats.chat_service.controller;

import com.chats.chat_service.dto.ChatRoomRequest;
import com.chats.chat_service.dto.ChatRoomResponse;
import com.chats.chat_service.service.ChatRoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;

@RestController
@RequestMapping("/chat-room")
public class ChatRoomController {

    @Autowired
    private ChatRoomService chatService;

    @PostMapping("/create")
    public ResponseEntity<Mono<ChatRoomResponse>> createChat(@RequestBody ChatRoomRequest request) {
        System.out.println(request);
        try {
            return ResponseEntity.ok(this.chatService.createChatRoom(request));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @GetMapping("/{chatRoomId}")
    public ResponseEntity<Mono<ChatRoomResponse>> getChatRoom(@PathVariable String chatRoomId) {
        try {
            return ResponseEntity.ok(this.chatService.getChatRoom(chatRoomId));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @GetMapping("/allChats")
    public Flux<ChatRoomResponse> getAllChatRooms(@RequestParam List<String> ids) {
        return Flux.fromIterable(ids)
                // flatMap executes the inner Mono for each ID concurrently
                .flatMap(chatRoomId -> this.chatService.getChatRoom(chatRoomId));
    }
}