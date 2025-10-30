package com.eecs4413.auction_platform.controller;

import com.eecs4413.auction_platform.dto.AuctionDTO;
import com.eecs4413.auction_platform.dto.AuctionDetailDTO;
import com.eecs4413.auction_platform.dto.BidRequestDTO;
import com.eecs4413.auction_platform.dto.BidResponseDTO;
import com.eecs4413.auction_platform.service.AuctionService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auction")
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
    public ResponseEntity<BidResponseDTO> submitBid(@Valid @RequestBody BidRequestDTO bid){
        return ResponseEntity.ok(auctionService.placeBid(bid));
    }

}
