package com.chats.websocket_service.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig  {

    @Value("${rabbitmq.exchange.saved-messages}")
    private String savedExchange;

    @Value("${rabbitmq.exchange.new-messages}")
    private String newExchange;

    @Value("${rabbitmq.queue.saved-messages-websocket}")
    private String savedQueue;

    // FIXED: Renamed for clarity to distinguish from the subscription key.
    @Value("${rabbitmq.routing-key.new}")
    private String newMessagesRoutingKey;

    // FIXED: Added a value for the wildcard routing key used for subscriptions.
    @Value("${rabbitmq.routing-key.subscribe-all}")
    private String subscribeAllRoutingKey;

    @Bean
    public TopicExchange newMessagesExchange() {
        return new TopicExchange(this.newExchange);
    }

    @Bean
    public TopicExchange savedMessagesExchange() {
        return new TopicExchange(this.savedExchange);
    }

    @Bean
    public Queue savedMessagesQueue() {
        return new Queue(this.savedQueue);
    }

    /**
     * FIXED: This binding now correctly links the 'savedMessagesQueue' to the 'savedMessagesExchange'
     * using the wildcard routing key ('#'). This ensures the queue receives all messages published
     * to the exchange, which is the intended behavior.
     */
    @Bean
    public Binding binding(Queue savedMessagesQueue, TopicExchange savedMessagesExchange) {
        return BindingBuilder.bind(savedMessagesQueue).to(savedMessagesExchange).with(subscribeAllRoutingKey);
    }

    /**
     * Creates a bean for the Jackson JSON message converter.
     * This converter will serialize/deserialize objects to/from JSON.
     */
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    /**
     * Creates a custom RabbitTemplate that uses our JSON message converter.
     * Spring will use this template for all RabbitMQ operations.
     */
    @Bean
    public AmqpTemplate amqpTemplate(ConnectionFactory connectionFactory) {
        final RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(jsonMessageConverter());
        return rabbitTemplate;
    }
}