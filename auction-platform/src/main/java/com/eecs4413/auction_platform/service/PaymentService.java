package com.eecs4413.auction_platform.service;

import com.eecs4413.auction_platform.dto.*;
import com.eecs4413.auction_platform.model.Auction;
import com.eecs4413.auction_platform.model.Payment;
import com.eecs4413.auction_platform.model.User;
import com.eecs4413.auction_platform.repository.AuctionRepository;
import com.eecs4413.auction_platform.repository.PaymentRepository;
import com.eecs4413.auction_platform.repository.UserRepository;
import jakarta.transaction.Transactional;

import java.time.OffsetDateTime;

public class PaymentService {
     AuctionRepository auctionRepository;
     UserRepository userRepository;
     PaymentRepository paymentRepository;
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
               ReceiptResponseDTO receiptResponse = ReceiptResponseDTO.builder()
                       .firstName(payment.getPayee().getFirstName())
                       .lastName(payment.getPayee().getLastName())
                       .streetName(payment.getPayee().getAddress().getStreetName())
                       .streetNumber(payment.getPayee().getAddress().getStreetNumber())
                       .city(payment.getPayee().getAddress().getCity())
                       .country(payment.getPayee().getAddress().getCountry())
                       .postalCode(payment.getPayee().getAddress().getPostalCode())
                       .totalPaid(payment.getAuction().getItem().getExpeditedCost()) //Placeholder.  Not sure about total cost.
                       .itemID(payment.getAuction().getItem().getItemId())
                       .shippingDate(payment.getExpectedDeliveryDate())
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
