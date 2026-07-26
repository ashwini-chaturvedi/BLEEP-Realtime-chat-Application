package com.chats.websocket_service.controller;


import com.chats.websocket_service.dto.IncomingMessageDTO;
import com.chats.websocket_service.dto.OutgoingMessageDTO;
import com.chats.websocket_service.service.UserValidationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;


@Component
@RequiredArgsConstructor
public class ChatWebSocketController extends TextWebSocketHandler {

    private static final Logger logger= LoggerFactory.getLogger(ChatWebSocketController.class);

    private final ConcurrentHashMap<String, WebSocketSession> sessions=new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper;
    private final RabbitTemplate rabbitTemplate;
    private final UserValidationService userValidationService;

    @Value("${rabbitmq.exchange.new-messages}")
    private  String exchange;

    @Value("${rabbitmq.routing-key.new}")
    private String newMessagesRoutingKey;



    private String getUserIdFromSession( WebSocketSession session) {
        String query=session.getUri().getQuery();

        if (query != null && query.startsWith("userId=")) {
            return query.substring("userId=".length());//substring without "userId=" in it
        }
        return null;
    }

    public boolean validateUser(String userId){
        return userId != null && this.userValidationService.validateUser(userId);
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception{
        String userId=getUserIdFromSession(session);
        boolean isValidUser= validateUser(userId);
        if(isValidUser){
            sessions.put(userId,session);
            logger.info("Server Connection Opened for User:{}. Session ID:{}",userId,session.getId());
        }else{
            logger.warn("Closing connection due to missing userId. Session ID: {}", session.getId());
            session.close(CloseStatus.POLICY_VIOLATION.withReason("UserId Must be Provided."));
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message)throws Exception{
        try{
            IncomingMessageDTO incomingMessage=objectMapper.readValue(message.getPayload(),IncomingMessageDTO.class);
            String userId=getUserIdFromSession(session);
            boolean isValidUser= validateUser(userId);//Validation
            incomingMessage.setSendersId(userId);

            logger.info("Received Message from User:{}:{}",userId,incomingMessage.getContent());

            rabbitTemplate.convertAndSend(this.exchange,this.newMessagesRoutingKey,incomingMessage);
            logger.info("Message published to RabbitMQ exchange 'new-messages-exchange'");

        } catch (Exception e) {
            logger.error("Error handling incoming message: {}", e.getMessage());
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session,CloseStatus closeStatus) throws Exception{
        String userId=getUserIdFromSession(session);
        boolean isValidUser= validateUser(userId);
        if(userId!=null && isValidUser && sessions.containsKey(userId)){
            sessions.remove(userId);
            logger.info("Server connection closed for user: {}. Status: {}", userId, closeStatus);
        }
    }

    //This will Send the message to all those user who are participants of this chat room
    public void sendMessageToUser(OutgoingMessageDTO outgoingMessage) {
        for(String recipientId : outgoingMessage.getParticipants()){
            WebSocketSession session = sessions.get(recipientId);
            if(session != null && session.isOpen()){
                try {
                    logger.info("Sending message to user {}: {}", recipientId, outgoingMessage.getContent());
                    session.sendMessage(new TextMessage(objectMapper.writeValueAsString(outgoingMessage)));
                } catch (IOException e) {
                    logger.error("Failed to send message to user {}: {}", recipientId, e.getMessage());
                }
            }
        }
    }
}