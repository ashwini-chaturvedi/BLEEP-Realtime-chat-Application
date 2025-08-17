package com.Chats.api_gateway.filter;

import com.Chats.api_gateway.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;
import java.time.Duration;

@Component
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    @Autowired
    private RouteValidator routeValidator;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private WebClient webClient;

    public AuthenticationFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            if (routeValidator.isSecured.test(exchange.getRequest())) {
                String authHeader = exchange.getRequest().getHeaders().getFirst("Authorization");

                if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                    System.out.println("Missing or invalid Authorization header");
                    exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                    return exchange.getResponse().setComplete();
                }

                String token = authHeader.substring(7);

                try {
                    // Validate token locally
                    jwtService.validateToken(token);
                    String userName = jwtService.extractUserNameFromToken(token);

                    System.out.println("USERNAME FROM TOKEN: " + userName);
                    System.out.println("About to call AUTH-SERVICE...");

                    // Call Auth Service for username validation with detailed logging
                    return webClient
                            .get()
                            .uri("http://AUTH-SERVICE/auth/validate/{userName}", userName)
                            .retrieve()
                            .onStatus(status -> status.is4xxClientError(),
                                    response -> {
                                        System.out.println("4xx error from AUTH-SERVICE: " + response.statusCode());
                                        return Mono.error(new RuntimeException("Client error: " + response.statusCode()));
                                    })
                            .onStatus(status -> status.is5xxServerError(),
                                    response -> {
                                        System.out.println("5xx error from AUTH-SERVICE: " + response.statusCode());
                                        return Mono.error(new RuntimeException("Server error: " + response.statusCode()));
                                    })
                            .bodyToMono(Boolean.class)
                            .timeout(Duration.ofSeconds(5))
                            .doOnSubscribe(s -> System.out.println("Starting call to AUTH-SERVICE for user: " + userName))
                            .doOnNext(result -> System.out.println("AUTH-SERVICE response: " + result))
                            .doOnError(WebClientResponseException.class, ex -> {
                                System.out.println("WebClient error - Status: " + ex.getStatusCode() + ", Body: " + ex.getResponseBodyAsString());
                            })
                            .doOnError(Exception.class, ex -> {
                                System.out.println("General error calling AUTH-SERVICE: " + ex.getClass().getSimpleName() + " - " + ex.getMessage());
                                ex.printStackTrace();
                            })
                            .onErrorReturn(false)
                            .flatMap(verifyUserName -> {
                                System.out.println("Username verification result: " + verifyUserName);
                                if (Boolean.TRUE.equals(verifyUserName)) {
                                    System.out.println("User verified successfully: " + userName);
                                    return chain.filter(exchange);
                                } else {
                                    System.out.println("User verification failed for: " + userName);
                                    exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                                    return exchange.getResponse().setComplete();
                                }
                            });

                } catch (Exception e) {
                    System.out.println("JWT validation error: " + e.getMessage());
                    e.printStackTrace();
                    exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                    return exchange.getResponse().setComplete();
                }
            }
            System.out.println("Request not secured, proceeding without authentication");
            return chain.filter(exchange);
        };
    }

    public static class Config {
    }
}