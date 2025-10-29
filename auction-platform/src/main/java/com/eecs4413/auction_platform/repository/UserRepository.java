package com.eecs4413.auction_platform.repository;

import com.eecs4413.auction_platform.model.Item;
import com.eecs4413.auction_platform.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    User findByEmail(String username);
}