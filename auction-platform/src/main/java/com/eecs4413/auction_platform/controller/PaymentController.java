package com.eecs4413.auction_platform.controller;
import com.eecs4413.auction_platform.dto.PaymentDetailDTO;
import com.eecs4413.auction_platform.dto.PaymentRequestDTO;
import com.eecs4413.auction_platform.dto.PaymentResponseDTO;
import com.eecs4413.auction_platform.dto.ReceiptResponseDTO;
import com.eecs4413.auction_platform.model.Payment;
import com.eecs4413.auction_platform.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/payment")
public class PaymentController {
     private final PaymentService paymentService;

     public PaymentController(PaymentService paymentService){
          this.paymentService = paymentService;
     }

     @GetMapping("/{paymentId}")
     public ResponseEntity<PaymentDetailDTO> getPayment(@PathVariable Long paymentId){
          return ResponseEntity.ok(paymentService.getPaymentDetails(paymentId));
     }

     @PostMapping("/place")
     public ResponseEntity<PaymentResponseDTO> placePayment(@RequestBody PaymentRequestDTO request){
          return ResponseEntity.ok(paymentService.placePayment(request));
     }
     @PostMapping("/receipt")
     public ResponseEntity<ReceiptResponseDTO> createReceipt(@RequestBody Payment payment){
          return ResponseEntity.ok(paymentService.createReceipt(payment));
     }

}
