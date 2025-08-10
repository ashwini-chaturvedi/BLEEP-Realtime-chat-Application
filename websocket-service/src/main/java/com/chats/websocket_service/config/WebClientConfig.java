package com.chats.websocket_service.config;

import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {



    @Bean
    @LoadBalanced //this annotation allows webclient to resolve the service name via eureka
    public WebClient.Builder webClientBuilder(){
        return WebClient.builder();
    }

    @Bean
    public WebClient userServiceWebClient(WebClient.Builder webClientBuilder){
        //Dynamically give serviceName so that it can be used with any service
        return webClientBuilder
                .baseUrl("http://USER-SERVICE")
                .build();
    }

}
