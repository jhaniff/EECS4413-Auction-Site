package com.eecs4413.item.controller;

import com.eecs4413.item.dto.ItemCreateRequestDTO;
import com.eecs4413.item.dto.ItemDTO;
import com.eecs4413.item.model.UserPrincipal;
import com.eecs4413.item.service.ItemService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

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
