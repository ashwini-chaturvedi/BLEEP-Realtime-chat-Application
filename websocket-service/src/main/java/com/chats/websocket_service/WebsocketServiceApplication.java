package com.chats.websocket_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.sql.SQLOutput;

@SpringBootApplication
public class WebsocketServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(WebsocketServiceApplication.class, args);
		System.out.println("Websocket Server Starts----------->>>>");
	}

}
