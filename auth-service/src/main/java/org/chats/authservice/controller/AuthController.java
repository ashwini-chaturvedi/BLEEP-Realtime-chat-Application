package org.chats.authservice.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.chats.authservice.dto.AuthRequest;
import org.chats.authservice.dto.UserRequest;
import org.chats.authservice.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.security.auth.login.CredentialException;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;


    @PostMapping("/register")
    public ResponseEntity<?> setAuth(@RequestBody UserRequest userRequest) {
        try {
            return ResponseEntity.ok(this.authService.setUserCredentials(userRequest));
        } catch (CredentialException e) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String,Object>> getAuth(@RequestBody AuthRequest authRequest) {
        try {
            if (authRequest.getUserName() == null || authRequest.getUserName().isEmpty()) {
                String userName = this.authService.getUserName(authRequest.getEmailId());
                authRequest.setUserName(userName);
            }
            return ResponseEntity.ok(this.authService.loginUser(authRequest));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/validate/{userName}")
    public ResponseEntity<?> validate(@PathVariable String userName) {
        try {
            return ResponseEntity.ok(this.authService.userNameExists(userName));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
