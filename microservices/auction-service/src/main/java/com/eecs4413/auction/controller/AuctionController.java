package com.eecs4413.auction.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.eecs4413.auction.dto.AuctionDTO;
import com.eecs4413.auction.dto.AuctionDetailDTO;
import com.eecs4413.auction.dto.BidRequestDTO;
import com.eecs4413.auction.dto.BidResponseDTO;
import com.eecs4413.auction.dto.UserBidSummaryDTO;
import com.eecs4413.auction.model.UserPrincipal;
import com.eecs4413.auction.service.AuctionService;

import jakarta.validation.Valid;

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

    @GetMapping("/my-bids")
    public ResponseEntity<List<UserBidSummaryDTO>> getMyBids(@AuthenticationPrincipal UserPrincipal user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<UserBidSummaryDTO> bids = auctionService.getUserBidSummaries(user.getUser().getUserId());
        return ResponseEntity.ok(bids);
    }

}
