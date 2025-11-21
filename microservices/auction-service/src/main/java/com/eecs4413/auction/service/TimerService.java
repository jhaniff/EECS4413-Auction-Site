package com.eecs4413.auction.service;

import com.eecs4413.auction.model.Auction;
import com.eecs4413.auction.repository.AuctionRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;

@Service
public class TimerService {
    private final AuctionRepository auctionRepository;
    private final AuctionService auctionService;

    public TimerService(AuctionRepository auctionRepository, AuctionService auctionService){
        this.auctionRepository = auctionRepository;
        this.auctionService = auctionService;
    }

    @Scheduled(fixedRate = 60000) // every 60 seconds
    public void endExpiredAuctions() {
        OffsetDateTime now = OffsetDateTime.now();
        List<Auction> expired = auctionRepository.findExpiredAuctions(now);

        if (expired.isEmpty()) return;

        System.out.printf("[%s] Found %d expired auctions%n", now, expired.size());

        for (Auction auction : expired) {
            try {
                auctionService.endAuction(auction);
            } catch (Exception e) {
                System.err.printf("Failed to end auction %d: %s%n",
                        auction.getAuctionId(), e.getMessage());
            }
        }
    }
}
