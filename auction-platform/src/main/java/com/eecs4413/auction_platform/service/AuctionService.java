package com.eecs4413.auction_platform.service;

import com.eecs4413.auction_platform.dto.*;
import com.eecs4413.auction_platform.model.Auction;
import com.eecs4413.auction_platform.model.Item;
import com.eecs4413.auction_platform.repository.AuctionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AuctionService {
    private final AuctionRepository auctionRepository;
    private final ItemService itemService;

    public AuctionService(AuctionRepository auctionRepository, ItemService itemService){
        this.auctionRepository = auctionRepository;
        this.itemService = itemService;
    }

    public Page<AuctionDTO> searchAuctionsByItemKeyword(String query, Pageable pageable) {
        List<Item> matchedItems = itemService.searchItems(query);
        List<Long> itemIds = matchedItems
                .stream()
                .map(Item::getItemId)
                .toList();

        Page<Auction> auctionPage = auctionRepository.findByItemIds(itemIds, pageable);

        return auctionPage.map(this::convertToAuctionDTO);
    }

    public AuctionDetailDTO getAuctionDetails(Long auctionId) {
        Optional<Auction> optionalAuction = auctionRepository.findById(auctionId);
        if(optionalAuction.isPresent()){
            Auction auction = optionalAuction.get();
            return convertToAuctionDetailDTO(auction);
        }
        // Throw custom exception later.
        return null;
    }

    public BidResponseDTO handleBidRequest(BidRequestDTO bid) {
        return null;
    }


    private AuctionDetailDTO convertToAuctionDetailDTO(Auction auction){
        return AuctionDetailDTO.builder()
                .auctionId(auction.getAuctionId())
                .auctionType(auction.getItem().getType())
                .itemDescription(auction.getItem().getDescription())
                .itemName(auction.getItem().getName())
                .highestBidderId(auction.getHighestBidder().getUserId())
                .highestBidderName(
                        auction.getHighestBidder().getFirstName() + " " +
                                auction.getHighestBidder().getLastName()
                )
                .currentPrice(auction.getCurrentPrice())
                .startPrice(auction.getStartPrice())
                .remainingTime(computeRemainingTime(auction.getEndsAt()))
                .endsAt(auction.getEndsAt())
                .build();
    }
    private AuctionDTO convertToAuctionDTO(Auction auction){
        return AuctionDTO.builder()
                .auctionId(auction.getAuctionId())
                .itemId(auction.getItem().getItemId())
                .itemName(auction.getItem().getName())
                .currentPrice(auction.getCurrentPrice())
                .type(auction.getItem().getType())
                .remainingTime(computeRemainingTime(auction.getEndsAt()))
                .endsAt(auction.getEndsAt())
                .highestBidder(auction.getHighestBidder().getFirstName() + " " +
                        auction.getHighestBidder().getLastName())
                .build();

    }

    private String computeRemainingTime(OffsetDateTime endsAt) {
        OffsetDateTime now = OffsetDateTime.now();
        if (endsAt.isBefore(now)) return "Ended";

        Duration remaining = Duration.between(now, endsAt);
        long hours = remaining.toHours();
        long minutes = remaining.toMinutesPart();
        return String.format("%dh %02dm", hours, minutes);
    }



}
