package com.chats.chat_service.repository;

import com.chats.chat_service.entity.ChatRoom;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatRoomRepository extends ReactiveMongoRepository<ChatRoom,String> {
    boolean existsByChatRoomId(String chatRoomId);

    ChatRoom findByChatRoomId(String chatRoomId);

    boolean existsByCreatedBy(String createdBy);

    ChatRoom findAllByCreatedBy(String createdBy);
}
