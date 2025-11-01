package com.eecs4413.auction_platform.service;

import com.eecs4413.auction_platform.dto.*;
import com.eecs4413.auction_platform.model.Auction;
import com.eecs4413.auction_platform.model.Payment;
import com.eecs4413.auction_platform.model.User;
import com.eecs4413.auction_platform.repository.AuctionRepository;
import com.eecs4413.auction_platform.repository.PaymentRepository;
import com.eecs4413.auction_platform.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

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

     public PaymentDetailDTO getPaymentDetails(Long paymentID) {
          Payment payment = paymentRepository.findById(paymentID).orElseThrow(
                  () -> new IllegalArgumentException("Payment not found")
          );
          return convertToPaymentDetailDTO(payment);
     }
     private PaymentDetailDTO convertToPaymentDetailDTO(Payment payment){
          return PaymentDetailDTO.builder()
                  .paymentID(payment.getPaymentID())
                  .auction(payment.getAuction())
                  .payee(payment.getPayee())
                  .paymentDate(payment.getPaymentDate())
                  .expectedDeliveryDate(payment.getExpectedDeliveryDate())
                  .build();
     }
     @Transactional
     public PaymentResponseDTO placePayment(PaymentRequestDTO paymentRequestDTO){
          try{
               Auction auction = auctionRepository.findById(paymentRequestDTO.getAuctionID())
                       .orElseThrow(() -> new IllegalArgumentException("Auction not found"));
               auction = auctionRepository.findById(auction.getAuctionId()).get();

               // Validate auction state
               OffsetDateTime now = OffsetDateTime.now();
               if (auction.getEndsAt().isAfter(now)) {
                    throw new IllegalStateException("Auction is ongoing!\nYou can't place a payment yet.  ");
               }
               // Find payee
               User payee = userRepository.findById(paymentRequestDTO.getUser().getUserId())
                       .orElseThrow(() -> new IllegalArgumentException("Payee not found"));

               // Save Payment
               Payment payment = Payment.builder()
                       .paymentID(paymentRequestDTO.getPaymentID())
                       .auction(auction)
                       .payee(payee)
                       .paymentDate(OffsetDateTime.now())
                       .expectedDeliveryDate(OffsetDateTime.now().plusDays(7))
                       .build();
               createReceipt(payment);
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
     public ReceiptResponseDTO createReceipt(Payment payment){

          try {
               Payment storedPayment = paymentRepository.findById(payment.getPaymentID())
                       .orElseThrow(() -> new IllegalArgumentException("Payment not found.  "));
               BigDecimal totalPaid = BigDecimal.ZERO;
               ReceiptResponseDTO receiptResponse = ReceiptResponseDTO.builder()
                       .firstName(storedPayment.getPayee().getFirstName())
                       .lastName(storedPayment.getPayee().getLastName())
                       .streetName(storedPayment.getPayee().getAddress().getStreetName())
                       .streetNumber(storedPayment.getPayee().getAddress().getStreetNumber())
                       .city(storedPayment.getPayee().getAddress().getCity())
                       .country(storedPayment.getPayee().getAddress().getCountry())
                       .postalCode(storedPayment.getPayee().getAddress().getPostalCode())
                       .totalPaid(BigDecimal.valueOf(storedPayment.getPayee().getBids().getLast().getAmount()).add(storedPayment.getAuction().getItem().getBaseShipCost()))
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
}
