package org.chats.authservice.service;

import lombok.RequiredArgsConstructor;
import org.chats.authservice.entity.Auth;
import org.chats.authservice.repository.AuthRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthDetailsService implements UserDetailsService {


    private final AuthRepository authRepository;

    @Override
    public UserDetails loadUserByUsername(String userName) throws UsernameNotFoundException {

        Auth auth=this.authRepository.findByUserName(userName);

        if(auth==null){
            System.out.println("User Not Found");
            throw new UsernameNotFoundException("User Not Found");
        }
        return new AuthPrincipal(auth);
    }
}
