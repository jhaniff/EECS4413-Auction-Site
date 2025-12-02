package com.eecs4413.payment.repository;

import com.eecs4413.payment.model.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {

    @Query("""
        SELECT DISTINCT i
        FROM Item i
        JOIN i.keywords k
        WHERE LOWER(k.term) LIKE LOWER(CONCAT('%', :term, '%'))
    """)
    List<Item> searchByKeyword(@Param("term") String term);

    // optionally, also search by name/description
    @Query("""
        SELECT i
        FROM Item i
        WHERE LOWER(i.name) LIKE LOWER(CONCAT('%', :term, '%'))
           OR LOWER(i.description) LIKE LOWER(CONCAT('%', :term, '%'))
    """)
    List<Item> searchByText(@Param("term") String term);

}
