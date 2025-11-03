package com.eecs4413.auction_platform.controller;

import java.net.URI;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.eecs4413.auction_platform.dto.ItemCreateRequestDTO;
import com.eecs4413.auction_platform.dto.ItemDTO;
import com.eecs4413.auction_platform.model.UserPrincipal;
import com.eecs4413.auction_platform.service.ItemService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/items")
public class ItemController {

    // Orchestrates item operations for authenticated sellers.
    private final ItemService itemService;

    public ItemController(ItemService itemService) {
        this.itemService = itemService;
    }

    @PostMapping
    public ResponseEntity<ItemDTO> createItem(@Valid @RequestBody ItemCreateRequestDTO request,
                                              @AuthenticationPrincipal UserPrincipal principal) {
        // Reject unauthenticated calls early to avoid leaking any seller context.
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        ItemDTO created = itemService.createItem(principal.getUser(), request);
        // Surface the canonical URL for the new resource in the Location header.
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.getItemId())
                .toUri();
        return ResponseEntity.created(location).body(created);
    }
}
