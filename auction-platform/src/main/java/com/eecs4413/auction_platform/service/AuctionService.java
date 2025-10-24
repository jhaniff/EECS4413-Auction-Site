package com.eecs4413.auction_platform.service;

import com.eecs4413.auction_platform.dto.*;
import com.eecs4413.auction_platform.model.Auction;
import com.eecs4413.auction_platform.model.Bid;
import com.eecs4413.auction_platform.model.Item;
import com.eecs4413.auction_platform.model.User;
import com.eecs4413.auction_platform.repository.AuctionRepository;
import com.eecs4413.auction_platform.repository.BidRepository;
import com.eecs4413.auction_platform.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AuctionService {
    private final AuctionRepository auctionRepository;
    private final ItemService itemService;
    private final UserRepository userRepository;
    private final BidRepository bidRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public AuctionService(AuctionRepository auctionRepository, ItemService itemService, UserRepository userRepository, BidRepository bidRepository, SimpMessagingTemplate messagingTemplate){
        this.auctionRepository = auctionRepository;
        this.itemService = itemService;
        this.userRepository = userRepository;
        this.bidRepository = bidRepository;
        this.messagingTemplate = messagingTemplate;
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
        Auction auction = auctionRepository.findById(auctionId).orElseThrow(
                () -> new IllegalArgumentException("Auction not found")
        );
         return convertToAuctionDetailDTO(auction);
    }

    @Transactional
    public BidResponseDTO placeBid(BidRequestDTO bidRequestDTO) {
        try{
            Auction auction = auctionRepository.findById(bidRequestDTO.getAuctionId())
                    .orElseThrow(() -> new IllegalArgumentException("Auction not found"));
            // Validate auction state
            OffsetDateTime now = OffsetDateTime.now();
            if (auction.getEndsAt().isBefore(now)) {
                throw new IllegalStateException("Auction has already ended");
            }
            // Validate bid amount
            if (bidRequestDTO.getAmount() <= auction.getCurrentPrice()) {
                throw new IllegalArgumentException("Bid must be higher than current price");
            }
            // Find bidder
            User bidder = userRepository.findById(bidRequestDTO.getBidderId())
                    .orElseThrow(() -> new IllegalArgumentException("Bidder not found"));
            // Save bid
            Bid bid = Bid.builder()
                    .auction(auction)
                    .bidder(bidder)
                    .amount(bidRequestDTO.getAmount())
                    .placedAt(now)
                    .build();

            bidRepository.save(bid);

            auction.setCurrentPrice(bidRequestDTO.getAmount());
            auction.setHighestBidder(bidder);
            auctionRepository.save(auction);

            BidResponseDTO response = BidResponseDTO.builder()
                    .auctionId(auction.getAuctionId())
                    .newHighestBid(auction.getCurrentPrice())
                    .highestBidderId(bidder.getUserId())
                    .highestBidderName(bidder.getFirstName() + " " + bidder.getLastName())
                    .updatedAt(now)
                    .message("Bid placed successfully")
                    .build();

            messagingTemplate.convertAndSend("/topic/auction/" + auction.getAuctionId(), response);

            return response;
        }catch(Exception e){
            return BidResponseDTO.builder()
                    .message("Bid can't be placed: " + e.getMessage())
                    .build();
        }
    }

    @Transactional
    public void endAuction(Auction auction) {
        if (!"ONGOING".equals(auction.getStatus())) {
            return;
        }

        auction.setStatus("ENDED");
        auctionRepository.save(auction);

        AuctionResultDTO auctionResultDTO = AuctionResultDTO.builder()
                .auctionId(auction.getAuctionId())
                .itemName(auction.getItem().getName())
                .winnerName(auction.getHighestBidder() != null
                        ? auction.getHighestBidder().getFirstName() + " " + auction.getHighestBidder().getLastName()
                        : "No Bids Were Placed")
                .winningBid(auction.getCurrentPrice())
                .status("ENDED")
                .finalizedAt(OffsetDateTime.now())
                .build();

        messagingTemplate.convertAndSend("/topic/auction/" + auction.getAuctionId(), auctionResultDTO);
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
     @Transactional
     private void getWinner(Long auctionID){
          Auction auction = auctionRepository.findById(auctionID).orElseThrow();
          String auctionStatus = auction.getStatus();

          if (auctionStatus.equals("ENDED")){
               List<Bid> allBids = auction.getBids();
          }
     }
}
