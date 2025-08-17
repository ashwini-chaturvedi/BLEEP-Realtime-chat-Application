package org.chats.authservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.chats.authservice.dto.AuthRequest;
import org.chats.authservice.dto.AuthResponse;
import org.chats.authservice.dto.UserRequest;
import org.chats.authservice.dto.UserResponse;
import org.chats.authservice.entity.Auth;
import org.chats.authservice.repository.AuthRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatusCode;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;


import javax.security.auth.login.CredentialException;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    private final AuthRepository authRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final AuthDetailsService authDetailsService;
    private final WebClient webClient;


    private AuthResponse mapAuthToAuthResponse(Auth savedAuth) {
        AuthResponse authResponse = new AuthResponse();
        authResponse.setId(savedAuth.getId());
        authResponse.setUserName(savedAuth.getUserName());
        authResponse.setEmailId(savedAuth.getEmailId());
        return authResponse;
    }

    public Map<String,Object> setUserCredentials(UserRequest userRequest) throws CredentialException {

        // Check if user already exists
        boolean userExist = Boolean.TRUE.equals(webClient
                .get()
                .uri("http://USER-SERVICE/user/validate/{userName}", userRequest.getUserName())
                .retrieve()
                .bodyToMono(Boolean.class)
                .onErrorReturn(false)
                .block());
        boolean authExist = authRepository.existsByUserNameOrEmailId(
                userRequest.getUserName(),
                userRequest.getEmailId()
        );


        if (userExist && authExist) {
            throw new CredentialException("User with Same Detail already exists");
        }

        try {
            Auth newAuth = new Auth();
            newAuth.setUserName(userRequest.getUserName().trim().toLowerCase());
            newAuth.setEmailId(userRequest.getEmailId().trim().toLowerCase());
            newAuth.setPassword(passwordEncoder.encode(userRequest.getPassword()));

            Auth savedAuth = authRepository.save(newAuth);

            UserResponse userResponse = webClient
                    .post()
                    .uri("http://USER-SERVICE/user/create")
                    .bodyValue(userRequest)
                    .retrieve()
                    .bodyToMono(UserResponse.class)
                    .block();

            System.out.println(userResponse);

            AuthResponse savedAuthResponse= mapAuthToAuthResponse(savedAuth);

            Map<String,Object> map = new HashMap<>();
            map.put("auth",savedAuthResponse);
            map.put("user",userResponse);

            return map;

        } catch (DataIntegrityViolationException e) {
            throw new CredentialException("User with these credentials already exists");
        }
    }


    public String getUserName(String emailId) {
        Auth auth = authRepository.findByEmailId(emailId);
        if (auth == null) {
            throw new IllegalArgumentException("User not found with email: " + emailId);
        }
        return auth.getUserName();
    }

    public Map<String,Object> loginUser(AuthRequest authRequest) {

        try {
            // Authenticate the user
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            authRequest.getUserName(),
                            authRequest.getPassword()
                    )
            );

            // If authentication is successful, generate JWT token
            final UserDetails userDetails = authDetailsService.loadUserByUsername(authRequest.getUserName());
            final String token = jwtService.generateJwtToken(userDetails.getUsername());


            UserResponse userResponse = webClient
                    .get()
                    .uri("http://USER-SERVICE/user/find/{text}", userDetails.getUsername())
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, resp ->
                            resp.bodyToMono(String.class)
                                    .map(body -> new RuntimeException("User service error: " + body))
                    )
                    .bodyToMono(UserResponse.class)
                    .block();
            Map<String,Object> map = new HashMap<>();
            map.put("token",token);
            map.put("user",userResponse);
            return map;

        } catch (BadCredentialsException e) {
            System.out.println("Authentication failed for user: {}"+ authRequest.getUserName());
            throw new BadCredentialsException("Invalid username or password");
        }
    }

    public Boolean validateToken(String token) {
        try {
            String userName = jwtService.extractUserNameFromToken(token);
            UserDetails userDetails = authDetailsService.loadUserByUsername(userName);
            return jwtService.validateToken(token, userDetails);
        } catch (Exception e) {
            log.error("Token validation failed: {}", e.getMessage());
            return false;
        }
    }


    public boolean userNameExists(String userName) {
        return this.authRepository.existsByUserName(userName);
    }
}