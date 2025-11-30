package com.eecs4413.payment.service;

import com.eecs4413.payment.dto.*;
import com.eecs4413.payment.exception.ResourceNotFoundException;
import com.eecs4413.payment.model.Auction;
import com.eecs4413.payment.model.Bid;
import com.eecs4413.payment.model.Payment;
import com.eecs4413.payment.model.User;
import com.eecs4413.payment.repository.AuctionRepository;
import com.eecs4413.payment.repository.PaymentRepository;
import com.eecs4413.payment.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Service
public class PaymentService {
     PaymentRepository paymentRepository;
     AuctionRepository auctionRepository;
     UserRepository userRepository;

     public PaymentService(AuctionRepository auctionRepository, UserRepository userRepository, PaymentRepository paymentRepository ){
          this.auctionRepository = auctionRepository;
          this.paymentRepository = paymentRepository;
          this.userRepository = userRepository;
     }

     public PaymentDetailDTO getPaymentDetails(Long paymentID, Long userId) {
          Payment payment = paymentRepository.findById(paymentID).orElseThrow(
                  () -> new IllegalArgumentException("Payment not found")
          );
          if(payment.getPayee().getUserId() != userId){
               throw new IllegalArgumentException("Wrong user trying to get payment details");
          }
          return convertToPaymentDetailDTO(payment);
     }
     private PaymentDetailDTO convertToPaymentDetailDTO(Payment payment){
          int bid = payment.getAuction().getCurrentPrice();
          BigDecimal baseCost = payment.getAuction().getItem().getBaseShipCost();
          BigDecimal expeditedCost = payment.getAuction().getItem().getExpeditedCost();
          BigDecimal totalBaseCost = baseCost.add(BigDecimal.valueOf(bid));
          BigDecimal totalExpeditedCost = expeditedCost.add(BigDecimal.valueOf(bid));
          return PaymentDetailDTO.builder()
                  .paymentID(payment.getPaymentID())
                  .firstName(payment.getPayee().getFirstName())
                  .lastName(payment.getPayee().getLastName())
                  .postalCode(payment.getPayee().getAddress().getPostalCode())
                  .city(payment.getPayee().getAddress().getCity())
                  .country(payment.getPayee().getAddress().getCountry())
                  .totalBaseCost(totalBaseCost)
                  .totalExpeditedCost(totalExpeditedCost)
                  .streetNumber(payment.getPayee().getAddress().getStreetNumber())
                  .streetName(payment.getPayee().getAddress().getStreetName())
                  .paymentDate(payment.getPaymentDate())
                  .expectedDeliveryDate(payment.getExpectedDeliveryDate())
                  .build();
     }
     @Transactional
     public PaymentResponseDTO placePayment(PaymentRequestDTO paymentRequestDTO, Long userId){
          try{
               Auction auction = auctionRepository.findById(paymentRequestDTO.getAuctionID())
                       .orElseThrow(() -> new ResourceNotFoundException("Auction not found"));
               auction = auctionRepository.findById(auction.getAuctionId()).get();
               if(userId != auction.getHighestBidder().getUserId()){
                    throw new IllegalArgumentException("Wrong user trying to place payment");
               }
               // Validate auction state
               OffsetDateTime now = OffsetDateTime.now();
               if (auction.getEndsAt().isAfter(now)) {
                    throw new IllegalStateException("Auction is ongoing!\nYou can't place a payment yet.  ");
               }
               // Find payee
               User payee = userRepository.findById(userId)
                       .orElseThrow(() -> new ResourceNotFoundException("Payee not found"));

               OffsetDateTime expectedDelivery = paymentRequestDTO.isExpedited()
                       ? OffsetDateTime.now().plusDays(2)
                       : OffsetDateTime.now().plusDays(7);
               // Save Payment
               Payment payment = Payment.builder()
                       .paymentID(paymentRequestDTO.getPaymentID())
                       .auction(auction)
                       .payee(payee)
                       .paymentDate(OffsetDateTime.now())
                       .expectedDeliveryDate(expectedDelivery)
                       .isExpedited(paymentRequestDTO.isExpedited())
                       .build();
               if(paymentRequestDTO.getCardNumber().length() !=  16) {
                    throw new IllegalArgumentException("Invalid credit card number.  ");
               }
               if(paymentRequestDTO.getExpiryDate().isBefore(OffsetDateTime.now())) {
                    throw new IllegalArgumentException("Invalid expiry date.  ");
               }
               if(paymentRequestDTO.getSecurityCode().length() !=  3) {
                    throw new IllegalArgumentException("Invalid security code.  ");
               }
               paymentRepository.save(payment);
               createReceipt(payment, userId);

               PaymentResponseDTO paymentResponseDTO =  PaymentResponseDTO.builder()
                       .paymentID(payment.getPaymentID())
                       .firstName(payee.getFirstName())
                       .lastName(payee.getLastName())
                       .deliveryDate(payment.getExpectedDeliveryDate())
                       .message("Payment placed successfully.  ")
                       .build();
               return paymentResponseDTO;

          }catch(Exception e) {
               return PaymentResponseDTO.builder()
                       .message("Payment can't be placed: " + e.getMessage())
                       .build();
          }
     }
     @Transactional
     public ReceiptResponseDTO createReceipt(Payment payment, Long userId){

          try {
               Payment storedPayment = paymentRepository.findDetailedById(payment.getPaymentID())
                       .orElseThrow(() -> new IllegalArgumentException("Payment not found.  "));

               if(storedPayment.getPayee().getUserId() != userId){
                    throw new IllegalArgumentException("Wrong user trying to retrieve payment");
               }

               BigDecimal totalPrice = getBigDecimal(storedPayment, userId);

               ReceiptResponseDTO receiptResponse = ReceiptResponseDTO.builder()
                       .firstName(storedPayment.getPayee().getFirstName())
                       .lastName(storedPayment.getPayee().getLastName())
                       .streetName(storedPayment.getPayee().getAddress().getStreetName())
                       .streetNumber(storedPayment.getPayee().getAddress().getStreetNumber())
                       .city(storedPayment.getPayee().getAddress().getCity())
                       .country(storedPayment.getPayee().getAddress().getCountry())
                       .postalCode(storedPayment.getPayee().getAddress().getPostalCode())
                       .totalPaid(totalPrice)
                       .itemID(storedPayment.getAuction().getItem().getItemId())
                       .shippingDate(storedPayment.getExpectedDeliveryDate())
                       .message("Receipt generated.  ")
                       .build();
               return receiptResponse;

          } catch (Exception e) {
               return ReceiptResponseDTO.builder()
                       .message("Receipt can't be generated: " + e.getMessage())
                       .build();
          }
     }

     private static BigDecimal getBigDecimal(Payment storedPayment, Long userId) {
          List<Bid> allAuctionBids = storedPayment.getAuction().getBids();
          int highestBidAmount = 0;
          for (Bid bid : allAuctionBids) {
               if (bid.getBidder().getUserId().equals(userId)) {
                    highestBidAmount = Math.max(highestBidAmount, bid.getAmount());
               }
          }
          BigDecimal finalBasePrice = BigDecimal.valueOf(highestBidAmount);
          BigDecimal baseShipCost = storedPayment.getAuction().getItem().getBaseShipCost();
          BigDecimal expeditedCost = storedPayment.getAuction().getItem().getExpeditedCost();
          BigDecimal totalPrice = finalBasePrice.add(baseShipCost);
          if(storedPayment.isExpedited()){
               totalPrice = totalPrice.add(expeditedCost);
          }
          return totalPrice;
     }
}
