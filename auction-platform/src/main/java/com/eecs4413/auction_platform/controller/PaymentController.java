package com.eecs4413.auction_platform.controller;
import com.eecs4413.auction_platform.dto.PaymentDetailDTO;
import com.eecs4413.auction_platform.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auction")
public class PaymentController {
     private final PaymentService paymentService;

     public PaymentController(PaymentService paymentService){
          this.paymentService = paymentService;
     }

     @GetMapping("/{paymentId}")
     public ResponseEntity<PaymentDetailDTO> getPayment(@PathVariable Long paymentId){
          return ResponseEntity.ok(paymentService.getPaymentDetails(paymentId));
     }

}
