package com.eecs4413.auction_platform.service;

import com.eecs4413.auction_platform.model.User;
import com.eecs4413.auction_platform.model.UserPrincipal;
import com.eecs4413.auction_platform.repository.UserRepository;
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
        User user = userRepository.findByEmail(username);
        if(user == null){
            throw new UsernameNotFoundException("User not found");
        }
        return new UserPrincipal(user);
    }
}
