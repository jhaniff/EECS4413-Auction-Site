package com.eecs4413.auction.controller;

import com.eecs4413.auction.dto.AuctionDTO;
import com.eecs4413.auction.dto.AuctionDetailDTO;
import com.eecs4413.auction.dto.BidRequestDTO;
import com.eecs4413.auction.dto.BidResponseDTO;
import com.eecs4413.auction.model.UserPrincipal;
import com.eecs4413.auction.service.AuctionService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auction")
public class AuctionController {
    private final AuctionService auctionService;

    public AuctionController(AuctionService auctionService){
        this.auctionService = auctionService;
    }

    @GetMapping("/search")
    public ResponseEntity<Page<AuctionDTO>> search(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "endsAt") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {

        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<AuctionDTO> results = auctionService.searchAuctionsByItemKeyword(query, pageable);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/{auctionId}")
    public ResponseEntity<AuctionDetailDTO> getAuction(@PathVariable Long auctionId){
        return ResponseEntity.ok(auctionService.getAuctionDetails(auctionId));
    }
    @PostMapping("/bid")
    public ResponseEntity<BidResponseDTO> submitBid(@Valid @RequestBody BidRequestDTO bid, @AuthenticationPrincipal UserPrincipal user){
        return ResponseEntity.ok(auctionService.placeBid(bid, user.getUser().getUserId()));
    }

}
