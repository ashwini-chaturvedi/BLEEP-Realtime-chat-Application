package com.chats.message_service.service;

import com.chats.message_service.dto.MessageRequest;
import com.chats.message_service.dto.MessageResponse;
import com.chats.message_service.entity.Message;
import com.chats.message_service.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;
    private final RabbitTemplate rabbitTemplate;

    private static final Logger logger = LoggerFactory.getLogger(MessageService.class);

    @Value("${rabbitmq.exchange.saved-messages}")
    private String savedMessagesExchange;

    @Value("${rabbitmq.routing-key.saved}")
    private String savedMessagesRoutingKey;

    /**
     * This is the primary method for handling new chat messages.
     * It listens to RabbitMQ, saves the message, and then publishes it back.
     */
    @RabbitListener(queues = "${rabbitmq.queue.new-messages}")
    public void handleNewMessage(MessageRequest incomingMessage) {
        logger.info("Received new message to process: {}", incomingMessage);

        // 1. Create a Message entity from the incoming request DTO
        Message newMessage = new Message();
        newMessage.setChatRoomId(incomingMessage.getChatRoomId());
        newMessage.setContentType(incomingMessage.getContentType());
        newMessage.setContent(incomingMessage.getContent());
        newMessage.setReadBy(incomingMessage.getReadBy());
        newMessage.setParticipants(incomingMessage.getParticipants());
        newMessage.setSendersId(incomingMessage.getSendersId());


        // 2. Save the message to the database first.
        // The '.subscribe()' triggers the reactive save operation.
        messageRepository.save(newMessage)
                .doOnSuccess(savedMessage -> {
                    // This block executes only after the message is successfully saved.
                    logger.info("Successfully saved message with ID: {}", savedMessage.getMessageId());

                    // 3. Create the outgoing DTO for broadcasting.
                    MessageResponse outgoingMessage=mapMessageToMessageResponse(savedMessage);

                    // 4. Publish the saved message back to RabbitMQ for broadcasting.
                    rabbitTemplate.convertAndSend(savedMessagesExchange, savedMessagesRoutingKey, outgoingMessage);
                    logger.info("Published saved message back to the '{}' exchange", savedMessagesExchange);
                })
                .doOnError(error -> {
                    logger.error("Failed to save message from sender '{}' to database.",
                            incomingMessage.getSendersId(), error);
                })
                .subscribe(); // This is crucial to start the reactive chain.
    }

    private MessageResponse mapMessageToMessageResponse(Message message) {
        MessageResponse response = new MessageResponse();
        response.setMessageId(message.getMessageId());
        response.setChatRoomId(message.getChatRoomId());
        response.setContentType(message.getContentType());
        response.setContent(message.getContent());
        response.setReadBy(message.getReadBy());
        response.setParticipants(message.getParticipants());
        response.setSendersId(message.getSendersId());
        response.setTimeStamp(message.getTimeStamp());
        response.setUpdatedAt(message.getUpdatedAt());
        return response;
    }


    public Mono<MessageResponse> createMessage(MessageRequest messageRequest) {
        Message newMessage = new Message();
        newMessage.setChatRoomId(messageRequest.getChatRoomId());
        newMessage.setContentType(messageRequest.getContentType());
        newMessage.setContent(messageRequest.getContent());
        newMessage.setReadBy(messageRequest.getReadBy());
        newMessage.setParticipants(messageRequest.getParticipants());
        newMessage.setSendersId(messageRequest.getSendersId());

        return this.messageRepository.save(newMessage)
                .map(message -> mapMessageToMessageResponse(message))  // Assuming this returns Mono<MessageResponse>
                .onErrorMap(e -> new RuntimeException("Error occurred while creating a Message: " + e.getMessage()));
    }


    public Mono<MessageResponse> getMessage(String messageId) {

        try {

            return this.messageRepository.findById(messageId)
                    .map(message -> mapMessageToMessageResponse(message))
                    .onErrorResume(e->Mono.error(new RuntimeException("NOT FOUND MESSAGE FOR MessageID:"+messageId)));

        } catch (Exception e) {
            throw new RuntimeException(e + "Error occurred while creating a Message...");
        }
    }


    public Flux<MessageResponse> getAllMessagesForAChatRoom(String chatRoomId) {
        try {
            return this.messageRepository.findAllByChatRoomId(chatRoomId)
                    .map(message -> mapMessageToMessageResponse(message))
                    .onErrorMap(e -> new RuntimeException("Error occurred while fetching messages.", e));

        } catch (Exception e) {
            throw new RuntimeException(e + "Error occurred while creating a Message...");
        }
    }
}
