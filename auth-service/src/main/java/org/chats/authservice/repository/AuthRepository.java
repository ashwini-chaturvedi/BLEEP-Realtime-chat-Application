package org.chats.authservice.repository;

import org.chats.authservice.entity.Auth;
import org.chats.authservice.service.AuthService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuthRepository extends JpaRepository<Auth,String> {


    Auth findByUserName(String userName);

    Auth findByEmailId(String emailId);


    boolean existsByUserNameOrEmailId(String userName, String emailId);

    boolean existsByUserName(String userName);
}
