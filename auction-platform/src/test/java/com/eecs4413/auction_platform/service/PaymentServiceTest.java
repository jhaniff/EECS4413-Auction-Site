package com.eecs4413.auction_platform.service;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.eecs4413.auction_platform.dto.PaymentDetailDTO;
import com.eecs4413.auction_platform.dto.PaymentRequestDTO;
import com.eecs4413.auction_platform.dto.PaymentResponseDTO;
import com.eecs4413.auction_platform.dto.ReceiptResponseDTO;
import com.eecs4413.auction_platform.model.Auction;
import com.eecs4413.auction_platform.model.Bid;
import com.eecs4413.auction_platform.model.Item;
import com.eecs4413.auction_platform.model.Payment;
import com.eecs4413.auction_platform.model.User;
import com.eecs4413.auction_platform.model.UserAddress;
import com.eecs4413.auction_platform.repository.AuctionRepository;
import com.eecs4413.auction_platform.repository.PaymentRepository;
import com.eecs4413.auction_platform.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private AuctionRepository auctionRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private PaymentService paymentService;

    private Auction auction;
    private User payee;
    private Item item;

    @BeforeEach
    @SuppressWarnings("unused")
    void setUp() {
        item = Item.builder()
                .itemId(11L)
                .name("Rare Console")
                .description("Limited edition console")
                .type("Forward")
                .shippingDays(3)
                .baseShipCost(new BigDecimal("18.50"))
                .expeditedCost(new BigDecimal("32.00"))
                .createdAt(OffsetDateTime.now().minusDays(2))
                .isSold(false)
                .build();

        payee = User.builder()
                .userId(22L)
                .firstName("Alex")
                .lastName("Morgan")
                .email("alex@example.com")
                .address(UserAddress.builder()
                        .userId(22L)
                        .streetName("Maple Ave")
                        .streetNumber("100")
                        .city("Toronto")
                        .country("Canada")
                        .postalCode("M5H1T1")
                        .build())
                .build();

        auction = Auction.builder()
                .auctionId(33L)
                .item(item)
                .startPrice(500)
                .currentPrice(750)
                .highestBidder(payee)
                .startsAt(OffsetDateTime.now().minusDays(5))
                .endsAt(OffsetDateTime.now().minusDays(1))
                .status("ENDED")
                .build();
    }

    @Test
    void getPaymentDetailsReturnsMappedDto() {
        Payment payment = Payment.builder()
                .paymentID(99L)
                .auction(auction)
                .payee(payee)
                .paymentDate(OffsetDateTime.now().minusHours(4))
                .expectedDeliveryDate(OffsetDateTime.now().plusDays(5))
                .isExpedited(true)
                .build();

        when(paymentRepository.findById(99L)).thenReturn(Optional.of(payment));

        PaymentDetailDTO detail = paymentService.getPaymentDetails(99L);

        assertThat(detail.getPaymentID()).isEqualTo(99L);
        assertThat(detail.getAuction()).isEqualTo(auction);
        assertThat(detail.getPayee().getEmail()).isEqualTo("alex@example.com");
        assertThat(detail.getExpectedDeliveryDate()).isAfter(detail.getPaymentDate());
    }

    @Test
    void placePaymentWithInvalidCardReturnsFailureMessage() {
        OffsetDateTime endedAt = OffsetDateTime.now().minusDays(1);
        Auction finishedAuction = Auction.builder()
                .auctionId(auction.getAuctionId())
                .item(auction.getItem())
                .startPrice(auction.getStartPrice())
                .currentPrice(auction.getCurrentPrice())
                .highestBidder(auction.getHighestBidder())
                .startsAt(auction.getStartsAt())
                .endsAt(endedAt)
                .status("ENDED")
                .build();
        User requestUser = User.builder().userId(payee.getUserId()).build();

        PaymentRequestDTO request = PaymentRequestDTO.builder()
                .auctionID(finishedAuction.getAuctionId())
                .paymentID(101L)
                .user(requestUser)
                .cardNumber("1234")
                .nameOnCard("Alex Morgan")
                .expiryDate(OffsetDateTime.now().plusYears(1))
                .securityCode("123")
                .isExpedited(true)
                .build();

        when(auctionRepository.findById(finishedAuction.getAuctionId())).thenReturn(Optional.of(finishedAuction));
        when(userRepository.findById(requestUser.getUserId())).thenReturn(Optional.of(payee));

        PaymentResponseDTO response = paymentService.placePayment(request);

        assertThat(response.getMessage()).contains("Invalid credit card number");
        verify(paymentRepository, never()).save(any(Payment.class));
    }

    @Test
    void createReceiptBuildsSummaryFromDetailedPayment() {
        OffsetDateTime expectedDelivery = OffsetDateTime.now().plusDays(3);
        Bid winningBid = Bid.builder()
                .bidId(401L)
                .auction(auction)
                .bidder(payee)
                .amount(800)
                .placedAt(OffsetDateTime.now().minusDays(2))
                .build();
        Bid competingBid = Bid.builder()
                .bidId(402L)
                .auction(auction)
                .bidder(User.builder().userId(77L).firstName("Jordan").lastName("Shaw").build())
                .amount(780)
                .placedAt(OffsetDateTime.now().minusDays(3))
                .build();
        auction.setBids(List.of(winningBid, competingBid));

        Payment storedPayment = Payment.builder()
                .paymentID(555L)
                .auction(auction)
                .payee(payee)
                .paymentDate(OffsetDateTime.now().minusHours(6))
                .expectedDeliveryDate(expectedDelivery)
                .isExpedited(true)
                .build();

        when(paymentRepository.findDetailedById(555L)).thenReturn(Optional.of(storedPayment));

        ReceiptResponseDTO receipt = paymentService.createReceipt(Payment.builder().paymentID(555L).build());

        assertThat(receipt.getFirstName()).isEqualTo(payee.getFirstName());
        assertThat(receipt.getItemID()).isEqualTo(item.getItemId());
        assertThat(receipt.getTotalPaid()).isEqualByComparingTo(new BigDecimal("850.50"));
        assertThat(receipt.getMessage()).isEqualTo("Receipt generated.  ");
    }
}
