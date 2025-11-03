package com.eecs4413.auction_platform.service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import com.eecs4413.auction_platform.dto.AuctionDTO;
import com.eecs4413.auction_platform.dto.AuctionDetailDTO;
import com.eecs4413.auction_platform.dto.BidRequestDTO;
import com.eecs4413.auction_platform.dto.BidResponseDTO;
import com.eecs4413.auction_platform.model.Auction;
import com.eecs4413.auction_platform.model.Bid;
import com.eecs4413.auction_platform.model.Item;
import com.eecs4413.auction_platform.model.User;
import com.eecs4413.auction_platform.repository.AuctionRepository;
import com.eecs4413.auction_platform.repository.BidRepository;
import com.eecs4413.auction_platform.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class AuctionServiceTest {

    @Mock
    private AuctionRepository auctionRepository;

    @Mock
    private ItemService itemService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private BidRepository bidRepository;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private AuctionService auctionService;

    private User bidder;
    private Item item;
    private Auction auction;

    @BeforeEach
    @SuppressWarnings("unused")
    void setUp() {
        bidder = User.builder()
                .userId(7L)
                .firstName("Jamie")
                .lastName("Rivera")
                .build();

        item = Item.builder()
                .itemId(33L)
                .name("Vintage Camera")
                .description("Collector condition")
                .type("Forward")
                .shippingDays(3)
                .baseShipCost(java.math.BigDecimal.TEN)
                .expeditedCost(java.math.BigDecimal.ONE)
                .createdAt(OffsetDateTime.now().minusDays(1))
                .isSold(false)
                .build();

        auction = Auction.builder()
                .auctionId(91L)
                .item(item)
                .startPrice(100)
                .currentPrice(150)
                .highestBidder(bidder)
                .startsAt(OffsetDateTime.now().minusHours(6))
                .endsAt(OffsetDateTime.now().plusHours(6))
                .status("ONGOING")
                .build();
    }

    @Test
    void searchAuctionsByItemKeywordReturnsMappedResults() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Auction> page = new PageImpl<>(List.of(auction), pageable, 1);

        when(itemService.searchItems("camera")).thenReturn(List.of(item));
        when(auctionRepository.findByItemIds(List.of(item.getItemId()), pageable)).thenReturn(page);

    Page<AuctionDTO> result = auctionService.searchAuctionsByItemKeyword("camera", pageable);

    assertThat(result.getTotalElements()).isEqualTo(1);
    AuctionDTO dto = result.getContent().get(0);
        assertThat(dto.getAuctionId()).isEqualTo(auction.getAuctionId());
        assertThat(dto.getItemName()).isEqualTo(item.getName());
        assertThat(dto.getHighestBidder()).contains(bidder.getFirstName());
    }

    @Test
    void getAuctionDetailsReturnsExpectedDto() {
    Long auctionId = auction.getAuctionId();
    when(auctionRepository.findById(auctionId)).thenReturn(Optional.of(auction));

    AuctionDetailDTO detail = auctionService.getAuctionDetails(auctionId);

    assertThat(detail.getAuctionId()).isEqualTo(auctionId);
        assertThat(detail.getItemName()).isEqualTo(item.getName());
        assertThat(detail.getHighestBidderName()).isEqualTo(bidder.getFirstName() + " " + bidder.getLastName());
    }

    @Test
    void placeBidPersistsBidUpdatesAuctionAndBroadcasts() {
    Long auctionId = auction.getAuctionId();
    Long bidderId = bidder.getUserId();
    BidRequestDTO request = BidRequestDTO.builder()
        .auctionId(auctionId)
        .bidderId(bidderId)
                .amount(170)
                .build();

    when(auctionRepository.findById(auctionId)).thenReturn(Optional.of(auction));
    when(userRepository.findById(bidderId)).thenReturn(Optional.of(bidder));

        BidResponseDTO response = auctionService.placeBid(request);

        ArgumentCaptor<Bid> bidCaptor = ArgumentCaptor.forClass(Bid.class);
        verify(bidRepository).save(bidCaptor.capture());
        Bid savedBid = bidCaptor.getValue();
        assertThat(savedBid.getAmount()).isEqualTo(170);
        assertThat(savedBid.getBidder()).isEqualTo(bidder);

    verify(auctionRepository).save(org.mockito.ArgumentMatchers.same(auction));
    verify(messagingTemplate).convertAndSend(org.mockito.Mockito.eq("/topic/auction/" + auctionId), org.mockito.Mockito.any(BidResponseDTO.class));

    assertThat(response.getNewHighestBid()).isEqualTo(170);
    assertThat(response.getHighestBidderId()).isEqualTo(bidderId);
    }

    @Test
    void placeBidRejectsWhenAmountNotHigher() {
        Long auctionId = auction.getAuctionId();
        Long bidderId = bidder.getUserId();
        BidRequestDTO request = BidRequestDTO.builder()
                .auctionId(auctionId)
                .bidderId(bidderId)
                .amount(120)
                .build();

        when(auctionRepository.findById(auctionId)).thenReturn(Optional.of(auction));

        try {
            auctionService.placeBid(request);
        } catch (Exception ignored) {
            // expected path under test
        }

        verify(bidRepository, never()).save(any(Bid.class));
        verify(messagingTemplate, never()).convertAndSend(org.mockito.ArgumentMatchers.anyString(), org.mockito.ArgumentMatchers.<Object>any());
    }
}
