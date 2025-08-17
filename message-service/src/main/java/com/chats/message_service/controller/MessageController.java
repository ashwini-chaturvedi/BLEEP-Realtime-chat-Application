package com.chats.message_service.controller;

import com.chats.message_service.dto.MessageRequest;
import com.chats.message_service.dto.MessageResponse;
import com.chats.message_service.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;

@RestController
@RequestMapping("/message")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @PostMapping("/create")
    public Mono<ResponseEntity<MessageResponse>> createMessage(@RequestBody MessageRequest messageRequest) {
        return this.messageService.createMessage(messageRequest)
                .map(ResponseEntity::ok)
                .onErrorReturn(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build());
    }

    @GetMapping("/{messageId}")
    public ResponseEntity<Mono<MessageResponse>> getMessage(@PathVariable String messageId) {
        try {
            return ResponseEntity.ok( this.messageService.getMessage(messageId));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @GetMapping("/chat-room-id/{chatRoomId}")
    public Flux<MessageResponse> getAllMessagesForAChatRoom(@PathVariable String chatRoomId) {
        try {
            return this.messageService.getAllMessagesForAChatRoom(chatRoomId);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

//    @PutMapping("/update/{chatRoomId}")
//    public ResponseEntity<MessageResponse> updateMessage(@PathVariable String chatRoomId) {
//        try {
//            return ResponseEntity.ok(this.messageService.getMessage(chatRoomId));
//        } catch (Exception e) {
//            throw new RuntimeException(e);
//        }
//    }


}
