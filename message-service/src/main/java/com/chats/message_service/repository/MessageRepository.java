package com.chats.message_service.repository;

import com.chats.message_service.dto.MessageResponse;
import com.chats.message_service.entity.Message;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;

@Repository
public interface MessageRepository extends ReactiveMongoRepository<Message,String> {

    Flux<Message> findAllByChatRoomId(String chatRoomId);
}
