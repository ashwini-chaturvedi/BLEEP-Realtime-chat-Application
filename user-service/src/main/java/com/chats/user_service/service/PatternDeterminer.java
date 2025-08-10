package com.chats.user_service.service;

import org.springframework.stereotype.Service;

import java.util.regex.Pattern;

@Service
public class PatternDeterminer {
    // Regex patterns
    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$");

    private static final Pattern USERNAME_PATTERN =
            Pattern.compile("^[a-zA-Z0-9._-]{3,30}$");

    private static final Pattern FULLNAME_PATTERN =
            Pattern.compile("^[A-Za-z]+(\\s+[A-Za-z]+)+$");


    public String detectType(String input) {
        if (input == null || input.trim().isEmpty()) {
            return "UNKNOWN";
        }

        String trimmed = input.trim();

        // Check for email first (most specific pattern)
        if (EMAIL_PATTERN.matcher(trimmed).matches()) {
            return "EMAIL";
        }

        Pattern FLEXIBLE_USERNAME_PATTERN = Pattern.compile("^[a-zA-Z0-9._@-]{3,30}$");

        if (FLEXIBLE_USERNAME_PATTERN.matcher(trimmed).matches() &&
                !trimmed.matches("^\\d+$")) { // not all numbers
            return "USER-NAME";
        }

        // Check for full name (contains spaces and only letters)
        if (FULLNAME_PATTERN.matcher(trimmed).matches()) {
            // Additional validation for full names
            String[] words = trimmed.split("\\s+");
            if (words.length >= 2 && words.length <= 20) {
                boolean validName = true;
                for (String word : words) {
                    if (word.length() < 2 || word.length() > 20) {
                        validName = false;
                        break;
                    }
                }
                if (validName) {
                    return "FULL-NAME";
                }
            }
        }


        return "UNKNOWN";
    }
}
