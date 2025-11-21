package com.eecs4413.item.repository;

import com.eecs4413.item.model.Keyword;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface KeywordRepository extends JpaRepository<Keyword, Long> {

	// Case-insensitive lookup so we can reuse existing keyword rows.
	Optional<Keyword> findByTermIgnoreCase(String term);

}
