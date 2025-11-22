package com.eecs4413.auction_platform.controller;

import com.eecs4413.auction_platform.dto.*;
import com.eecs4413.auction_platform.model.Auction;
import com.eecs4413.auction_platform.model.User;
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
    @GetMapping("/{auctionId}/winner")
    public ResponseEntity<WinnerDTO>getAuctionWinner(@PathVariable Long auctionId){
         Auction auction = auctionService.getAuction(auctionId);
         User winner = auction.getHighestBidder();
         if(winner == null){
              return ResponseEntity.ok(null);
         }
         WinnerDTO winnerDto = WinnerDTO.builder()
                 .userId(winner.getUserId())
                 .firstName(winner.getFirstName())
                 .lastName(winner.getLastName())
                 .streetName(winner.getAddress() != null ? winner.getAddress().getStreetName() : "")
                 .streetNumber(winner.getAddress() != null ? winner.getAddress().getStreetNumber() : "")
                 .city(winner.getAddress() != null ? winner.getAddress().getCity() : "")
                 .country(winner.getAddress() != null ? winner.getAddress().getCountry() : "")
                 .postalCode(winner.getAddress() != null ? winner.getAddress().getPostalCode() : "")
                 .build();

         return ResponseEntity.ok(winnerDto);
    }

}
