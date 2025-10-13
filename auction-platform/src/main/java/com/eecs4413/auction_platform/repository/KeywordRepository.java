package com.eecs4413.auction_platform.repository;

import com.eecs4413.auction_platform.model.Keyword;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface KeywordRepository extends JpaRepository<Keyword, Long> {

}
