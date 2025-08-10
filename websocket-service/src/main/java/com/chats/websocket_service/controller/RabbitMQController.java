package com.chats.websocket_service.controller;

import com.chats.websocket_service.dto.OutgoingMessageDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RabbitMQController {

    private static final Logger logger= LoggerFactory.getLogger(RabbitMQController.class);

   private final ObjectMapper objectMapper;

   private final ChatWebSocketController chatWebSocketController;


    /**
     * Listens to the "saved-messages-queue". This queue receives messages from the "saved-messages-exchange"
     * after they have been successfully processed and saved by the MessageService.
    */
    @RabbitListener(queues ="${rabbitmq.queue.saved-messages-websocket}" )
    public void handleSavedMessage(OutgoingMessageDTO message) {
        try {
            logger.info("Received saved message from RabbitMQ: {}", message);
            // Delegate to the WebSocket handler to push the message to the connected clients.
            chatWebSocketController.sendMessageToUser(message);
        } catch (Exception e) {
            logger.error("Error processing saved message from RabbitMQ", e);
        }
    }
}