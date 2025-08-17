package com.Chats.api_gateway.filter;

import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.function.Predicate;

@Component
public class RouteValidator {

    public static final List<String> openApiEndpoints = List.of(
            "/auth/register",
            "/auth/login",
            "/auth/validate", // Add this - needed for username validation
            "/eureka"
    );

    public Predicate<ServerHttpRequest> isSecured =
            serverHttpRequest -> {
                String path = serverHttpRequest.getURI().getPath();
                System.out.println("RouteValidator - Checking path: " + path); // Debug log

                boolean isOpen = openApiEndpoints
                        .stream()
                        .anyMatch(uri -> path.contains(uri));

                System.out.println("RouteValidator - Is path open: " + isOpen); // Debug log
                return !isOpen; // Return true if secured (not in open endpoints)
            };
}