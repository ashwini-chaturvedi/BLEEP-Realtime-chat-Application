package com.chats.chat_service.service;

import com.chats.chat_service.repository.ChatRoomRepository;
import com.chats.chat_service.dto.ChatRoomRequest;
import com.chats.chat_service.dto.ChatRoomResponse;
import com.chats.chat_service.entity.ChatRoom;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatRoomService {

    private final ChatRoomRepository chatRoomRepository;
    private final WebClient webClient;

    private ChatRoomResponse mapChatRoomToChatRoomResponse(ChatRoom chatRoom) {
        ChatRoomResponse newChatRoomResponse = new ChatRoomResponse();

        newChatRoomResponse.setChatRoomId(chatRoom.getChatRoomId());
        newChatRoomResponse.setChatRoomProfileURL(chatRoom.getChatRoomProfileURL());
        newChatRoomResponse.setChatRoomName(chatRoom.getChatRoomName());
        newChatRoomResponse.setChatRoomType(chatRoom.getChatRoomType());
        newChatRoomResponse.setIsGroupChatting(chatRoom.getIsGroupChatting());
        newChatRoomResponse.setParticipants(chatRoom.getParticipants());
        newChatRoomResponse.setCreatedBy(chatRoom.getCreatedBy());
        newChatRoomResponse.setLastMessage(chatRoom.getLastMessage());
        newChatRoomResponse.setCreatedAt(chatRoom.getCreatedAt());
        newChatRoomResponse.setUpdatedAt(chatRoom.getUpdatedAt());

        return newChatRoomResponse;
    }

    public Mono<ChatRoomResponse> createChatRoom(ChatRoomRequest request) {
        //verify the user with the createdBy field from User Microservice


        ChatRoom newChatRoom = new ChatRoom();
        newChatRoom.setChatRoomName(request.getChatRoomName());
        newChatRoom.setChatRoomProfileURL(request.getChatRoomProfileURL());
        newChatRoom.setChatRoomType(request.getChatRoomType());
        newChatRoom.setIsGroupChatting(request.getIsGroupChatting());
        newChatRoom.setParticipants(request.getParticipants());
        newChatRoom.setCreatedBy(request.getCreatedBy());
        newChatRoom.setLastMessage(null);

        try {
            //Reactive Mono Response
            Mono<ChatRoomResponse> createdChatRoomResponseMono =
                    this.chatRoomRepository.save(newChatRoom)
                            .map(this::mapChatRoomToChatRoomResponse)
                            .onErrorMap(e -> new RuntimeException("Error occurred while creating a Message: " + e.getMessage()));

            //Iterating for each participant and putting the chat room id in their chat list
            Mono<ChatRoomResponse> finalResult = createdChatRoomResponseMono.flatMap(chatRoomResponse -> {
                String chatRoomId = chatRoomResponse.getChatRoomId();

                // For each participant, make a PUT call
                return Flux.fromIterable(newChatRoom.getParticipants())
                        .flatMap(userId ->
                                webClient.put()
                                        .uri("http://USER-SERVICE/user/addChatRoom/{userId}/{chatRoomId}", userId, chatRoomId)
                                        .retrieve()
                                        .bodyToMono(new ParameterizedTypeReference<List<String>>() {}) // assuming endpoint returns 200 OK with no body
                        )
                        .then(Mono.just(chatRoomResponse));
                // after all PUT calls complete, return original ChatRoomResponse
            });

            return finalResult;

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public Mono<ChatRoomResponse> getChatRoom(String chatRoomId) {
        return chatRoomRepository.findById(chatRoomId)
                .switchIfEmpty(Mono.error(new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Chat room not found: " + chatRoomId)))
                .map(chatRoom -> mapChatRoomToChatRoomResponse(chatRoom));
    }



    public List<ChatRoomResponse> getAllChatRooms(String createdBy) {
        //Verify the Created By from the UserService that if this user is there or not
        if (!this.chatRoomRepository.existsByCreatedBy(createdBy)) {
            throw new RuntimeException("No Chat Room is Present For User with UserId:" + createdBy);
        }

        List<ChatRoom> listOfAllTheChatRooms = Collections.singletonList(this.chatRoomRepository.findAllByCreatedBy(createdBy));
        List<ChatRoomResponse> chatRoomResponseList = listOfAllTheChatRooms.stream()
                .map(chatRoom -> {
                    return mapChatRoomToChatRoomResponse(chatRoom);
                })
                .toList();

        return chatRoomResponseList;
    }
}
