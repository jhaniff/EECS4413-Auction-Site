package com.eecs4413.auth.service;

import com.eecs4413.auth.exception.UserCredentialsException;
import com.eecs4413.auth.model.User;
import com.eecs4413.auth.model.UserPrincipal;
import com.eecs4413.auth.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class AuctionUserDetailsService implements UserDetailsService {

    private UserRepository userRepository;

    public AuctionUserDetailsService(UserRepository userRepository){
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(username).orElseThrow(()-> new UserCredentialsException("User not found"));
        return new UserPrincipal(user);
    }
}
