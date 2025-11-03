package com.eecs4413.auction_platform.service;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.eecs4413.auction_platform.dto.ItemCreateRequestDTO;
import com.eecs4413.auction_platform.dto.ItemDTO;
import com.eecs4413.auction_platform.model.Item;
import com.eecs4413.auction_platform.model.Keyword;
import com.eecs4413.auction_platform.model.User;
import com.eecs4413.auction_platform.repository.ItemRepository;
import com.eecs4413.auction_platform.repository.KeywordRepository;

import jakarta.transaction.Transactional;

@Service
public class ItemService {
    // Handles persistence and keyword hygiene for seller items.
    private final ItemRepository itemRepository;
    private final KeywordRepository keywordRepository;

    public ItemService(ItemRepository itemRepository, KeywordRepository keywordRepository){
        this.itemRepository = itemRepository;
        this.keywordRepository = keywordRepository;
    }

    public List<ItemDTO> getItems() {
        List<Item> items = itemRepository.findAll();
        List<ItemDTO> itemDTOs = new ArrayList<>();
        for(Item item : items) {
            itemDTOs.add(convertEntityToDTO(item));
        }
        return itemDTOs;
    }

    public List<Item> searchItems(String query) {
        return itemRepository.searchByKeyword(query);
    }

    @Transactional
    @SuppressWarnings("null")
    public ItemDTO createItem(User seller, ItemCreateRequestDTO request) {
        // Normalize and reuse keyword entities so repeated posts do not fragment tags.
        List<Keyword> keywords = resolveKeywords(request.getKeywords());

        Item itemToPersist = Item.builder()
                .seller(seller)
                .name(request.getName())
                .description(request.getDescription())
                // Default to our standard auction type when the caller leaves it blank.
                .type((request.getType() == null || request.getType().isBlank()) ? "Forward" : request.getType())
                .shippingDays(request.getShippingDays())
                .baseShipCost(request.getBaseShipCost())
                .expeditedCost(request.getExpeditedCost())
                .createdAt(OffsetDateTime.now())
                .keywords(keywords)
                .build();

        Item savedItem = Objects.requireNonNull(itemRepository.save(itemToPersist));
        return convertEntityToDTO(savedItem);
    }

    private List<Keyword> resolveKeywords(List<String> rawKeywords) {
        // Trim, deduplicate, and drop blanks before hitting the database.
        if (rawKeywords == null || rawKeywords.isEmpty()) {
            return new ArrayList<>();
        }

        return rawKeywords.stream()
                .map(term -> term == null ? "" : term.trim())
                .filter(term -> !term.isEmpty())
                .distinct()
                .map(this::findOrCreateKeyword)
                .collect(Collectors.toCollection(ArrayList::new));
    }

    @SuppressWarnings("null")
    private Keyword findOrCreateKeyword(String term) {
    // Lookup existing keyword before creating a new row to keep case-insensitive uniqueness.
    return keywordRepository.findByTermIgnoreCase(term)
        .orElseGet(() -> Objects.requireNonNull(
            keywordRepository.save(Keyword.builder().term(term).build())));
    }

    private ItemDTO convertEntityToDTO(Item item){
        // Flatten keyword entities so the API returns simple strings.
        List<String> keywordTerms = item.getKeywords() == null
                ? Collections.emptyList()
                : item.getKeywords().stream()
                .map(Keyword::getTerm)
                .collect(Collectors.toList());

        return ItemDTO.builder()
               .itemId(item.getItemId())
               .sellerId(item.getSeller() != null ? item.getSeller().getUserId() : null)
               .name(item.getName())
               .description(item.getDescription())
               .type(item.getType())
               .shippingDays(item.getShippingDays())
               .baseShipCost(item.getBaseShipCost())
               .expeditedCost(item.getExpeditedCost())
               .createdAt(item.getCreatedAt())
               .isSold(item.isSold())
               .keywords(keywordTerms)
               .build();
    }


}
