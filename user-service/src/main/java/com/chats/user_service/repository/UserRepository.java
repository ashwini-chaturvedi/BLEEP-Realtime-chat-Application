package com.chats.user_service.repository;

import com.chats.user_service.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;


public interface UserRepository extends JpaRepository<User,String> {

    boolean existsByEmailId(String emailId);

    boolean existsByUserName(String userName);

    User findByEmailId(String emailId);

    User findByUserName(String userName);

    User findByFullName(String fullName);
}
