package com.eecs4413.auction_platform.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.eecs4413.auction_platform.model.Keyword;

@Repository
public interface KeywordRepository extends JpaRepository<Keyword, Long> {

	// Case-insensitive lookup so we can reuse existing keyword rows.
	Optional<Keyword> findByTermIgnoreCase(String term);

}
